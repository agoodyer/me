<figure class="project-feature project-feature--hero">
  <video class="project-video" controls preload="metadata" playsinline poster="assets/images/projects/infrarat-capstone-poster.jpg" aria-label="InfraRAT capstone project overview">
    <source src="assets/videos/infrarat-capstone-overview.mp4" type="video/mp4">
    <p>This browser cannot play the video inline. <a href="assets/videos/infrarat-capstone-overview.mp4">Open the video</a>.</p>
  </video>
  <figcaption>
    <span class="project-attribution">Music: <a href="https://app.sessions.blue/browse?trackId=393710" target="_blank" rel="noreferrer">“Pewter Lamp” by Blue Dot Sessions</a>, licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="license noreferrer">CC BY-NC 4.0</a>.</span>
  </figcaption>
</figure>

## Making 20,000+ experimental sessions easier to explore

McMaster University’s Szechtman Lab maintains a collection of more than 20,000 experimental sessions in rat behavioural research. The public data was spread across video, tracking, and supplementary files that were difficult to search together.

InfraRAT makes the archive searchable through normalized session metadata linked to the original files in the Federated Research Data Repository (FRDR). Researchers can query and filter sessions, compare groups, visualize behaviour, inspect individual sessions, and download the underlying files.

## Querying the archive in plain language

The natural-language interface lets researchers describe their needs in everyday terms. **Ask** mode is optimized for a conversational response. **Select** mode exposes the generated query and matching sessions for review, then lets researchers inspect and download the associated source files.

<div class="project-capability-grid">
  <article>
    <p class="project-capability-number">01</p>
    <h3>Find relevant sessions</h3>
    <p>Filter by treatment, regimen, brain manipulation, apparatus, session type, and available file formats.</p>
  </article>
  <article>
    <p class="project-capability-number">02</p>
    <h3>Compare behaviour</h3>
    <p>Build bar charts and heatmaps, or open multi-panel dashboards for established compulsive-checking measures.</p>
  </article>
  <article>
    <p class="project-capability-number">03</p>
    <h3>Inspect one session closely</h3>
    <p>Load a session to review its metadata, tracked points, path trajectory, distance travelled, and checking summaries.</p>
  </article>
  <article>
    <p class="project-capability-number">04</p>
    <h3>Download the underlying files</h3>
    <p>Map sessions selected through a query or inventory filter back to the corresponding CSV, image, and video files in FRDR.</p>
  </article>
</div>

<figure class="project-feature">
  <img src="assets/images/projects/infrarat-toolbox.png" alt="InfraRAT analysis toolbox showing session metadata, tracked data points, a path image, an animated trajectory, and summary measures" width="1683" height="887" loading="lazy">
  <figcaption>The session toolbox brings raw tracking points, movement paths, and behavioural summaries into one view.</figcaption>
</figure>

## Connecting metadata to the research archive

React and TypeScript provide the browser interface. Nginx serves the frontend and routes requests to FastAPI, which handles querying and analysis. PostgreSQL stores normalized session metadata linked to the source files in FRDR. Docker packages the frontend, API, and database as a reproducible three-service stack.

<figure class="project-feature project-feature--architecture">
  <img src="assets/images/projects/infrarat-architecture.png" alt="InfraRAT architecture connecting a React frontend through Nginx to FastAPI, PostgreSQL, visualization and natural-language services, Google Vertex AI, FRDR, and GitHub Actions" width="1952" height="1186" loading="lazy">
  <figcaption>The deployed architecture, from the browser interface and analysis services to the research file archive.</figcaption>
</figure>

<div class="project-figure-grid">
  <figure class="project-feature">
    <img src="assets/images/projects/infrarat-behaviour-dashboard.png" alt="InfraRAT dashboard comparing frequency, length, recurrence, and duration measures across experimental groups" width="2048" height="1343" loading="lazy">
    <figcaption>A multi-panel dashboard compares established behavioural measures across experimental groups.</figcaption>
  </figure>
  <figure class="project-feature">
    <img src="assets/images/projects/infrarat-visualizations.png" alt="InfraRAT visualization gallery with bar chart, heatmap, spatial heatmap, velocity profile, and query visualization tools" width="1261" height="509" loading="lazy">
    <figcaption>The visualization tools include bar charts, heatmaps, spatial heatmaps, and velocity profiles.</figcaption>
  </figure>
</div>

## Built with the Szechtman Lab

InfraRAT was created by a five-person McMaster Software Engineering capstone team in collaboration with Dr. Henry Szechtman and Dr. Anna Dvorkin-Gheva. Their input shaped the workflows we prioritized: finding a useful cohort, inspecting an individual session, comparing experimental conditions, and returning to the underlying files.

<p class="project-closing-link"><a class="project-action" href="assets/files/infrarat-research-poster.pdf" target="_blank" rel="noreferrer" aria-label="View the original research poster (opens in a new tab)"><span class="project-link-icon" style="--icon: url('./assets/icons/external-link.svg')" aria-hidden="true"></span><span>View the original research poster</span></a></p>
