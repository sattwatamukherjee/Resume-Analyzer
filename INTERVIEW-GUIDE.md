# Interview Guide — ResumeIQ

A complete set of likely interview questions about this project, with detailed answers. Use this to prepare for technical interviews where you walk through a portfolio project.

---

## System Design Questions

### "Walk me through the overall architecture."

"ResumeIQ is a full-stack TypeScript monorepo with two runnable services: a React/Vite SPA and a Node/Express API. They share a pnpm workspace with four libraries — an OpenAPI spec that drives code generation, a database layer with Drizzle ORM, a generated React Query client, and a browser auth package.

The key architectural decision was OpenAPI-first code generation. I write the API contract once in an OpenAPI 3.1 YAML file, then run Orval to generate both React Query hooks for the frontend and Zod validators for the backend. Any drift between the client and server types is a compile-time error, not a runtime bug."

---

### "Why code generation instead of tRPC or a shared types package?"

"tRPC is great for projects where the backend is TypeScript and you control both ends. But for a portfolio project, OpenAPI is more valuable because it's language-agnostic — any client (mobile, third-party, Postman) can consume the API without a TypeScript runtime. OpenAPI is also the industry standard, so it demonstrates real-world API design skills better than a tRPC router. The codegen approach means I get tRPC-level type safety with REST-level interoperability."

---

### "How does the authentication work?"

"I implemented Replit Auth using OpenID Connect with PKCE. When a user clicks Sign In, the server generates a code verifier and challenge, then redirects to Replit's authorization endpoint. Replit redirects back with an authorization code, the server exchanges it for an ID token via openid-client, extracts claims (sub, email, name), and upserts the user into a PostgreSQL users table.

The session is stored server-side: I generate a 32-byte random SID, write a JSON blob with the user and token data into a sessions table, and set the SID as an HttpOnly secure cookie. On every request, an authMiddleware reads the cookie, loads the session from the DB, verifies it hasn't expired, and populates `req.user`. This is more secure than JWTs because sessions can be invalidated instantly — just delete the row."

---

### "How does the PDF extraction work? Why client-side?"

"I use pdfjs-dist to parse PDF files entirely in the browser. The user drops a file, I read it as an ArrayBuffer, pass it to `pdfjsLib.getDocument()`, then iterate all pages calling `page.getTextContent()` to collect text items. The extracted text is then sent to the API.

Client-side extraction has three advantages: it avoids building file upload infrastructure (S3, multipart handling), it reduces server load, and it keeps the raw resume data private — only the extracted text touches our servers. The tradeoff is that complex PDFs with unusual encodings can lose formatting, but for text content this is acceptable."

---

### "How do you handle the AI integration? What's in the prompt?"

"I use GPT-4o's JSON mode via the OpenAI Node SDK. The prompt includes the full resume text, the full job description, and a detailed JSON schema for the expected output including field descriptions and type constraints. I also include calibration instructions — for example, ATS scores should reflect keyword density, quantifiable achievements, format clarity, and section completeness rather than just keyword counting.

Using `response_format: { type: 'json_object' }` guarantees a parseable response. I then validate the parsed object with a Zod schema before writing it to the database. If validation fails, the user gets a 500 error rather than corrupt data in the DB."

---

### "How do you store structured AI output in PostgreSQL?"

"I use JSONB columns for all the array and object fields from the AI response — `matched_skills`, `missing_skills`, `weak_points`, `suggestions`, `score_breakdown`. JSONB is binary-stored and indexable, which means I could add GIN indexes later to query across all analyses for a specific missing skill.

The tradeoff versus a normalized schema is that you lose foreign key integrity on the nested objects. For this use case it's acceptable because the AI output is always written as an atomic unit and never updated in place — I only insert and delete."

---

## Frontend Questions

### "How do you manage data fetching and caching?"

"All data fetching goes through TanStack Query v5. The generated React Query hooks from Orval handle loading/error states, background refetching, and cache invalidation automatically. When an analysis is created, I manually invalidate the `listAnalyses` and `getUserStats` query keys so the dashboard and history update immediately without a page refresh. I disabled `refetchOnWindowFocus` globally because the data is expensive to generate and doesn't change from other tabs."

---

### "How does the score gauge animation work?"

"The Gauge component renders an SVG with a circular arc. The score is animated using a CSS custom property that drives a `stroke-dashoffset` on the arc path. I use a `useEffect` with a `requestAnimationFrame` loop to increment the displayed score from 0 to the target over about 800ms using an easing function. The color transitions through CSS by computing the appropriate class (red/amber/blue/green) based on the final score value."

---

### "How do you handle the analyzing loading state?"

"When `useCreateAnalysis().isPending` is true, I render a full-screen overlay with a cycling message system. A `useEffect` sets up a `setInterval` that increments a message index every 2 seconds through an array: 'Parsing resume...', 'Extracting keywords...', 'Matching job requirements...', 'Calculating ATS score...'. This gives users immediate visual feedback and sets realistic expectations for the 5–15 second AI processing time."

---

## Backend Questions

### "How does authorization work on the analyses routes?"

"The authMiddleware checks every request for a valid session. If the session is missing or expired, `req.user` is null and `req.isAuthenticated()` returns false. The analyses routes check `req.isAuthenticated()` and return 401 if false. For individual analysis operations (GET, DELETE), I additionally check that `analysis.userId === req.user.id` and return 403 if not — users can only access their own analyses."

---

### "How did you structure the Express routes?"

"The main `app.ts` mounts a single router at `/api` which in turn mounts sub-routers: a health router, an auth router, and an analyses router. Each router file is self-contained with its handlers co-located. The auth middleware runs on every request at the app level. This structure keeps the entry point minimal and makes each domain independently testable."

---

### "What would you add if this were a real product?"

1. **Rate limiting** — per-user and global limits on the `/analyses` POST endpoint to control OpenAI costs
2. **File storage** — store the original PDFs in S3 for re-analysis without re-uploading
3. **Streaming responses** — stream the GPT-4o output back to the client so users see results appear progressively
4. **Analysis comparison** — side-by-side diff between two analyses for the same job
5. **Email reports** — send a formatted PDF report via email after analysis
6. **Subscription gating** — limit free users to N analyses per month

---

## Common Follow-up Questions

**"Why PostgreSQL over MongoDB?"** — Structured relations between users and analyses fit a relational model. JSONB gives us the schema flexibility of MongoDB for the AI output without sacrificing ACID guarantees on the user/session tables.

**"Why Drizzle over Prisma?"** — Drizzle is lighter and generates SQL that's closer to what you'd write by hand, making it easier to reason about query performance. Prisma adds a layer of abstraction that can produce surprising queries.

**"Why wouter over React Router?"** — Wouter is ~2KB vs. React Router's ~50KB. For a client-side app where routing is simple (4 routes, no data loading at the router level), wouter's tiny footprint is the right call.

**"How would you test this?"** — Unit tests on `resumeAnalyzer.ts` with mocked OpenAI responses, integration tests on the Express routes with a test database (separate schema or Docker), and end-to-end tests with Playwright covering the full upload → analyze → view results flow.
