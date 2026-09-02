# Aidan Goodyer — personal site

A small, framework-free personal site. Structured content lives in one JSON file, long-form project pages can opt into Markdown, and the styling lives in one CSS file. The generated site contains no client-side JavaScript.

## Make an update

1. Edit `content/site.json`, or a Markdown file referenced by a project record.
2. Run `npm run build` to validate the content and generate `dist/`.
3. Open `dist/index.html`, or run `npm run dev` and visit `http://localhost:8000`.

Run `npm install` once after cloning. The only package is the build-time Markdown parser; Node 20 or newer is required.

## Publish

The workflow in `.github/workflows/deploy.yml` builds and publishes the site to GitHub Pages whenever a change reaches `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** once. The footer shows the build commit icon and short commit SHA; GitHub Actions supplies the SHA automatically.

## What belongs where

- `content/site.json` — biography, links, experience, and project records
- `content/projects/` — optional long-form Markdown linked from project records
- `assets/` — source images, logos, documents, the favicon, and the social preview card
- `src/styles.css` — all visual styling
- `scripts/build.mjs` — the small static HTML renderer

For projects, `url` is the primary destination. Add `secondaryLinks` when a project needs supporting destinations such as source code.

The build also generates `llms.txt`, `robots.txt`, and `sitemap.xml` from the same site data. Production URLs come from the `SITE_URL` value supplied by the deployment workflow.
