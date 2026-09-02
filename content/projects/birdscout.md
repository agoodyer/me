<figure class="project-feature project-feature--hero">
  <img src="assets/images/projects/birdscout-hero.jpg" alt="BirdScout field journal displayed on a phone against a blue sky" width="2000" height="1500">
  <figcaption>A mobile app for identifying birds, recording sightings, and exploring what other birdwatchers have found.</figcaption>
</figure>

## An end-to-end birdwatching app

BirdScout is an app for birdwatchers. Take or upload a photo, optionally add some field notes, receive a suggested species, and keep the result in a personal journal. A community map shows sightings from other users.

Six of us built BirdScout over roughly four months for a McMaster software design course, taking it from requirements and architecture through to a working mobile prototype. The project covered requirements, system design, implementation, and integration.

<div class="project-stat-grid" aria-label="BirdScout at a glance">
  <div><strong>4 months</strong><span>from requirements work to the final prototype</span></div>
  <div><strong>6 people</strong><span>working across design, implementation, and integration</span></div>
  <div><strong>Full cycle</strong><span>from requirements and architecture to an integrated mobile app</span></div>
</div>

## From a photo to a saved sighting

The mobile client accepts a photo and observation details, persists the submission, and calls an Edge Function for classification. It then saves the suggested species as a sighting. That record supplies the result screen, journal, map, and achievement views.

<div class="project-flow" aria-label="BirdScout observation flow">
  <div>
    <span>01</span>
    <strong>Capture</strong>
    <p>Take a photo or choose one from the library, with optional notes and location.</p>
  </div>
  <div>
    <span>02</span>
    <strong>Store</strong>
    <p>Persist the image and observation metadata as an artifact before classification.</p>
  </div>
  <div>
    <span>03</span>
    <strong>Identify</strong>
    <p>An Edge Function retrieves the artifact and asks a vision-capable model for a species.</p>
  </div>
  <div>
    <span>04</span>
    <strong>Reuse</strong>
    <p>Save the resulting sighting for the journal, map, and related views.</p>
  </div>
</div>

<div class="project-demo-grid" aria-label="BirdScout product demos">
  <figure class="project-phone-demo">
    <div class="project-phone">
      <span class="project-phone-button project-phone-button--mute" aria-hidden="true"></span>
      <span class="project-phone-button project-phone-button--volume-up" aria-hidden="true"></span>
      <span class="project-phone-button project-phone-button--volume-down" aria-hidden="true"></span>
      <span class="project-phone-button project-phone-button--power" aria-hidden="true"></span>
      <div class="project-phone-screen">
        <video autoplay loop muted playsinline controls preload="metadata" aria-label="BirdScout classification flow, from camera capture to a species result">
          <source src="assets/videos/birdscout-classification-demo.mp4" type="video/mp4">
        </video>
      </div>
    </div>
    <figcaption><strong>Identify a bird</strong><span>Camera capture through to a Wild Turkey match.</span></figcaption>
  </figure>
  <figure class="project-phone-demo">
    <div class="project-phone">
      <span class="project-phone-button project-phone-button--mute" aria-hidden="true"></span>
      <span class="project-phone-button project-phone-button--volume-up" aria-hidden="true"></span>
      <span class="project-phone-button project-phone-button--volume-down" aria-hidden="true"></span>
      <span class="project-phone-button project-phone-button--power" aria-hidden="true"></span>
      <div class="project-phone-screen">
        <video autoplay loop muted playsinline controls preload="metadata" aria-label="BirdScout map, journal, and achievements flow">
          <source src="assets/videos/birdscout-map-journal-achievements-demo.mp4" type="video/mp4">
        </video>
      </div>
    </div>
    <figcaption><strong>Explore sightings</strong><span>Community map, field journal, and achievement views.</span></figcaption>
  </figure>
</div>

## Designing the identification system

Bird identification can involve incomplete or conflicting evidence. Our proposed design used a **blackboard architecture** so that a generative model, geographic expert, and rule-based expert could contribute independently, with an identification controller combining their results.

Repository-style subsystems handled account, journal, and map data. This isolated the classification knowledge sources from the rest of the application and allowed them to be replaced independently. The working prototype used a simpler path: one vision-capable model invoked through an Edge Function rather than the proposed multi-expert system.

<figure class="project-feature project-feature--architecture">
  <img src="assets/images/projects/birdscout-system-architecture.png" alt="Planned BirdScout system architecture with three expert sources, identification and product controllers, data stores, external services, and the mobile interface" width="1250" height="900" loading="lazy">
  <figcaption>The system architecture diagram I created for the project.</figcaption>
</figure>

## Turning a broad idea into decisions

Before implementation, we described nine business events from five stakeholder viewpoints. We also translated responsiveness, reliability, and privacy into specific design targets and failure cases.

<div class="project-capability-grid">
  <article>
    <p class="project-capability-number">SCOPE</p>
    <h3>Trace the main workflows</h3>
    <p>The requirements covered account creation, identification, past results, the sightings map, premium features, bird information, incorrect-result reports, and achievements.</p>
  </article>
  <article>
    <p class="project-capability-number">PERFORMANCE</p>
    <h3>Put numbers behind “responsive”</h3>
    <p>We set design targets of three seconds for expert responses, one second for journal writes, and two seconds for map loading. These were specification goals, not production benchmarks.</p>
  </article>
  <article>
    <p class="project-capability-number">FAILURE HANDLING</p>
    <h3>Consider more than the happy path</h3>
    <p>The proposed classifier could retry failed requests and continue when one expert was unavailable. These cases shaped the boundary between orchestration and individual experts.</p>
  </article>
  <article>
    <p class="project-capability-number">PRIVACY</p>
    <h3>Be deliberate with location data</h3>
    <p>The design called for explicit permission, opt-in map contributions, and spatial anonymization. The prototype implemented only part of that design.</p>
  </article>
</div>

## What I worked on

My contribution spanned the design work and implementation. I contributed across the project deliverables and was the primary contributor to the application source.

<div class="project-capability-grid project-ownership-grid">
  <article>
    <p class="project-capability-number">PLANNING</p>
    <h3>Requirements and architecture</h3>
    <p>I drafted the initial purpose, scope, and security requirements and helped define the business events and stakeholder viewpoints. I created the use-case and system-architecture diagrams, contributed to the architecture and subsystem design, and produced the detailed class diagram.</p>
  </article>
  <article>
    <p class="project-capability-number">IMPLEMENTATION</p>
    <h3>Application and integration</h3>
    <p>I built the initial mobile UI and core domain model, then implemented photo storage, database-backed journal and map data, and classification through an Edge Function. I also handled loading and refresh behaviour, theming, platform compatibility, and the integration required for the end-to-end workflow.</p>
  </article>
</div>
