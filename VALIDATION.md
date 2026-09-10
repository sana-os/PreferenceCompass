# Validation record

Public release 1.0.0. Run `node scripts/build.mjs` and `node tests/check.mjs` to reproduce.

Passed:

- Seven editions × 100 unique aligned questions and four stable option IDs.
- Complete multilingual JSON and Markdown exports; exact JSON recovery from Markdown with hostile backtick/script text kept as data.
- Initial schema constraints, null beliefs, original note language and response-language preservation.
- Missing-response export rejection; valid refusal and uncertainty; invalid and conflicting input rejection; atomic batch failure.
- Updated relationship item counts of 0, 1 and 101 accepted by the schema.
- 787 local HTML links/assets resolve; all 42 localized pages occur in sitemap.xml; robots.txt has no Disallow directive.
- Application startup, response updates, review, both download handlers and reset in seven languages using a minimal DOM harness.
- JavaScript syntax checks.

Limits: tests check the JSON Schema vocabulary used by this schema, not all JSON Schema keywords. Future AI-written updates require the semantic checks in the handling protocol (evidence identity, numeric counts, context, lineage), beyond structural validation. No native-speaker review, real-browser visual/accessibility audit, real download dialog, production DNS/TLS check or Cloudflare deployment is represented as completed. Translation quality and the relational model remain experimental.
