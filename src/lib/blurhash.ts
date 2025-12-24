
import { encode, decode } from 'blurhash';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Generates a Blurhash string from a local image file.
 */
export async function generateBlurhash(filePath: string): Promise<string> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  
  const image = sharp(absolutePath);
  const { width, height } = await image.metadata();
  
  // Resize to small generic size for hash calculation (speed vs quality)
  const componentX = 4;
  const componentY = 3;
  
  const { data, info } = await image
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, componentX, componentY);
}

/**
 * Generates a Data URI (base64) of a decoded Blurhash.
 * This is useful for passing to the `background` prop of unpic-img.
 */
export async function generateBlurhashPlaceholder(filePath: string): Promise<string> {
  const hash = await generateBlurhash(filePath);
  
  // Decode to a small generic size
  const width = 32;
  const height = 32;
  const pixels = decode(hash, width, height);
  
  // Convert raw pixels to PNG buffer using Sharp
  const pngBuffer = await sharp(Buffer.from(pixels), {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
  .png()
  .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}
