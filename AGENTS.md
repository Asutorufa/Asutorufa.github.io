# Repository Guidelines

## Scope

These instructions apply to the entire repository.

## Workflow

- Keep changes focused on the requested behavior and preserve unrelated user edits.
- Prefer `rg` and `rg --files` for searching.
- Use `npm run build` as the main verification command for the React blog.
- For frontend changes, run `npm run lint && npx tsc --noEmit && npx prettier --check .` from the web project directory when verification is requested.
- To automatically fix linting and formatting issues, run `npm run lint:fix && npx prettier --write .`.
- ESLint checks code quality and patterns, TypeScript verifies type safety, and Prettier checks consistent formatting.
- Do not run destructive Git commands such as `git reset --hard` or `git checkout --` unless explicitly requested.
- Use ASCII for code and generated docs unless a file already uses non-ASCII content or the content requires it.

## Browser Debugging

- Use Playwright for issues that depend on client-side hydration, layout, scrolling, portals, image previews, Mermaid rendering, or other browser-only behavior.
- Build or generate the site first when testing production output, then run `npm run react:preview -- --port 4173`; if that port is busy, Vite will choose the next available port.
- Prefer the system Chrome install for ad hoc Playwright checks to avoid requiring downloaded browsers:

  ```ts
  import { chromium } from "@playwright/test";

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  ```

- If a managed Playwright browser is needed, install it explicitly with `npx playwright install chromium`.
- Keep Playwright checks focused on observable behavior: query real DOM state, computed styles, screenshots, console errors, and network failures rather than relying only on static HTML.
- Close browsers and stop preview/dev servers before finishing. Do not commit screenshots, traces, videos, or other Playwright output unless they are intentionally requested.

## React And TypeScript

- Follow the existing React component style and TypeScript types.
- Extract reusable UI behavior into components under `src/components` instead of growing page or markdown wrapper components.
- Keep Markdown rendering concerns in `ArticleMarkdown`; move unrelated UI such as dialogs, previews, and toolbars into separate components.
- Use the shared `Icon` component for lucide icons instead of importing icon components directly throughout the app.
- Use `IconButton` for icon-only or icon-led buttons when the existing styling can be preserved with `className`.
- Keep browser-only APIs inside effects, event handlers, or code paths that do not run during server rendering.

## Styling

- Keep global app styles in `src/styles/app.css` unless a more specific local pattern already exists.
- Match the existing visual language: restrained blog UI, compact controls, subtle motion, and no decorative gradient/orb backgrounds.
- Ensure mobile layouts remain usable and that text and controls do not overlap.
- For dialogs and previews that must escape cards or transition containers, render them at the document root with a portal.

## Content And Assets

- Blog source posts live under `source/_posts`.
- Serve post images locally from `source/images/posts` rather than hotlinking external image URLs.
- Blog generation utilities live under `tools/react-blog`; prefer structured parsing or existing helpers over ad hoc string manipulation.
- Keep the HTML shell TSX-based instead of returning large string-concatenated templates.
