1. Reduce Code Duplication in Navigation (Header.astro)
   Current State: The navigation links ("Blog", "Projects", "Talks",
   "About") are hardcoded twice: once for the desktop view and once for the
   mobile menu.
   Improvement: Define the navigation links in a constant (e.g., in
   src/consts.ts or a new src/lib/navigation.ts) and map over them in
   Header.astro. This ensures the desktop and mobile menus always stay in
   sync.

2. Extract Logic to Utilities (BlogPostCard.astro)
   Current State: The reading time calculation (wordCount / 200) is
   hardcoded directly inside the component.
   Improvement: Move this logic to a reusable utility function, e.g.,
   src/lib/readingTime.ts. This makes it testable and reusable elsewhere
   (e.g., if you want to show reading time on the blog post page itself).

3. Improve Type Safety in UI Components (Button.astro)
   Current State: Button.astro uses [key: string]: any; for extra props.
   Improvement: Use HTMLAttributes from astro/types to provide strict type
   checking for standard HTML attributes (like type, disabled, aria-\*).

1 import type { HTMLAttributes } from 'astro/types';
2 interface Props extends HTMLAttributes<'button'>, HTMLAttributes<'a'>
3 // ... custom props
4 }

4. Modularize Icons (Header.astro)
   Current State: The "X" (Twitter) logo is an inline SVG string, while
   other icons use lucide-astro.
   Improvement: Extract the SVG into a dedicated component (e.g.,
   src/components/icons/XIcon.astro) or a shared icons file. This keeps the
   Header code clean and makes the icon reusable.

5. Refactor Mobile Menu Script (Header.astro)
   Current State: The mobile menu logic is a large inline IIFE script.
   Improvement: While is:inline is fine, the script handles many
   responsibilities (toggling classes, aria attributes, focus management).
   It could be cleaned up by moving it to a separate .ts file in
   src/scripts/ (imported with <script src="...">) or simply refactoring the
   inline script to be more declarative.

6. Centralize OG Image Logic (BaseHead.astro)
   Current State: The logic for determining the Open Graph image URL is
   written inline within BaseHead.astro.
   Improvement: Move this logic to a helper function in src/lib/seo.ts
   (e.g., getOgImage(pathname, siteBase)). This cleans up the head component
   and makes the logic testable.

7. Accessibility Improvements (Header.astro)
   Current State: The mobile menu prevents body scrolling but doesn't appear
   to trap focus (keep the user tabbing inside the menu when it's open).
   Improvement: Implement a focus trap for the mobile menu to ensure
   keyboard users don't tab out of the invisible menu into the background
   content.
