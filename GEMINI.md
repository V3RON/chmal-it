# Project Context: Szymon Chmal's Personal Website (`chmal-it`)

## Overview

This is a personal portfolio and blog website for Szymon Chmal, a React Native Expert and Microsoft MVP. The site showcases his blog posts, conference talks, and open-source projects. It is built with **Astro** for performance and static site generation, styled with **Tailwind CSS**, and deployed as a static site.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) v5.x
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** Custom components, likely inspired by [shadcn/ui](https://ui.shadcn.com/), using `lucide-astro` for icons.
- **Content:** MDX (`@astrojs/mdx`) for rich content in blog posts.
- **State Management:** Minimal/None (mostly static), uses `nano stores` or simple scripts if needed.
- **Package Manager:** `bun` (implied by `bun.lock`).

## Key Directories & Files

### `src/`

- **`content/`**: The source of truth for all data.
  - `blog/`: Markdown/MDX files for blog posts.
  - `talks/`: Markdown/MDX files for conference talks.
  - `projects/`: Markdown/MDX files for portfolio projects.
- **`content.config.ts`**: Defines the schemas for content collections (`blog`, `talks`, `projects`) using Zod.
- **`pages/`**: File-based routing.
  - `index.astro`: The homepage.
  - `about.astro`: About me page.
  - `blog/[...slug].astro`: Dynamic blog post routes.
  - `projects.astro`: Portfolio listing.
  - `talks.astro`: Conference talks listing.
  - `og/[...route].ts`: Dynamic Open Graph image generation using `astro-og-canvas`.
- **`components/`**: Reusable UI components.
  - `ui/`: Lower-level UI components (Badge, Button, Card, Separator).
  - `Header.astro`, `Footer.astro`: Site-wide layout components.
  - `ThemeToggle.astro`: Dark/Light mode switcher.
- **`layouts/`**:
  - `BaseLayout.astro`: The main HTML wrapper used by pages.
- **`styles/`**:
  - `global.css`: Global styles and Tailwind directives.

### Configuration

- **`astro.config.mjs`**: Astro configuration (integrations: MDX, Sitemap, Tailwind).
- **`tailwind.config.mjs`**: Tailwind configuration, including custom colors (HSL variables) and fonts (Inter, JetBrains Mono).
- **`src/consts.ts`**: Site-wide constants like `SITE_TITLE` and `SITE_DESCRIPTION`.

## Content Collections

The site heavily relies on Astro Content Collections. Schemas are defined in `src/content.config.ts`:

1.  **Blog**: `title`, `description`, `pubDate`, `updatedDate`, `heroImage`.
2.  **Talks**: `title`, `description`, `date`, `event`, `location`, `slides` (URL), `video` (URL).
3.  **Projects**: `title`, `description`, `repoUrl`, `demoUrl`, `logo`, `techStack` (Array), `featured` (Boolean).

## Development Commands

| Command                               | Description                                         |
| :------------------------------------ | :-------------------------------------------------- |
| `npm run dev` / `bun run dev`         | Start the local development server.                 |
| `npm run build` / `bun run build`     | Build the site for production (outputs to `dist/`). |
| `npm run preview` / `bun run preview` | Preview the built site locally.                     |
| `npm run astro`                       | Run the Astro CLI directly.                         |

## Common Tasks

- **Adding a Blog Post**: Create a new `.md` or `.mdx` file in `src/content/blog/`.
- **Adding a Talk**: Create a new file in `src/content/talks/`.
- **Adding a Project**: Create a new file in `src/content/projects/`.
- **Modifying Styles**: Edit `src/styles/global.css` or `tailwind.config.mjs`. Use Tailwind utility classes in components.
