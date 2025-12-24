import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";

export async function getStaticPaths() {
  const blogEntries = await getCollection("blog");

  const paths = blogEntries.map((entry) => ({
    params: { route: `blog/${entry.id}.webp` },
    props: {
      title: entry.data.title,
      description: entry.data.description,
      layout: "blog",
    },
  }));

  // Generic one for all other pages
  paths.push({
    params: { route: "default.webp" },
    props: {
      title: "Szymon Chmal",
      description: "Building the tools I wish I had for React Native.",
      layout: "profile",
    },
  });

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description, layout = "blog" } = props;

  // Load fonts
  const fontRegular = await fs.readFile(
    path.join(process.cwd(), "public/fonts/Inter-Regular.woff")
  );
  const fontBold = await fs.readFile(
    path.join(process.cwd(), "public/fonts/Inter-Bold.woff")
  );

  // Load images
  const bgImageBuffer = await fs.readFile(
    path.join(process.cwd(), "public/og-bg.png")
  );
  const bgImageBase64 = `data:image/png;base64,${bgImageBuffer.toString("base64")}`;

  const profileBuffer = await fs.readFile(
    path.join(process.cwd(), "public/profile.png")
  );
  const profileBase64 = `data:image/png;base64,${profileBuffer.toString("base64")}`;

  let markup;

  if (layout === "profile") {
    // Profile Layout: Big avatar above header, centered
    markup = html`
      <div
        style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 1200px;
        height: 630px;
        background-color: #18181b;
        background-image: url('${bgImageBase64}');
        background-size: cover;
        background-position: center;
        color: white;
        padding: 80px;
        font-family: 'Inter';
        text-align: center;
      "
      >
        <img
          src="${profileBase64}"
          style="
            width: 250px;
            height: 250px;
            border-radius: 50%;
            margin-bottom: 40px;
            border: 4px solid rgba(255,255,255,0.2);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          "
        />

        <div
          style="display: flex; flex-direction: column; gap: 10px; max-width: 900px; align-items: center;"
        >
          <h1
            style="
            font-size: 70px;
            font-weight: 700;
            margin: 0;
            line-height: 1.1;
            text-shadow: 0 4px 10px rgba(0,0,0,0.3);
          "
          >
            ${title}
          </h1>
          <p
            style="
            font-size: 32px;
            font-weight: 400;
            color: #a1a1aa;
            margin: 0;
            line-height: 1.5;
            text-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "
          >
            ${description}
          </p>
        </div>

        <div
          style="
          margin-top: 40px;
          font-size: 24px;
          font-weight: 700;
          color: white;
          opacity: 0.8;
        "
        >
          chmal.it
        </div>
      </div>
    `;
  } else {
    // Blog Layout (Default)
    markup = html`
      <div
        style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 1200px;
        height: 630px;
        background-color: #18181b;
        background-image: url('${bgImageBase64}');
        background-size: cover;
        background-position: center;
        color: white;
        padding: 80px;
        font-family: 'Inter';
      "
      >
        <div
          style="display: flex; flex-direction: column; gap: 20px; max-width: 900px;"
        >
          <h1
            style="
            font-size: 70px;
            font-weight: 700;
            margin: 0;
            line-height: 1.1;
            text-shadow: 0 4px 10px rgba(0,0,0,0.3);
          "
          >
            ${title}
          </h1>
          <p
            style="
            font-size: 36px;
            font-weight: 400;
            color: #a1a1aa;
            margin: 0;
            line-height: 1.5;
            text-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "
          >
            ${description}
          </p>
        </div>

        <div
          style="
          position: absolute;
          bottom: 80px;
          right: 80px;
          display: flex;
          align-items: center;
        "
        >
          <img
            src="${profileBase64}"
            style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 16px;
            border: 2px solid rgba(255,255,255,0.2);
          "
          />
          <div
            style="
            font-size: 24px;
            font-weight: 700;
            color: white;
            opacity: 0.8;
          "
          >
            chmal.it
          </div>
        </div>
      </div>
    `;
  }

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: fontRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: fontBold,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const webpBuffer = await sharp(Buffer.from(svg)).webp().toBuffer();
  const responseArray = new Uint8Array(webpBuffer);

  return new Response(responseArray, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
