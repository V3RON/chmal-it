// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { imageService } from "@unpic/astro/service";

// https://astro.build/config
export default defineConfig({
  site: "https://chmal.it",
  image: {
    service: imageService(),
  },
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "tokyo-night",
      wrap: true,
    },
  },
  vite: {
    ssr: {
      external: ["sharp"],
    },
  },
});
