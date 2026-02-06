import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

export const prerender = false;

let redis: RedisClientType | null = null;
const MAX_SLUG_LENGTH = 200;
const RATE_WINDOW_SECONDS = 60;
const RATE_LIMIT_IP_SLUG = 5;
const RATE_LIMIT_IP = 20;

async function getRedis() {
  if (!redis) {
    redis = createClient({
      url: import.meta.env.REDIS_URL!
    });
    await redis.connect();
  }
  return redis;
}

function getClientIp(request: Request) {
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    return vercelIp.split(',')[0]?.trim() || 'unknown';
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  return realIp?.trim() || 'unknown';
}

function getAllowedOrigins() {
  const origins = new Set<string>();
  const siteUrl = import.meta.env.SITE_URL?.trim();
  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {
      console.warn('Invalid SITE_URL; origin enforcement may be disabled.');
    }
  }

  const vercelUrl = import.meta.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  return origins;
}

function isOriginAllowed(request: Request, allowedOrigins: Set<string>) {
  if (allowedOrigins.size === 0) {
    console.warn('No allowed origins configured; origin enforcement skipped.');
    return true;
  }

  const originHeader = request.headers.get('origin') || request.headers.get('referer');
  if (!originHeader) return false;

  try {
    const origin = new URL(originHeader).origin;
    return allowedOrigins.has(origin);
  } catch {
    return false;
  }
}

async function validateSlug(slug: string | undefined) {
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    return new Response(JSON.stringify({ error: 'Invalid slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const entry = await getEntry('blog', slug);
  if (!entry) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}

async function checkRateLimit(
  client: RedisClientType,
  key: string,
  limit: number,
  windowSeconds: number
) {
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, windowSeconds);
  }
  return count <= limit;
}

export const GET: APIRoute = async ({ params, request }) => {
  const { slug } = params;

  const slugError = await validateSlug(slug);
  if (slugError) return slugError;

  try {
    const client = await getRedis();

    // Get the like count
    const countStr = await client.get(`likes:${slug}`);
    const count = countStr ? parseInt(countStr, 10) : 0;

    // Check if this IP has already voted
    const ip = getClientIp(request);
    const hasVoted = (await client.get(`voted:${ip}:${slug}`)) === '1';

    return new Response(JSON.stringify({ count, hasVoted }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch likes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const { slug } = params;

  const slugError = await validateSlug(slug);
  if (slugError) return slugError;

  const allowedOrigins = getAllowedOrigins();
  if (!isOriginAllowed(request, allowedOrigins)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = await getRedis();

    // Get client IP
    const ip = getClientIp(request);

    // Rate limiting
    const ipSlugAllowed = await checkRateLimit(
      client,
      `rl:likes:ipslug:${ip}:${slug}`,
      RATE_LIMIT_IP_SLUG,
      RATE_WINDOW_SECONDS
    );
    if (!ipSlugAllowed) {
      return new Response(JSON.stringify({ error: 'Rate limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(RATE_WINDOW_SECONDS),
        },
      });
    }

    const ipAllowed = await checkRateLimit(
      client,
      `rl:likes:ip:${ip}`,
      RATE_LIMIT_IP,
      RATE_WINDOW_SECONDS
    );
    if (!ipAllowed) {
      return new Response(JSON.stringify({ error: 'Rate limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(RATE_WINDOW_SECONDS),
        },
      });
    }

    // Check if already voted
    const hasVoted = await client.get(`voted:${ip}:${slug}`);
    if (hasVoted) {
      return new Response(JSON.stringify({
        error: 'Already voted',
        success: false
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Increment the counter
    const count = await client.incr(`likes:${slug}`);

    // Mark this IP as voted with 30-day TTL (2592000 seconds)
    await client.set(`voted:${ip}:${slug}`, '1', { EX: 2592000 });

    return new Response(JSON.stringify({ count, success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error incrementing likes:', error);
    return new Response(JSON.stringify({
      error: 'Failed to increment likes',
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
