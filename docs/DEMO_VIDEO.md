# TripReady testing and demo-video guide

This guide is designed for a clear 5–6 minute submission video. Record at 1080p, increase browser zoom to 110–125% if text is small, and close notifications before starting.

## 1. Pre-recording checklist

### Prepare the repository

```bash
npm install
npm run typecheck
npm run lint
npm test
```

Expected result: the production build completes and two Node tests pass.

### Enable the live GPT-5.6 demonstration

Copy the environment template:

```bash
copy .env.example .env.local
```

Set these values in `.env.local`:

```dotenv
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-sol
```

Do not show `.env.local`, the terminal environment, network authorization headers, or the API key during the recording.

Start the local app:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Prepare recording windows

Have these ready before recording:

1. Browser on the TripReady overview
2. Editor on `app/api/assistant/route.ts`
3. Editor tabs for `db/schema.ts`, `AGENTS.md`, and `tests/rendered-html.test.mjs`
4. Codex desktop app open to session `019f7e42-272c-7282-8fd5-01a69bc1888a`
5. Terminal with the successful test output visible
6. `demo-data/museum-confirmation.txt` ready to copy

### Reset the demo

Refresh the page immediately before recording. The current demo state is in memory, so a refresh restores the original conflict, pending review item, five-document count, and unchanged arrival timeline.

## 2. Manual testing checklist

Run this once before recording.

### Overview and conflict

- [ ] The page displays “Good morning, Anika.”
- [ ] Trip health is 82% with one conflict.
- [ ] The overview includes seven confirmed bookings and five offline documents.
- [ ] Click **Review fix →**.
- [ ] The warning changes to a green conflict-free state and trip health changes to 96%.

### Confidence review and provenance

- [ ] Find **Review 1 detail**.
- [ ] Confirm that checkout shows `Sep 22 · 11:00 AM`, the filename, page number, and 73% confidence.
- [ ] Click **Confirm 11:00 AM**.
- [ ] Confirm the review card disappears and the confirmed-booking count increases.

### Import flow

- [ ] Click **Import booking**.
- [ ] Confirm the dialog accepts PDF/image files and pasted text.
- [ ] Paste `demo-data/museum-confirmation.txt`.
- [ ] Click **Extract booking**.
- [ ] Confirm the success message appears and the wallet document count increases.

### GPT-5.6 assistant

- [ ] Enter `What should I do next?` in the assistant bar.
- [ ] Click **Ask**.
- [ ] Confirm a concise itinerary-aware answer appears.
- [ ] If the key is configured, inspect server logs only if needed; do not expose the key.
- [ ] If the key is not configured, explain that the deterministic demo fallback keeps the project judgeable.

### Delay re-planning

- [ ] Click **Plan changed**.
- [ ] Review the moved lunch, updated luggage window, and retained Tower Bridge entry.
- [ ] Click **Apply revised plan**.
- [ ] Confirm the timeline starts with a 10:30 revised arrival and the conflict count is zero.

### Travel tools

- [ ] Open **Travel mode** and verify the next action, morning brief, confirmation code, and offline status.
- [ ] Close travel mode.
- [ ] Open **Travel wallet** and verify four cards.
- [ ] Open **Budget** and verify the £2,500 total with £500 remaining.
- [ ] Open **Packing** and toggle one checklist item.
- [ ] Use **Calendar** and confirm an `.ics` file downloads.

### Responsive check

- [ ] Resize the browser to a narrow/mobile width.
- [ ] Confirm the desktop sidebar disappears and mobile branding remains.
- [ ] Confirm timeline rows, import dialog, and travel mode fit without horizontal scrolling.

## 3. Timed recording script

### 0:00–0:25 — Problem and pitch

**On screen:** TripReady overview.

**Say:**

> Travel plans are fragmented across emails, PDFs, screenshots, maps, and chats. Even when everything is collected, a normal itinerary does not account for immigration, transfers, hotel constraints, time zones, or delays. TripReady turns those scattered bookings into a realistic, conflict-free trip that adapts when plans change.

### 0:25–1:00 — The operating dashboard

**On screen:** Point to trip health, confirmed bookings, documents, and the conflict card.

**Say:**

> This fictional five-day London trip is deliberately operational rather than inspirational. TripReady tracks confirmed records and source documents, then explains an impossible museum connection: the traveler cannot land, clear immigration, collect baggage, and reach the reservation in fifty minutes. It recommends a later entry with a safe buffer.

Click **Review fix →**.

> The fix updates the TripReady plan only. It does not claim to change an external reservation.

### 1:00–1:30 — Uncertainty and source provenance

**On screen:** The hotel checkout review card.

**Say:**

> AI extraction is never treated as automatically correct. This checkout value is only 73% confident because the document gives a range. The user sees the source filename, page, and reason before confirming it.

Click **Confirm 11:00 AM**.

### 1:30–2:00 — Import a confirmation

Click **Import booking**, paste the contents of `museum-confirmation.txt`, and click **Extract booking**.

**Say:**

> The production workflow accepts PDFs, images, or pasted confirmation text. The MVP demonstrates the review and provenance experience with fictional sample data so the demo is reliable and contains no personal travel information.

### 2:00–2:40 — Show GPT-5.6 in the product and code

Ask: `What should I do next?`

**Say:**

> This assistant request goes through a server-only OpenAI Responses API route using GPT-5.6 Sol. The model receives a bounded itinerary, not unrestricted application data, and returns a concise next action.

Switch briefly to `app/api/assistant/route.ts`. Highlight:

- `gpt-5.6-sol`
- `reasoning: { effort: "medium" }`
- `text: { verbosity: "low" }`
- `store: false`
- the safety prompt prohibiting invented bookings and external-action claims

**Say:**

> Credentials remain on the server. The prompt prohibits invented confirmation numbers, unsupported live status, and claims that a cancellation or change occurred. Without an API key, the same route returns a deterministic demo answer rather than breaking the experience.

### 2:40–3:30 — Re-plan after a delay

Return to the app. Click **Plan changed**.

**Say:**

> Now I simulate a three-hour flight delay. TripReady identifies the affected lunch and luggage window, checks that Tower Bridge is still feasible, and proposes a revised sequence. It also clearly states that nothing has been cancelled or changed externally.

Click **Apply revised plan**.

> The timeline now starts at 10:30, recalculates the arrival buffer, and keeps the fixed evening booking.

### 3:30–4:10 — Travel mode and supporting tools

Open **Travel mode**.

**Say:**

> During the trip, the interface becomes intentionally simpler: the next action, morning brief, directions, ticket, confirmation code, and offline status are immediately available.

Close it, then quickly open **Travel wallet**, **Budget**, and **Packing**.

> The same workspace keeps essential documents offline, tracks confirmed and planned spend, and creates a weather-aware packing list. Calendar export is built in for interoperability.

### 4:10–4:55 — Architecture and data decisions

Switch to `db/schema.ts`.

**Say:**

> The architecture is Next.js and React on a Vinext Cloudflare runtime, with D1 for relational data and R2 for private documents. The schema treats time zones and provenance as domain data. A reservation stores its original local time, IANA zone, and normalized UTC time. Every extracted field can retain its source, confidence, and review status.

Switch to `AGENTS.md`.

> These safety decisions are encoded in AGENTS.md so Codex applies them consistently in future work: never invent a confirmation number, never silently overwrite local time, enforce tenant authorization, and require explicit approval for external changes.

### 4:55–5:35 — How Codex accelerated the build

Switch to the Codex session.

**Say:**

> Codex built the majority of this project in session 019f7e42-272c-7282-8fd5-01a69bc1888a. Starting from the product brief, it scaffolded the application, implemented the interface, designed the data model, generated the migration, integrated GPT-5.6, diagnosed local runtime issues, and created the validation suite. The key value was not just code generation; Codex helped make and preserve the product decisions around human review, time zones, provenance, tenant isolation, and safe fallbacks.

Show a short portion of the session containing the build/test progress, then the code diff or file tree.

### 5:35–5:55 — Verification and close

Switch to the terminal showing successful checks.

**Say:**

> The production build, type checks, linting, rendered-product tests, safety invariants, and database migration all pass. TripReady demonstrates a practical use of GPT-5.6: not another attraction generator, but a dependable travel operating system.

End on the app overview or `public/og.png` with the repository URL visible in a title card.

## 4. Short 90-second version

If the submission limits video length:

1. **0:00–0:15:** State the fragmentation problem and one-line pitch.
2. **0:15–0:35:** Show the conflict and confirm the low-confidence source-linked field.
3. **0:35–0:55:** Ask GPT-5.6 what to do next, then show the model and guardrails in the API route.
4. **0:55–1:10:** Simulate the three-hour delay and apply the revised plan.
5. **1:10–1:25:** Show travel mode, schema provenance/time-zone fields, and passing tests.
6. **1:25–1:30:** Show the repository URL and Codex session ID.

## 5. Recording safety

- Use only the fictional files in `demo-data/`.
- Never display `.env.local`, API keys, private confirmation emails, or browser autofill.
- Keep the browser network panel closed during the API demonstration.
- Do not claim the map uses live routing data; it is a visual MVP.
- State clearly when a response is using demo fallback rather than live GPT-5.6.
- Do not imply that TripReady changed an external reservation.

## 6. Troubleshooting

- **Port 3000 is in use:** stop the old development process or run `npm run dev -- --port 3001`.
- **GPT answer uses demo mode:** confirm `.env.local` exists, restart the development server, and verify the API key is set locally.
- **Cloudflare local runtime fails on Windows:** use `npm run dev` for the recording; `npm run dev:cloudflare` requires a working local Workers runtime.
- **State is already modified:** refresh the browser.
- **Calendar download is blocked:** allow downloads for localhost and click **Calendar** again.
