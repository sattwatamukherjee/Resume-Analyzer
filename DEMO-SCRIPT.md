# Demo Script — ResumeIQ

A scripted walkthrough for a live demo. Each section is 1–2 minutes. Total runtime: ~8 minutes. Adjust based on audience and time available.

---

## Before the Demo

Have these open in separate tabs:
1. The ResumeIQ app (logged in)
2. A sample resume text (paste from below or use a real PDF)
3. A sample job description (paste from below)

**Sample job description to use:**
```
Software Engineer — Backend (Python/Go)
Requirements:
- 3+ years of backend development experience
- Proficiency in Python or Go
- Experience with RESTful API design
- Knowledge of PostgreSQL, Redis, or other databases
- Experience with Docker and Kubernetes
- Understanding of CI/CD pipelines (GitHub Actions, Jenkins)
- Strong fundamentals in data structures and algorithms
- Experience with distributed systems preferred
- AWS or GCP experience a plus
Responsibilities:
- Design and build scalable backend services
- Write unit and integration tests
- Collaborate with frontend engineers on API contracts
- Participate in on-call rotation
- Review code and mentor junior engineers
```

---

## Opening (30 seconds)

"ATS systems reject 75% of resumes before a human sees them. Most candidates never find out why. ResumeIQ solves that — you drop your resume and paste a job description, and in about 15 seconds you get a detailed breakdown of your ATS score, which skills you're missing, specific weak points in your resume, and actionable suggestions with example rewrites."

---

## Section 1: Landing Page (1 minute)

"Here's the landing page. We've got the product pitch — 'Stop guessing. Start optimizing.' — and three value propositions: instant feedback, skill gap analysis, and actionable suggestions.

Right now I'm not signed in, so if I click 'Try Analyzer Now' or navigate to the analyzer page, I'd be redirected to sign in. Let me do that now."

*[Click Sign In — complete the login flow]*

"Once signed in, the landing page becomes a dashboard. If I had previous analyses, I'd see my average score, total analyses run, and recent history here. Let me go run our first analysis."

---

## Section 2: Running an Analysis (2 minutes)

*[Navigate to /analyze]*

"This is the analyzer page. Two steps — upload the resume, paste the job description.

I'm going to drop in a PDF. Watch how it extracts the text client-side — no file upload to a server, no storage. The PDF parsing happens right here in the browser using Mozilla's PDF.js library."

*[Drop or select a PDF file]*

"You can see it extracted the text — X characters. Now I'll paste in the job description."

*[Paste the sample job description from above]*

"Notice the character count — it's tracking both fields and will keep the submit button disabled until both have at least 50 characters. Simple input validation before wasting an AI call.

Now I'll submit. This takes 5–15 seconds while GPT-4o processes the resume."

*[Click Analyze Resume]*

"The loading state cycles through meaningful messages: 'Parsing resume...', 'Extracting keywords...', 'Matching job requirements...', 'Calculating ATS score...'. This gives users something to watch rather than a spinner."

*[Wait for redirect to results]*

---

## Section 3: Results Page (3 minutes)

"Here are the results. The score gauge animates in — in this case we got a [X]. Let me explain the breakdown on the left:

- **Keyword Match** — how well the resume's language matches the job description's terminology
- **Format Score** — whether the resume follows ATS-friendly formatting
- **Experience Relevance** — how closely the experience aligns with what the role requires
- **Education Match** — relevant degrees and certifications

The gauge color codes automatically: red under 50, amber 50–69, blue 70–84, green 85+.

Now let's look at the tabs."

*[Click 'Matched Skills' tab]*

"Matched skills — these are keywords and skills that appear in both the resume and the job description, with importance ratings. High importance means this skill was a primary requirement. The AI doesn't just do string matching — it understands synonyms. If the job says 'version control' and the resume says 'Git', it recognizes the match."

*[Click 'Missing Skills' tab]*

"Missing skills — this is the actionable part for candidates. These are requirements from the job description that aren't present or aren't prominent enough in the resume. For each skill, there's an importance rating — focus on the high-importance ones first."

*[Click 'Weak Points' tab]*

"Weak points are section-level issues. Critical issues (red) are deal-breakers — things like no quantified achievements or missing relevant sections. Moderate issues need fixing. Minor issues are nice-to-haves."

*[Click 'Suggestions' tab]*

"Suggestions are where this becomes genuinely useful. Each suggestion has a category, a specific recommendation, an impact rating, and — where appropriate — an example rewrite. This isn't 'add more keywords.' It's 'your accomplishments section lacks quantifiable metrics — instead of "improved system performance", try "reduced API response time by 40% by implementing Redis caching.'"

---

## Section 4: History Page (1 minute)

*[Navigate to /history]*

"The history page lists all past analyses. You can see the ATS score, the job title the AI inferred from the job description, the filename, and when it was run.

There's a search filter — you can find a specific role or file. Clicking any row takes you back to the full results.

The delete button removes the analysis from history and invalidates the dashboard stats — watch how the average score on the dashboard would update after a deletion."

---

## Closing (30 seconds)

"To summarize: the key technical decisions were OpenAPI-first code generation (one spec, type-safe frontend and backend), GPT-4o with structured JSON mode (consistent output schema), JSONB columns for AI output (queryable, schema-flexible), and Replit Auth OIDC for authentication.

Questions?"

---

## Common Demo Questions

**"What if the PDF doesn't extract well?"**
"For complex PDFs with tables or multi-column layouts, text extraction can lose some formatting context. The extracted character count gives users a hint — if they see very few characters from a full resume, they can paste the text directly instead. A future improvement would be falling back to a server-side extraction with a more robust parser like Tesseract for image-based PDFs."

**"How much does each analysis cost?"**
"A typical resume analysis uses about 2,000–4,000 tokens for input and 800–1,200 tokens for output. At GPT-4o pricing, that's roughly $0.01–0.02 per analysis."

**"Can someone analyze other people's resumes?"**
"No — the analyses route checks `analysis.userId === req.user.id` before returning data. If you try to access another user's analysis ID, you get a 403. The Zod validators also ensure the ID is a valid number, preventing injection attacks."
