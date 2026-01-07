# Scrapewave — Project Onboarding & Overview

This document is a complete, beginner-friendly guide to the Scrapewave repository. Read it from top to bottom and you'll understand what the project is, its current state, how the code is organized, how to run it locally, and how to contribute.

If anything in this document is out-of-date after you read it (scripts, environment variable names, etc.), update this file in a pull request so future new contributors don't hit the same surprises.

---

## Quick facts

- Repository: whothemyst-byte/scrapewave  
- Repo homepage: https://scrapewave.vercel.app (set in repository metadata)  
- Default branch: `main`  
- Primary language: TypeScript (project appears to be a TypeScript front-end app)  
- Other notable languages: PLpgSQL (Supabase functions/SQL), JavaScript, CSS, HTML  
- Key tools present: Vite, Tailwind CSS, PostCSS, ESLint, TypeScript, Supabase (folder present)  
- Recent activity: repository was pushed to recently (active development as of the repository metadata)

Key repository files you should inspect:
- [README.md](https://github.com/whothemyst-byte/scrapewave/blob/main/README.md) — existing project README (start here)
- [package.json](https://github.com/whothemyst-byte/scrapewave/blob/main/package.json) — scripts and dependencies
- [vite.config.ts](https://github.com/whothemyst-byte/scrapewave/blob/main/vite.config.ts) — Vite configuration
- [tailwind.config.ts](https://github.com/whothemyst-byte/scrapewave/blob/main/tailwind.config.ts) — Tailwind config
- [tsconfig.json](https://github.com/whothemyst-byte/scrapewave/blob/main/tsconfig.json) — TypeScript config
- [postcss.config.js](https://github.com/whothemyst-byte/scrapewave/blob/main/postcss.config.js) — PostCSS setup
- [eslint.config.js](https://github.com/whothemyst-byte/scrapewave/blob/main/eslint.config.js) — linter config
- [.env](https://github.com/whothemyst-byte/scrapewave/blob/main/.env) — environment variables (inspect, but never commit secrets)
- [bun.lockb](https://github.com/whothemyst-byte/scrapewave/blob/main/bun.lockb) and [package-lock.json](https://github.com/whothemyst-byte/scrapewave/blob/main/package-lock.json) — lockfiles (suggests either Bun or npm could be used)
- Directories: `/src`, `/public`, `/supabase` — source, static assets, and DB/functions/SQL

---

## Project purpose and high-level description

Scrapewave appears to be a web application built with TypeScript + Vite + Tailwind that interacts with a Supabase backend. The repository contains front-end configuration and a `supabase` directory (likely holding SQL definitions, functions or configuration for the Supabase database). The project is deployed (or intended to be deployed) to Vercel (homepage shows a vercel.app URL in repo metadata).

The app's domain name and exact UI/feature list should be visible in the app itself (running it locally or checking the deployed site). Read the code under `/src` to learn the precise features and routes.

---

## Current project stage (what I observed)

- Build tooling and configuration files are present (Vite, Tailwind, TypeScript, ESLint, PostCSS).
- Supabase integration is present (there's a `supabase` folder and PLpgSQL files in repo language breakdown), suggesting a database-backed app.
- Lockfiles for both Bun and npm are present, which can indicate either preference for Bun or npm or both.
- There's a project homepage set — likely deployed successfully to Vercel.
- No open issues shown in repository metadata (0 open issues). No stars or forks (early stage / small community).
- Overall status: an early-to-mid stage front-end project with infrastructure and deployment configured; ready for local development and feature work but may need documentation and contribution process improvements (this document aims to help).

---

## Repo layout and important files (what each one does)

Top-level (key entries)
- `.env` — environment variables (local secrets). Do not commit credentials. Create a local `.env` with needed keys.
  - Inspect this file to see what environment variables are expected. If it contains real secrets, rotate them and replace with a `.env.example` in the repo.
- `.gitignore` — files ignored by Git.
- `README.md` — current project README (read it and copy or extend it into this onboarding if necessary).
- `package.json` — dependency list and scripts. Always open it to see available NPM/Bun scripts (dev, build, start, lint, test, etc.).
- `package-lock.json` and `bun.lockb` — lockfiles (choose either Bun or npm/yarn workflow; use consistent tooling).
- `vite.config.ts` — Vite config for dev server, build, and aliases.
- `tailwind.config.ts` — Tailwind configuration and custom theme settings.
- `postcss.config.js` — PostCSS plugins for CSS processing.
- `eslint.config.js` — Linting rules and config.
- `index.html` — base HTML file for the Vite app.
- `src/` — front-end source code (components, pages, routes). This is where you will spend most of your time implementing features and fixes.
- `public/` — static assets served unchanged (images, icons, etc.).
- `supabase/` — SQL or Supabase-specific definitions (functions, triggers, migrations, seed data). Important for backend/data structure.
- `tsconfig*.json` — TypeScript configuration files.

Where to look first:
1. Open [package.json](https://github.com/whothemyst-byte/scrapewave/blob/main/package.json) to see the scripts and how to run the project (dev/build/test).
2. Explore `/src` to see the application code, routing, and components.
3. Inspect `supabase/` to understand database schemas, functions, and migrations used by the app.
4. Check `.env` to know what secrets/keys are required for local run (Supabase keys, third-party API keys, etc.)

---

## Local development: recommended quickstart

These steps are intentionally generic because the exact script names in `package.json` may vary; open `package.json` and confirm the script names (common ones below):

Prerequisites
- Node.js (LTS recommended) or Bun (if you prefer Bun; repo has `bun.lockb`)
- Git
- A Supabase project if local development requires a remote DB (or run Supabase locally if configured)
- Environment variables from `.env` (create `.env` from an example or from the deployed environment values)

Typical commands (replace with actual script names from `package.json` if different)
1. Clone the repo
   - git clone https://github.com/whothemyst-byte/scrapewave.git
   - cd scrapewave
2. Install dependencies
   - Using npm: npm install
   - Using bun: bun install
3. Create a local `.env`
   - Copy `.env` or create `.env.local` from `.env.example` if you add one. Fill required keys (Supabase URL/Key, any third-party API keys).
4. Start the dev server
   - npm run dev
   - or bun run dev
   - The project likely uses Vite — dev server will usually run on http://localhost:5173 (confirm output).
5. Build for production (to test build step)
   - npm run build
   - npm run preview (if present) to serve the local built site
6. Lint/test/format
   - npm run lint
   - npm run format
   - npm run test (only if tests are present)

If the app requires Supabase:
- If the env requires SUPABASE_URL and SUPABASE_ANON_KEY, create a free Supabase project and place the values in `.env`.
- Apply migrations or run SQL in the `supabase/` folder if those files exist and are required for the app to function.

Troubleshooting tips:
- If you see errors about missing env vars, check `.env` and the [supabase folder](https://github.com/whothemyst-byte/scrapewave/tree/main/supabase).
- If the dev server fails, read the terminal output — Vite errors are usually explicit (missing import, wrong tsconfig paths, etc.).
- If using Bun, ensure compatibility of tooling (some dev dependencies may assume Node).

---

## Coding conventions and tooling

- TypeScript is used — follow strictness set in `tsconfig.json`.
- Tailwind is used for styling — follow the design and utility classes defined in `tailwind.config.ts`.
- ESLint is configured — run lint before committing and follow its suggestions.
- PostCSS configuration indicates post-processing for CSS (autoprefixer, etc.).
- Tests: I did not see test configuration files in the top-level metadata, so there may be no automated tests currently. Check `package.json` for `test` script.

---

## Supabase / Database notes

- The repository’s language breakdown includes PLpgSQL which suggests SQL functions or migrations are present in `supabase/`. Inspect that folder to learn about:
  - Database schema and migrations
  - SQL functions or triggers used by the app
  - Seed scripts you might need to run locally
- If you plan to modify the database, coordinate migration steps and version the migrations in the `supabase` folder.

---

## Deployment

- Project metadata includes a homepage set to `https://scrapewave.vercel.app` (Vercel).
- Typical deployment steps for such a repo:
  1. Build with the `build` script
  2. Deploy to Vercel or another static host (Vercel provides seamless integration with GitHub)
  3. Add environment variables to the Vercel dashboard (mirror the local `.env` keys)
- If the repo uses serverless functions or Supabase edge functions, confirm those are set up in the deployment environment.

---

## Contribution workflow (recommended)

1. Create a new branch for each feature or bugfix:
   - git checkout -b feat/<short-description> or git checkout -b fix/<short-description>
2. Follow code style and lint rules. Run `npm run lint` and `npm run format`.
3. Keep commits small and focused. Use descriptive commit messages.
4. Open a pull request to `main` when the feature is ready. Include:
   - A short summary of changes
   - Steps to test locally
   - Any required env var changes
5. Maintainers should run the app locally, review code, and merge after approval.

Tip: Add a CONTRIBUTING.md if none exists. Include code style rules, tests, and PR checklist.

---

## Recommended immediate improvements (low-effort, high-impact)

- Add a `CONTRIBUTING.md` with these steps and an explicit commit/PR checklist.
- Add a `.env.example` file listing required environment variables (no secrets).
- Add or update README.md with quickstart commands and a short project description (this onboarding can be merged into or referenced by README).
- Consider removing one lockfile if only one package manager will be supported—prefer a single consistent workflow (npm or Bun).
- Add tests and a CI pipeline that runs lint/build on PRs (e.g., GitHub Actions).
- Add `SUPABASE_README.md` inside `supabase/` to document database schema and migration instructions.

---

## Where to look for more details (links)

- Project README (start here): [README.md](https://github.com/whothemyst-byte/scrapewave/blob/main/README.md)  
- package.json (scripts & deps): [package.json](https://github.com/whothemyst-byte/scrapewave/blob/main/package.json)  
- Vite config: [vite.config.ts](https://github.com/whothemyst-byte/scrapewave/blob/main/vite.config.ts)  
- Tailwind config: [tailwind.config.ts](https://github.com/whothemyst-byte/scrapewave/blob/main/tailwind.config.ts)  
- ESLint config: [eslint.config.js](https://github.com/whothemyst-byte/scrapewave/blob/main/eslint.config.js)  
- PostCSS config: [postcss.config.js](https://github.com/whothemyst-byte/scrapewave/blob/main/postcss.config.js)  
- Environment variables: [.env](https://github.com/whothemyst-byte/scrapewave/blob/main/.env)  
- Supabase folder: [supabase/](https://github.com/whothemyst-byte/scrapewave/tree/main/supabase)

---

## Example day-1 checklist for a new contributor

1. Fork the repo and clone locally.
2. Inspect `package.json` to find `dev` and `build` script names.
3. Create `.env` using `.env` or `.env.example` (if present) and populate required values (Supabase keys, etc.).
4. Run `npm install` (or `bun install`) and `npm run dev`.
5. Open the app in a browser and click through functionality to understand current behavior.
6. Pick a small issue or an improvement from the recommended list (e.g., add `.env.example`) and create a branch to implement it.
7. Open a PR and link to this onboarding to help reviewers.

---

## Final notes

- This project has most of the standard front-end infrastructure in place; your first tasks are likely documentation, small bug fixes, or feature additions.
- If you want, I can:
  - Add this file to the repository (name and location of your choice).
  - Create a `CONTRIBUTING.md` or `.env.example` and open a PR for review.
  - Generate a checklist of specific low-risk issues you could start with (doc updates, linting fixes, small UI tweaks).
- Keep sensitive keys out of source control. If any secret was committed accidentally, rotate the secret immediately.

Thanks — tell me how you'd like this file added to the repo (filename and path), and I can create the commit or open a branch for you.