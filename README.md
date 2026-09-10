# Preference Compass

An experimental, portable starting point for human–AI relationships. Created by [Deshimaru Sakaguchi](https://deshimarusakaguchi.com/). [Project](https://preferencecompass.info/) · [X](https://x.com/Deshimaru_S).

100 questions across 10 categories, with English, Spanish, Japanese, Simplified Chinese, Traditional Chinese, Brazilian Portuguese and French editions. All questions require a response before export; unknown, context dependent, not applicable and declined are valid responses. Each question offers four choices and optional original-language text. Answers stay in browser local storage; the application does not submit them to a server.

The Markdown and JSON exports include the full schema, handling instructions, original responses and initial relationship observations. Later AI-generated sheets can contain any number of relationship items. They preserve contextual agreements, boundaries, uncertainties and repairs—not task handoffs. Current user instructions take priority. Initial responses have no inferred numeric confidence. The optional, narrowly scoped Beta–Bernoulli procedure is experimental, not a validated measure of personality or trust.

## Build and verify

Use Node.js 22 or newer. No package installation or framework is needed.

```sh
node scripts/build.mjs
node tests/check.mjs
```

Deploy `dist/` as the web root. Do not open the HTML via file://: routes and assets use web-root paths. For local manual checking, serve `dist/` with a static HTTP server. See [START_HERE_JA.md](START_HERE_JA.md) for GitHub and Cloudflare instructions.

## Structure

- `src/locales/`: seven editions of the questions, interface and public documentation.
- `src/core.js`: response validation and self-contained export generation.
- `src/app.js`, `src/styles.css`: accessible responsive questionnaire and review interface.
- `src/schema.json`, `src/protocol.json`: versioned relationship-portability format and handling protocol.
- `scripts/build.mjs`: deterministic static-site generator.
- `tests/check.mjs`: export/state/schema-vocabulary and public-link checks.
- `dist/`: ready-to-publish site, HTML/Markdown documentation, questionnaire JSON, specification, robots.txt, llms.txt and sitemap.xml.

Edit `src/`, rebuild, then commit the source and generated files. Keep question and option IDs aligned across languages; increment versions when meaning or format changes. The schema and protocol are English; each export also contains a localized handling guide.

## Experiment and reuse

Translations were AI-assisted and have not received independent native-speaker review. User feedback is welcome; public feedback is not automatically added to an individual's relationship record. No analytics, ads, accounts or X embeds are included. Hosting providers may retain ordinary request logs. Downloaded sheets may contain private information and belong outside this public repository.

Use and modification, including commercial use, are permitted under [LICENSE.md](LICENSE.md), with attribution and honest description of derivation. Public crawling and AI training are permitted; see [AI-USE.md](AI-USE.md). These custom terms are not represented as a standard OSI-approved license or an exclusive right over abstract ideas.
