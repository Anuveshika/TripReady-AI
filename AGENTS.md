# TripReady project rules

- Store every reservation time with its original local value, explicit IANA time-zone identifier, and normalized UTC value.
- Never silently convert, overwrite, or infer a local booking time.
- Never invent a confirmation number or claim that a reservation exists without source evidence.
- Every extracted field must retain source-document provenance, including page or excerpt when available.
- Values below the confidence threshold require user review before becoming confirmed.
- External reservation changes, messages, cancellations, purchases, and check-ins require explicit approval at action time.
- Enforce tenant authorization on the server for every trip, document, reservation, export, and write action. Never trust client-supplied owner identifiers.
- Keep uploaded documents private. Use short-lived signed access and never expose raw object-storage keys to clients.
- Do not make visa, entry, health, or legal decisions from model memory. Use dated official sources and label AI summaries.
- Tests must cover daylight-saving transitions, midnight crossing, date-line crossing, ambiguous local times, missing time zones, and tenant isolation.
- Conflict logic must include transfer time, check-in/checkout constraints, buffers, passenger matching, and provenance.
- Demo fallbacks must be clearly distinguishable in code from live provider data.

## Verification

- Run `npm run build` (or the equivalent bundled runtime command) after product changes.
- Run `npm test` for conflict, time-zone, authorization, and extraction changes.
- Inspect generated Drizzle migrations whenever `db/schema.ts` changes.
