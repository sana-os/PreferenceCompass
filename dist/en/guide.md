# Using and carrying the sheet

Answer the questionnaire, review the complete response list, then download Markdown or JSON. You may move past a question temporarily; export becomes available only after all 100 have a response. Both downloads contain the same schema, protocol and data. Give the entire file to the AI you choose.

The receiving AI should identify which entries matter to your current request, distinguish known information from unknowns and conflicts, and ask only the questions that materially affect the interaction. Current explicit instructions take priority. Earlier agreements are a starting point for confirmation, not inherited trust or personal memories of the receiving AI.

During dialogue, keep explicit statements, AI hypotheses and user-confirmed agreements distinct. Record the context, concise evidence and what changed after a misunderstanding. Do not count silence as agreement or repeated summaries as new evidence. A declined answer is a disclosure boundary, never evidence of a hidden preference.

When you want to move to another session or platform, request a complete updated sheet. Keep the schema and protocol unchanged; update the revision and relationship data. Entries may be added, split, merged, superseded or deleted at your request. There is no required item count after the initial questionnaire. Preserve relevant evidence without including unrelated task details.

The machine-readable protocol uses English as its common reference language; this guide and the export introduction are localized. Question and option IDs are stable across languages. Free text retains its original content and input language; switching the interface does not translate or overwrite it. The site exports initial sheets; later updates are made by your AI, not automatically by this site.

## Experimental numerical updates

Only a narrowly defined binary hypothesis in a fixed context is eligible for the experimental Beta–Bernoulli model. Start with alpha=1 and beta=1. Each distinct explicit confirmation adds 1 to alpha; each distinct explicit contradiction adds 1 to beta. Record a unique evidence ID for every update. The posterior mean is alpha/(alpha+beta). For two confirmations and one contradiction, alpha=3, beta=2 and the mean is 0.6.

This is an uncalibrated experimental convention, not a measure of personality or trust. Initial questionnaire entries have belief=null. Unknowns, refusals, silence and four-option choices do not become probability updates. Repeated or dependent evidence is not counted again. A change of context or preference calls for a new or superseding item. Current instructions always take precedence over historical probabilities.

## Request the next relationship sheet

Please export an updated Relationship Portability Sheet in the same format. Keep the embedded schema and handling protocol unchanged. Update the revision and relationship data to reflect explicit understandings, agreements, repairs, boundaries and unknowns from this dialogue. Include context and concise evidence; keep hypotheses separate from confirmed agreements. Use any number of entries. Exclude task progress. Return the complete file, not just changes.

[Questionnaire](https://preferencecompass.info/en/) · [Handling guide](https://preferencecompass.info/en/guide/) · [Source code](https://github.com/sana-os/PreferenceCompass)

Deshimaru Sakaguchi — https://deshimarusakaguchi.com/

Experimental release; translations have not received independent native-speaker validation.
