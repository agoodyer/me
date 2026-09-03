import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const execFileAsync = promisify(execFile);
const repositoryUrl = "https://github.com/agoodyer/me";

const getBuildRevision = async () => {
  const workflowRevision = process.env.GITHUB_SHA;
  if (workflowRevision) return workflowRevision.slice(0, 7);

  try {
    const { stdout } = await execFileAsync(
      "git",
      ["rev-parse", "--short=7", "HEAD"],
      { cwd: root },
    );
    return stdout.trim();
  } catch {
    return "local";
  }
};

const buildRevision = await getBuildRevision();
const stylesheet = await readFile(path.join(root, "src/styles.css"));
const stylesheetVersion = createHash("sha256")
  .update(stylesheet)
  .digest("hex")
  .slice(0, 10);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isExternal = (url) => /^https?:\/\//.test(url);

const linkHref = (url) =>
  isExternal(url) || url.startsWith("mailto:") ? url : `./${url}`;

const linkAttributes = (url, forceNewTab = false) =>
  isExternal(url) || forceNewTab
    ? ' target="_blank" rel="noreferrer"'
    : "";

const externalMark = (url) =>
  isExternal(url)
    ? '<span class="external-mark" aria-hidden="true"></span><span class="sr-only"> (opens in a new tab)</span>'
    : "";

const tags = (items) => `
  <ul class="tag-list" aria-label="Technologies">
    ${items.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("\n    ")}
  </ul>`;

const requireFields = (item, fields, label) => {
  for (const field of fields) {
    if (!item[field]) throw new Error(`${label} is missing “${field}”.`);
  }
};

const content = JSON.parse(
  await readFile(path.join(root, "content/site.json"), "utf8"),
);

const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
const publicSiteUrl = siteUrl ?? "http://localhost:8000";
const publicHref = (url = "") => {
  if (isExternal(url) || url.startsWith("mailto:")) return url;
  return `${publicSiteUrl}/${url.replace(/^\.\//, "")}`;
};
const socialMeta = siteUrl
  ? `
    <link rel="canonical" href="${escapeHtml(siteUrl)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(content.name)} — ${escapeHtml(content.role)}">
    <meta property="og:description" content="${escapeHtml(content.intro)}">
    <meta property="og:url" content="${escapeHtml(siteUrl)}">
    <meta property="og:image" content="${escapeHtml(`${siteUrl}/assets/og.png`)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(content.name)} — ${escapeHtml(content.role)}">
    <meta name="twitter:description" content="${escapeHtml(content.intro)}">
    <meta name="twitter:image" content="${escapeHtml(`${siteUrl}/assets/og.png`)}">`
  : "";

requireFields(content, ["name", "role", "intro", "portrait"], "Site content");
content.links.forEach((item, index) =>
  requireFields(item, ["label", "url", "icon"], `Social link ${index + 1}`),
);
content.experience.forEach((item, index) =>
  requireFields(
    item,
    ["company", "role", "period", "url", "logo", "description", "tags"],
    `Experience ${index + 1}`,
  ),
);
content.projects.forEach((item, index) => {
  requireFields(
    item,
    ["title", "url", "image", "imageAlt", "description", "tags"],
    `Project ${index + 1}`,
  );
  (item.secondaryLinks ?? []).forEach((link, linkIndex) =>
    requireFields(
      link,
      ["label", "url", "icon"],
      `Project ${index + 1} secondary link ${linkIndex + 1}`,
    ),
  );
});

content.projects
  .filter((item) => item.content)
  .forEach((item, index) => {
    if (isExternal(item.url)) {
      throw new Error(`Markdown project ${index + 1} must use a local URL.`);
    }
    if (!item.url.endsWith("/")) {
      throw new Error(`Markdown project ${index + 1} URL must end with “/”.`);
    }
  });

const visibleProjects = content.projects.filter((item) => item.hidden !== true);
const visibleProfiles = content.links.filter((item) => item.url !== "404");

const llmsProjectLinks = visibleProjects
  .map((item) => {
    const supportingLinks = (item.secondaryLinks ?? [])
      .map((link) => `[${link.label}](${publicHref(link.url)})`)
      .join(" · ");
    return `- [${item.title}](${publicHref(item.url)}): ${item.description}${supportingLinks ? ` ${supportingLinks}.` : ""}`;
  })
  .join("\n");

const llmsProfileLinks = visibleProfiles
  .map((item) => `- [${item.label}](${publicHref(item.url)})`)
  .join("\n");

const llms = `# ${content.name}

> ${content.intro}

This is the personal portfolio of ${content.name}, a ${content.role.toLowerCase()}. It contains a biography, professional experience, and selected software and engineering projects.

## Site

- [Home](${publicHref()}): Biography, professional experience, selected projects, and contact links.

## Selected projects

${llmsProjectLinks}

## Profiles and contact

${llmsProfileLinks}
`;

const localRoutes = [
  "",
  ...visibleProjects
    .filter((item) => item.content)
    .map((item) => item.url.replace(/^\.\//, "")),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${localRoutes
  .map((route) => `  <url><loc>${escapeHtml(publicHref(route))}</loc></url>`)
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${publicHref("sitemap.xml")}
`;

const sourceAssets = [
  content.portrait.src,
  "assets/favicon.svg",
  "assets/og.png",
  "assets/icons/git-commit.svg",
  "assets/icons/external-link.svg",
  ...content.links.map((item) => item.icon),
  ...content.experience.map((item) => item.logo),
  ...content.projects.flatMap((item) => [
    item.image,
    ...(item.secondaryLinks ?? []).map((link) => link.icon),
    ...(item.content ? [item.content] : isExternal(item.url) ? [] : [item.url]),
  ]),
];

await Promise.all(
  sourceAssets.map(async (asset) => {
    const resolved = path.resolve(root, asset);
    if (!resolved.startsWith(`${root}${path.sep}`)) {
      throw new Error(`Asset path leaves the project: ${asset}`);
    }
    try {
      await access(resolved);
    } catch {
      throw new Error(`Referenced asset does not exist: ${asset}`);
    }
  }),
);

const experiences = content.experience
  .filter((item) => item.hidden !== true)
  .map(
    (item) => `
      <li class="entry">
        <p class="entry-period">${escapeHtml(item.period)}</p>
        <article>
          <div class="entry-heading">
            <img class="company-logo" src="./${escapeHtml(item.logo)}" alt="" width="34" height="34" loading="lazy">
            <h3>
              <a href="${escapeHtml(item.url)}"${linkAttributes(item.url)}>${escapeHtml(item.role)} <span class="company">at ${escapeHtml(item.company)}</span>${externalMark(item.url)}</a>
            </h3>
          </div>
          <p class="entry-description">${escapeHtml(item.description)}</p>
          ${tags(item.tags)}
        </article>
      </li>`,
  )
  .join("");

const projectSecondaryLinks = (item) => {
  const visibleLinks = (item.secondaryLinks ?? []).filter(
    (link) => link.showOnProjectCard !== false,
  );
  if (!visibleLinks.length) return "";

  return `
            <ul class="project-secondary-links" aria-label="More links for ${escapeHtml(item.title)}">
              ${visibleLinks
                .map((link) => {
                  const opensInNewTab = isExternal(link.url) || link.newTab === true;
                  const accessibleLabel = opensInNewTab
                    ? `${link.label} for ${item.title} (opens in a new tab)`
                    : `${link.label} for ${item.title}`;
                  return `<li><a class="project-secondary-link" href="${escapeHtml(linkHref(link.url))}" aria-label="${escapeHtml(accessibleLabel)}" title="${escapeHtml(link.label)}"${linkAttributes(link.url, link.newTab === true)}><span class="project-link-icon" style="--icon: url('./${escapeHtml(link.icon)}')" aria-hidden="true"></span></a></li>`;
                })
                .join("")}
            </ul>`;
};

const projectActionLinks = (item) => {
  if (!item.secondaryLinks?.length) return "";

  return `
            <ul class="project-actions" aria-label="Project links">
              ${item.secondaryLinks
                .map((link) => {
                  const opensInNewTab = isExternal(link.url) || link.newTab === true;
                  const accessibleLabel = opensInNewTab
                    ? `${link.label} (opens in a new tab)`
                    : link.label;
                  return `<li><a class="project-action" href="${escapeHtml(linkHref(link.url))}" aria-label="${escapeHtml(accessibleLabel)}"${linkAttributes(link.url, link.newTab === true)}><span class="project-link-icon" style="--icon: url('./${escapeHtml(link.icon)}')" aria-hidden="true"></span><span>${escapeHtml(link.label)}</span></a></li>`;
                })
                .join("")}
            </ul>`;
};

const projectItem = (item) => `
      <li class="project">
        <img class="project-image${item.imageFit === "contain" ? " project-image--contain" : ""}" src="./${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="112" height="82" loading="lazy">
        <article>
          <div class="project-heading">
            <h3>
              <a href="${escapeHtml(linkHref(item.url))}"${linkAttributes(item.url)}>${escapeHtml(item.title)}${externalMark(item.url)}</a>
            </h3>${projectSecondaryLinks(item)}
          </div>
          <p class="project-description">${escapeHtml(item.description)}</p>
          ${tags(item.tags)}
        </article>
      </li>`;

const projects = `
  <ol class="entry-list">
    ${visibleProjects.map(projectItem).join("")}
  </ol>`;

const links = content.links
  .map(
    (item) => {
      const accessibleLabel = isExternal(item.url)
        ? `${item.label} (opens in a new tab)`
        : item.label;
      const iconClass = `social-icon--${item.label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
      return `<li><a class="social-link" href="${escapeHtml(linkHref(item.url))}" aria-label="${escapeHtml(accessibleLabel)}" title="${escapeHtml(item.label)}"${linkAttributes(item.url)}><span class="social-icon ${iconClass}" style="--icon: url('./${escapeHtml(item.icon)}')" aria-hidden="true"></span></a></li>`;
    },
  )
  .join("\n              ");

const about = content.about
  .map((paragraph) => {
    const contents = paragraph
      .map((part) => {
        if (typeof part === "string") return escapeHtml(part);
        const label = escapeHtml(part.text);
        const url = escapeHtml(part.url);
        return `<a href="${url}"${linkAttributes(part.url)}>${label}<span class="sr-only"> (opens in a new tab)</span></a>`;
      })
      .join("");
    return `<p>${contents}</p>`;
  })
  .join("\n          ");

const sameAsLinks = visibleProfiles
  .filter((item) => isExternal(item.url))
  .map((item) => item.url);

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: content.name,
  url: `${publicSiteUrl}/`,
  image: `${publicSiteUrl}/${content.portrait.src}`,
  jobTitle: content.role,
  sameAs: sameAsLinks,
};

const personJsonLd = `
    <script type="application/ld+json">
${JSON.stringify(personSchema, null, 2)
  .replace(/</g, "\\u003c")
  .split("\n")
  .map((line) => `      ${line}`)
  .join("\n")}
    </script>`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(content.intro)}">
    <meta name="theme-color" content="#f8f7f3">
    <meta name="robots" content="index, follow">
    <title>${escapeHtml(content.name)} — ${escapeHtml(content.role)}</title>${socialMeta}${personJsonLd}
    <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
    <link rel="alternate" type="text/plain" href="./llms.txt" title="LLM-readable site summary">
    <link rel="stylesheet" href="./styles.css?v=${stylesheetVersion}">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="page">
      <header class="intro">
        <img class="portrait" src="./${escapeHtml(content.portrait.src)}" alt="${escapeHtml(content.portrait.alt)}" width="128" height="128">
        <h1>${escapeHtml(content.name)}</h1>
        <p class="intro-copy">${escapeHtml(content.intro)}</p>
        <ul class="link-list" aria-label="Contact and profiles">
          ${links}
        </ul>
      </header>

      <main id="main">
        <section id="about" aria-labelledby="about-heading">
          <h2 id="about-heading">About</h2>
          <div class="about-copy">
            ${about}
          </div>
        </section>

        <section id="experience" aria-labelledby="experience-heading">
          <h2 id="experience-heading">Experience</h2>
          <ol class="entry-list">
            ${experiences}
          </ol>
        </section>

        <section id="projects" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Projects</h2>
          ${projects}
        </section>
      </main>

      <footer>
        <p>© ${new Date().getFullYear()} ${escapeHtml(content.name)}</p>
        <a class="build-info" href="${repositoryUrl}" target="_blank" rel="noreferrer" aria-label="View this site's source repository and build commit ${escapeHtml(buildRevision)}" title="View source repository · commit ${escapeHtml(buildRevision)}">
          <span class="build-icon" aria-hidden="true"></span>
          <span>${escapeHtml(buildRevision)}</span>
          <span class="external-mark" aria-hidden="true"></span>
        </a>
      </footer>
    </div>
  </body>
</html>
`;

const projectPages = await Promise.all(
  content.projects
    .filter((item) => item.content && item.hidden !== true)
    .map(async (item) => {
      const route = item.url.replace(/^\.\//, "").replace(/\/$/, "");
      const routeParts = route.split("/").filter(Boolean);
      if (
        routeParts.length === 0 ||
        routeParts.some((part) => part === "." || part === "..")
      ) {
        throw new Error(`Unsafe project URL: ${item.url}`);
      }

      const source = await readFile(path.resolve(root, item.content), "utf8");
      const article = marked.parse(source, { gfm: true });
      const baseHref = "../".repeat(routeParts.length);
      const canonicalUrl = siteUrl ? `${siteUrl}/${route}/` : undefined;
      const pageSocialMeta = canonicalUrl
        ? `
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(item.title)} — ${escapeHtml(content.name)}">
    <meta property="og:description" content="${escapeHtml(item.description)}">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:image" content="${escapeHtml(`${siteUrl}/${item.image}`)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(item.title)} — ${escapeHtml(content.name)}">
    <meta name="twitter:description" content="${escapeHtml(item.description)}">
    <meta name="twitter:image" content="${escapeHtml(`${siteUrl}/${item.image}`)}">`
        : "";

      const pageHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(item.description)}">
    <meta name="theme-color" content="#f8f7f3">
    <meta name="robots" content="index, follow">
    <base href="${baseHref}">
    <title>${escapeHtml(item.title)} — ${escapeHtml(content.name)}</title>${pageSocialMeta}
    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
    <link rel="alternate" type="text/plain" href="llms.txt" title="LLM-readable site summary">
    <link rel="stylesheet" href="styles.css?v=${stylesheetVersion}">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="project-page">
      <nav class="project-nav" aria-label="Breadcrumb">
        <a href="./#projects"><span aria-hidden="true">←</span> ${escapeHtml(content.name)}</a>
      </nav>

      <main id="main">
        <article class="project-article">
          <header class="project-hero">
            <p class="project-eyebrow">Selected project</p>
            <h1>${escapeHtml(item.title)}</h1>
            <p class="project-summary">${escapeHtml(item.description)}</p>
            ${tags(item.tags)}${projectActionLinks(item)}
          </header>
          ${article}
        </article>
      </main>

      <footer>
        <p>© ${new Date().getFullYear()} ${escapeHtml(content.name)}</p>
        <a class="build-info" href="${repositoryUrl}" target="_blank" rel="noreferrer" aria-label="View this site's source repository and build commit ${escapeHtml(buildRevision)}" title="View source repository · commit ${escapeHtml(buildRevision)}">
          <span class="build-icon" aria-hidden="true"></span>
          <span>${escapeHtml(buildRevision)}</span>
          <span class="external-mark" aria-hidden="true"></span>
        </a>
      </footer>
    </div>
  </body>
</html>
`;

      return { routeParts, pageHtml };
    }),
);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(
  [
    writeFile(path.join(output, "index.html"), html),
    writeFile(path.join(output, "llms.txt"), llms),
    writeFile(path.join(output, "robots.txt"), robots),
    writeFile(path.join(output, "sitemap.xml"), sitemap),
    ...projectPages.map(async ({ routeParts, pageHtml }) => {
      const pageDirectory = path.join(output, ...routeParts);
      await mkdir(pageDirectory, { recursive: true });
      await writeFile(path.join(pageDirectory, "index.html"), pageHtml);
    }),
  ],
);
await cp(path.join(root, "src/styles.css"), path.join(output, "styles.css"));
await cp(path.join(root, "assets"), path.join(output, "assets"), {
  recursive: true,
  filter: (source) => path.basename(source) !== ".DS_Store",
});

console.log(`Built ${path.relative(root, output)}/`);
