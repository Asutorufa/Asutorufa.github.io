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
