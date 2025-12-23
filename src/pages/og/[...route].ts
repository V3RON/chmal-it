import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

const entries = await getCollection("blog");
const pages = Object.fromEntries(
  entries.map(({ id, data }) => [
    `blog/${id}`,
    {
      title: data.title,
      description: data.description,
      image: data.heroImage,
    },
  ])
);

pages["index"] = {
  title: "Szymon Chmal",
  description: "Building the tools I wish I had for React Native.",
  image: undefined,
};

export const { getStaticPaths, GET } = OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: page.image?.fsPath ?? "./public/og-img.png",
      size: page.image ? [400] : [100],
    },
    bgImage: {
      path: "./public/og-bg.png",
    },
    padding: 80,
    font: {
      title: {
        size: 70,
        families: ["Inter"],
        weight: "Bold",
        color: [255, 255, 255],
        lineHeight: 1.1,
      },
      description: {
        size: 36,
        families: ["Inter"],
        weight: "Normal",
        color: [161, 161, 170],
        lineHeight: 1.5,
      },
    },
    fonts: [
      "./public/fonts/Inter-Bold.woff",
      "./public/fonts/Inter-Regular.woff",
    ],
    format: "WEBP",
  }),
});
