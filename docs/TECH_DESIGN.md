# Adaptive Chrome Summarizer - Technical Design (v1)

## 1) Product Scope (Locked)

Chrome extension flow:

1. User clicks summarize
2. Extension extracts page text
3. `POST /detect-topics`
4. Backend returns topics (`["React", "SSR"]` style)
5. Extension checks local skill memory + backend skill memory
6. If missing ratings -> show modal only for missing topics
7. `POST /skills` for each rated topic
8. `POST /summarize/stream`
9. Stream structured result
10. Render UI and persist ratings/history

Design goals:
- Minimal UX
- Concise outputs
- Structured JSON for deterministic rendering
- Adaptive explanation using per-topic ratings

## 2) Existing Codebase Review

Current repository (non-`node_modules`) mostly contains backend placeholders:

- Implemented:
  - `server/src/schema/summarySchema.ts` (has schema, but not aligned to latest concise contract)
  - `server/src/prompt/buildTopicPrompt.ts` (starter prompt)
- Present but empty:
  - `server/src/index.ts`
  - `server/src/routes/detectTopics.ts`
  - `server/src/routes/summarise.ts`
  - `server/src/services/topicDetector.ts`
  - `server/src/services/summaryGenerator.ts`
  - `server/src/services/skillService.ts`
  - `server/src/schema/topicSchema.ts`
  - `server/src/prompt/buildSummaryPrompt.ts`
  - `server/src/db/prisma.ts`
- `extension/` directory is currently empty.

Implication: architecture is scaffolded well, but core runtime logic is still to be implemented.

## 3) API Contract (Locked + Concretized)

## `POST /detect-topics`
Input:
```json
{ "pageText": "string" }
```
Output:
```json
{ "topics": ["React", "SSR"] }
```

Rules:
- Return 1-6 concise topics.
- Deduplicate and normalize labels (`React`, not `react.js framework`).
- Ordered by relevance.

## `POST /skills`
Input:
```json
{ "skillName": "React", "rating": 6 }
```
Output:
```json
{ "ok": true }
```

Rules:
- Auth required.
- Upsert by `(userId, skillName)`.
- Rating range: 1-10.

## `POST /summarize/stream`
Input:
```json
{
  "pageText": "string",
  "topics": ["React", "SSR"]
}
```
Output:
- `text/event-stream` (SSE).
- Events:
  - `event: chunk` (incremental partial text)
  - `event: done` (final structured JSON)
  - `event: error` (recoverable failure)

## 4) Structured Summary JSON (Concise, Recommended)

Use this as final `done` payload:

```json
{
  "summary": {
    "bullets": ["...", "...", "..."],
    "post": "...",
    "analogy": "..."
  },
  "signal": {
    "confidence": "high",
    "caveat": "optional short caveat"
  },
  "meta": {
    "topicsUsed": ["React", "SSR"],
    "missingRatings": []
  }
}
```

Validation constraints:
- `bullets.length === 3`
- each bullet max 140 chars
- `post` max 220 chars
- `analogy` max 240 chars
- `confidence in ["high", "medium", "low"]`
- `caveat` optional, max 160 chars

Why this shape:
- Minimal + deterministic for UI.
- Future-safe (`meta` enables analytics/debug without UI coupling).

## 5) Data Model

Locked tables + practical constraints:

### `User`
- `id` (string UUID, PK)
- `email` (string, unique, indexed)
- `createdAt` (timestamp)

### `UserSkill`
- `id` (string UUID, PK)
- `userId` (FK -> User.id, indexed)
- `skillName` (string, indexed)
- `rating` (int 1-10)
- `updatedAt` (timestamp)
- Unique composite index: `(userId, skillName)`

Recommended optional v1.1 table:

### `SummaryHistory` (optional)
- `id`, `userId`, `url`, `topics`, `resultJson`, `createdAt`
- Useful for history panel and quality diagnostics.

## 6) End-to-End Runtime Design

## Browser Extension
- `content-script`: extract readable text from active page.
- `popup`: orchestrates flow and renders states.
- `service-worker`: token/session handling and API calls (or keep in popup for v1 simplicity).
- local cache (`chrome.storage.local`): skill map for fast missing-topic check.

## Backend
- Fastify server with three routes.
- Auth middleware validates Google session/JWT.
- Services:
  - Topic detector service (LLM + schema validation)
  - Skill service (DB upsert/read)
  - Summary generator (LLM + structured output + SSE)

## LLM
- Topic prompt: concise keyword/topic extraction.
- Summary prompt: adaptive depth based on per-topic ratings.
- Schema enforcement via Zod parse before emitting `done`.

## 7) Detailed Sequence

1. Popup gets selected tab.
2. Popup asks content script for extracted text + URL/title.
3. Popup calls `POST /detect-topics`.
4. Popup loads user skills from `chrome.storage.local` (fast path).
5. Popup computes missing topic ratings.
6. If missing, show compact modal with sliders (1-10).
7. For each new rating, call `POST /skills` and update local cache.
8. Popup calls `POST /summarize/stream`.
9. Render incoming chunks.
10. On `done`, render structured cards and persist local last-result.

## 8) Prompting Strategy

## Topic detector prompt
Output must be strict JSON only:
```json
{ "topics": ["..."] }
```
Guidelines: topical nouns, frameworks, methods, concepts.

## Summary prompt inputs
- `pageText`
- `topics`
- user ratings map for those topics

Behavior:
- Lower rating -> simpler language, definitions, basic framing.
- Higher rating -> assume context, include nuance/tradeoffs.
- Keep output concise and within length caps.

## 9) Error Handling

- Empty extraction -> show "Could not read this page" and retry CTA.
- `detect-topics` failure -> fallback to generic topic `["General"]`.
- `skills` partial failure -> keep local state, retry silently.
- Streaming interruption -> show partial output + retry button.
- Schema parse failure -> one backend retry with stricter instruction; else emit `error`.

## 10) Security + Privacy

- Google login required before write endpoints.
- Do not store full page text in DB for v1 unless explicitly needed.
- Log only hashes/metadata for observability.
- HTTPS only; CORS allow extension origin only.
- Rate limit per user/IP.

## 11) Suggested Monorepo Structure

```txt
ai-adaptive-extension/
  extension/
    manifest.json
    package.json
    src/
      popup/
        App.tsx
        components/
          RatingModal.tsx
          SummaryCards.tsx
      content/
        extract.ts
      background/
        index.ts
      lib/
        api.ts
        storage.ts
        types.ts
  server/
    package.json
    prisma/
      schema.prisma
    src/
      index.ts
      routes/
        detectTopics.ts
        skills.ts
        summarize.ts
      services/
        topicDetector.ts
        skillService.ts
        summaryGenerator.ts
      prompt/
        buildTopicPrompt.ts
        buildSummaryPrompt.ts
      schema/
        topicSchema.ts
        skillSchema.ts
        summarySchema.ts
      db/
        prisma.ts
      middleware/
        auth.ts
      types/
        api.ts
  docs/
    TECH_DESIGN.md
```

Note: rename `summarise.ts` -> `summarize.ts` for consistency with endpoint naming.

## 12) Backend Implementation Plan

## Phase 1 - Foundation
- Set up Fastify server bootstrap (`index.ts`).
- Add health route + env validation.
- Add Prisma client and schema for `User`, `UserSkill`.

## Phase 2 - Locked APIs
- Implement `POST /detect-topics` with Zod request/response validation.
- Implement `POST /skills` upsert.
- Implement `POST /summarize/stream` SSE pipeline.

## Phase 3 - LLM Integration
- Add OpenAI client wrappers.
- Add prompt builders.
- Add strict response parsing + retry-on-invalid-json.

## Phase 4 - Reliability
- Rate limiting, request IDs, structured logs.
- Timeout/retry guards.
- Basic tests for schema and route contracts.

## 13) Frontend (Extension) Implementation Plan

## Phase 1 - Shell
- Create MV3 extension with popup + content script.
- Implement page text extraction.

## Phase 2 - Skill flow
- Fetch topics.
- Compare with local skill cache.
- Show modal only for missing topics.
- Persist ratings locally and via `/skills`.

## Phase 3 - Streaming summary UI
- Connect SSE.
- Render progressive updates.
- Render final structured cards.

## Phase 4 - Polish
- Loading/error states.
- Copy buttons.
- Last summary cache.

## 14) Testing Strategy

Backend:
- Unit: prompt builders, schema parsing.
- Integration: route contract tests for all three endpoints.
- Contract: ensure `done` event matches summary schema exactly.

Extension:
- Unit: missing-topic detection logic.
- Integration: popup state transitions (idle -> detect -> rate -> stream -> done).
- Manual: run on docs/blog/news pages.

## 15) Open Decisions (Need Locking Before Build)

1. Auth transport: cookie session vs bearer JWT for extension requests.
2. Skill scale UX: `1-10` (locked in API now) vs `beginner/intermediate/advanced` mapped internally.
3. Topic normalization source: pure LLM vs LLM + canonical dictionary.
4. Whether to store summary history in v1 DB.

## 16) Immediate Refactors to Current Code

1. Update `summarySchema.ts`:
   - replace `tweet` with `post`
   - remove `difficultyScore` and `skillGapInsights`
   - add `signal` and optional `meta`
2. Add `topicSchema.ts` and request schemas for all routes.
3. Implement `skills.ts` route (currently missing file).
4. Standardize naming to `summarize` across files.

