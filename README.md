# Aidan Goodyer — personal site

Source for [agoodyer.com](https://agoodyer.com/), my personal site and project archive.

The site uses a small, purpose-built static generator instead of a frontend framework. Biography, experience, and project metadata live in one JSON file; longer project pages can opt into Markdown; and the visual system lives in one CSS file. The generated pages contain no client-side JavaScript.

## Make an update

Requirements: Node.js 20 or newer.

```bash
npm ci
npm run dev
```

The development command validates the content, rebuilds `dist/`, and serves it at <http://localhost:8000>.

For a normal content change:

1. Edit `content/site.json` or a Markdown file referenced by a project record.
2. Run `npm run build`.
3. Review the generated page in `dist/` or through the local server.

The only build dependency is `marked`, used to render the long-form project pages.

## Build behavior

`scripts/build.mjs` validates required fields and local asset paths before writing the site. It then:

- renders the home page and any local project pages;
- copies the assets referenced by the content model;
- fingerprints the stylesheet for cache invalidation;
- adds the current Git commit to the footer;
- generates canonical and social metadata when `SITE_URL` is set;
- writes `llms.txt`, `robots.txt`, and `sitemap.xml` from the same content model.

Keeping those outputs derived from `site.json` avoids maintaining several versions of the portfolio by hand.

## What belongs where

```text
.
├── content/site.json       Biography, links, experience, and project records
├── content/projects/       Optional long-form project Markdown
├── assets/                 Images, logos, documents, icons, and social card
├── src/styles.css          Complete visual system
├── scripts/build.mjs       Validation and static HTML generation
└── .github/workflows/      GitHub Pages deployment
```

For a project record, `url` is its primary destination. `secondaryLinks` adds supporting destinations such as source code or a research artifact. A project with a `content` field is rendered as a local detail page and must use a local URL ending in `/`.

## Publish

The GitHub Actions workflow builds and deploys the site to GitHub Pages whenever a change reaches `main`. It supplies the production Pages URL through `SITE_URL`, which the generator uses for canonical URLs, social cards, the sitemap, and `llms.txt`.

GitHub Pages must be configured once with **Build and deployment → Source → GitHub Actions**.
