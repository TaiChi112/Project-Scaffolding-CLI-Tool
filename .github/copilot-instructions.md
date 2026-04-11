# Project Guidelines

## Architecture
- The CLI flow is split across `src/index.ts` (entrypoint), `src/prompts.ts` (interactive options), and `src/generator.ts` (filesystem scaffolding and post-copy setup).
- Treat `templates/frameworks/*` as the source of truth for generated projects. `src/generator.ts` copies one framework template first, then overlays selected folders from `templates/addons/*`.
- The checked-in `elysia/` app mirrors the `templates/frameworks/elysia-crud/` scaffold. When changing the Elysia template, keep the reference app aligned unless the task explicitly separates them.

## Build And Validation
- Use Bun for workspace commands. Install dependencies with `bun install`.
- The root workspace only defines `bun run dev`, which compiles `src/index.ts` and runs the compiled CLI.
- There is no real automated test suite at the root. For generator changes, validate by checking copy paths carefully and, when practical, scaffolding a sample project in a temporary directory.
- For Elysia template changes, use the generated app scripts defined in the template: `bun run dev`, `bun run db:push`, and `bun run db:studio`.

## Conventions
- Keep Bun and ESM assumptions intact unless the task is explicitly about runtime support. The generator relies on `import.meta.dir`, `bun install`, and `bunx prisma generate`.
- When renaming or moving framework or addon folders, update the matching path logic in `src/generator.ts` in the same change.
- Preserve the contract between `ProjectOptions` in `src/prompts.ts` and the branching logic in `src/generator.ts`.
- Addons are copied after the framework template and can overwrite files in the target project. Make collisions intentional and review overlay order before changing template contents.
- Root source changes should usually be mirrored by template or reference-app changes only when they affect generated output. Avoid editing generated-example files as a substitute for fixing the underlying template.
- Existing comments are mixed Thai and English. Preserve surrounding style, but new comments and documentation can be written in clear English.