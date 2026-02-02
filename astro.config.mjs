// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://chmal.it",
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
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