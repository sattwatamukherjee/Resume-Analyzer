# Project Walkthrough — ResumeIQ

A narrative explanation of every major technical decision, intended to help you speak confidently and in depth about this project in a technical interview.

---

## 1. Why I Built This

The problem: ATS (Applicant Tracking Systems) reject 70–80% of resumes before a human sees them, but candidates have no visibility into why. Job seekers submit the same resume to dozens of positions without knowing which keywords to add or which sections to improve. I built ResumeIQ to make that feedback loop instant and actionable.

The technical challenge: the feedback needs to be personalized to each specific job description, not generic advice. That means AI is the right tool — specifically, GPT-4o's ability to understand both natural language (resume prose) and structured requirements (job description requirements) and produce calibrated, structured output.

---

## 2. Starting with the API Contract

Before writing any frontend or backend code, I defined the OpenAPI spec. This was intentional: when both sides of an API are developed simultaneously, type drift is the most common source of bugs. If the frontend calls `/api/analyses` expecting `{ id: number, atsScore: number }` but the backend returns `{ id: string, ats_score: number }`, you get a runtime error instead of a compile-time error.

By writing the spec first and generating code from it, the contract becomes the source of truth. If I add a field to the OpenAPI response schema, Orval regenerates the TypeScript types and the frontend immediately sees the new field with full type safety. If I remove a field, every usage of it in the frontend becomes a compile error.

**Key learning:** OpenAPI-first is most valuable at the boundary between teams or between independently deployable services. Even in a monorepo, it enforces discipline and creates documentation for free.

---

## 3. The Codegen Pipeline

Running `pnpm --filter @workspace/api-spec run codegen`:

1. **Orval** reads `openapi.yaml` and generates two outputs:
   - `lib/api-client-react/src/generated/api.ts` — one React Query hook per operation, with typed parameters, return types, and error types
   - `lib/api-zod/src/generated/api.ts` — one Zod schema per request/response body
2. **TypeScript** (`tsc --build`) verifies the generated code compiles against all downstream packages

If either step fails, the codegen script exits non-zero and no partial state is committed. This makes the pipeline atomic — you always have a fully consistent codebase.

**Zod v4 compatibility note:** Orval v8 generates Zod v4 syntax (`zod.int()`, `zod.email()`) but the workspace used `zod@3.25.76`. The fix: remove `format: email` and `format: uri` annotations from the spec (which trigger the v4-only validators) and use `type: number` instead of `type: integer` (which maps to `z.number()` instead of `z.int()`). This demonstrates understanding of the codegen pipeline — when you own the spec, you can design around generator limitations.

---

## 4. Database Design

I chose PostgreSQL with Drizzle ORM. Three tables:

**users** — created/updated by Replit Auth on each login. The primary key is the Replit `sub` claim (a stable opaque string), not a UUID. This means the users table is always consistent with Replit's identity, even if a user changes their email.

**sessions** — a custom session store rather than using a library like `connect-pg-simple`. Each session is a row with a SID, a JSONB blob (user data + tokens), and an expiry timestamp. The `getSession` function deletes expired sessions on read — a lazy cleanup strategy that avoids needing a background job.

**analyses** — this is where the interesting design choice is. The AI output has a complex nested structure (arrays of skill items, weak points, suggestions). I stored these as JSONB columns rather than normalizing them into separate tables. The rationale:

- The AI output is always written and read as an atomic unit (never partially updated)
- JSONB is queryable — I could add `analyses WHERE matched_skills @> '[{"skill": "React"}]'` later
- Normalizing would require 4+ additional tables with foreign keys, increasing query complexity for no immediate benefit
- The schema of AI output is likely to evolve — JSONB absorbs schema changes without migrations

---

## 5. Authentication with OIDC/PKCE

Replit Auth uses the Authorization Code flow with PKCE (Proof Key for Code Exchange). PKCE was originally designed for mobile/native apps that can't keep a client secret, but it's now recommended for all OAuth flows because it protects against authorization code interception attacks.

The flow:
1. Generate `code_verifier` (random 64-byte string) and `code_challenge` (SHA-256 hash of verifier, base64url-encoded)
2. Redirect to authorization endpoint with `code_challenge` and `code_challenge_method=S256`
3. On callback, exchange `code` + `code_verifier` — the server verifies the challenge matches the verifier
4. This means even if an attacker intercepts the authorization code, they can't exchange it without the verifier

The session is stored in the database (not as a JWT) because:
- Sessions can be revoked instantly (just delete the row)
- No token expiry complexity — the session TTL is a database timestamp
- No signature verification on every request — just a DB lookup

**CSRF protection:** The OIDC `state` parameter (a random nonce) is stored in a short-lived cookie and verified on the callback. If the state doesn't match, the callback is rejected.

---

## 6. The AI Prompt Strategy

The prompt I send to GPT-4o has several deliberate design choices:

**Structured output via JSON mode:** Using `response_format: { type: "json_object" }` guarantees the model returns valid JSON. Without this, even with strong prompting, the model occasionally wraps output in markdown code blocks or adds preamble text.

**Detailed output schema in the prompt:** I include the expected JSON structure with field descriptions inside the prompt, not just rely on the system message. This improves adherence to the schema, especially for nested objects.

**Score calibration instructions:** The prompt includes specific guidance for what each score range means:
- 85–100: Resume is tailored, keywords prominent, quantified achievements, clean format
- 70–84: Good foundation but some keyword gaps or formatting issues
- 50–69: Significant gaps in keyword coverage or missing sections
- 0–49: Resume is generic or poorly formatted for this role

This produces more consistent scores than just asking the model to "score the match" — without calibration, GPT-4o tends toward middle scores.

**Input validation before AI call:** I validate that `resumeText.length >= 50` and `jobDescription.length >= 50` before calling the OpenAI API. This prevents wasted API calls on accidental empty submissions and gives users faster, more specific error messages.

---

## 7. Frontend Architecture

The frontend is a React SPA with four pages, managed by wouter (2KB routing library). Key patterns:

**Generated hooks for all data fetching:** Every API call goes through a hook from `@workspace/api-client-react`. This means loading states, error handling, and cache invalidation are automatic. The only manual work is invalidating specific query keys after mutations.

**Optimistic caching strategy:** After creating an analysis, I redirect to `/results/:id` immediately while the page fetches the full analysis data. The `useGetAnalysis(id)` hook starts fetching as soon as the ID is available. This keeps the UX fast — the redirect is instant and the content loads in ~200ms from the DB (the AI processing already completed before the POST returned).

**Client-side PDF extraction:** pdfjs-dist runs in the browser. The worker is loaded from unpkg CDN to avoid bundling it (it's ~300KB). The extraction iterates all pages, collects text items, and joins them with spaces and newlines. The result is validated (character count check) before enabling the submit button.

---

## 8. What I Would Do Differently

**Response streaming:** The 5–15 second wait for AI analysis feels long. With streaming, I could show partial results as they arrive — show the ATS score first, then stream in the skills and suggestions. This would require SSE (Server-Sent Events) or WebSockets on the backend and a streaming parser on the frontend.

**Worker queue for AI calls:** Direct synchronous AI calls block the Express thread (well, not the event loop, but conceptually). A proper production system would push analysis jobs to a queue (Bull/BullMQ with Redis) and return a job ID immediately. The frontend would poll for completion. This also enables retries on transient OpenAI errors.

**Zod validation on API inputs in Express:** Currently the backend validates inputs with simple if-statements. A better pattern would be to use the generated Zod schemas from `@workspace/api-zod` as Express middleware, so any request that doesn't match the schema is rejected at the route boundary with a structured 400 response.
