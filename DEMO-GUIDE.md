# Demo Guide — ResumeIQ

A practical guide for setting up and running the demo. Covers pre-demo checklist, sample content, technical FAQ, and tips for different audiences.

---

## Pre-Demo Checklist

- [ ] App is deployed and accessible at the production URL
- [ ] Logged in with your Replit account in the browser
- [ ] Sample PDF resume ready (ideally one with known gaps vs. your sample JD)
- [ ] Sample job description copied to clipboard
- [ ] Window is at 1280×800 or wider (UI is responsive but designed for desktop demo)
- [ ] Network connection is stable (AI call is 5–15 seconds; flaky wifi will cause awkward silence)
- [ ] No browser extensions that intercept cookies (can break auth)
- [ ] Dark mode or light mode set to your preference before starting

---

## Ideal Demo Scenario

For the most impactful demo, use a resume that will score **55–70** against your sample job description. This shows:

- A meaningful score (not perfect, not failing)
- Several missing skills (compelling gap analysis)
- 2–3 actionable suggestions with example rewrites
- A few weak points but not a disaster

A resume that scores 95+ produces a boring demo. A resume that scores 20 looks like the app doesn't work.

**Good approach:** use your own resume but against a job description in a different specialization. E.g., a frontend-focused resume against a backend/DevOps job description will naturally surface skill gaps.

---

## Sample Resume Text (paste this if you don't have a PDF)

```
Sarah Chen
sarah.chen@email.com | github.com/schen | linkedin.com/in/schen

EXPERIENCE

Senior Frontend Engineer — TechCorp (2021–Present)
- Built React-based dashboard serving 50,000 daily active users
- Reduced initial load time by 35% through code splitting and lazy loading
- Led migration from class components to hooks across 80% of codebase
- Collaborated with backend team on REST API design

Software Engineer — StartupXYZ (2019–2021)
- Developed features in React, TypeScript, and GraphQL
- Implemented real-time updates using WebSockets
- Wrote unit tests achieving 78% code coverage

SKILLS
React, TypeScript, JavaScript, HTML/CSS, GraphQL, REST APIs,
Git, Webpack, Jest, Node.js basics

EDUCATION
B.S. Computer Science — State University (2019)
GPA: 3.7

PROJECTS
Personal Blog Platform — React, Node.js, PostgreSQL
Open source component library — 200+ GitHub stars
```

---

## Sample Job Descriptions

### Backend Engineer (best gap vs. sample resume)
```
Backend Engineer — Infrastructure Team

Requirements:
- 3+ years backend development (Python, Go, or Node.js)
- Deep knowledge of PostgreSQL, query optimization, indexing
- Experience with Redis, message queues (Kafka, RabbitMQ)
- Docker and Kubernetes in production
- CI/CD experience (GitHub Actions, Jenkins, ArgoCD)
- AWS or GCP (EC2, RDS, Lambda, S3)
- Distributed systems design: consistency, availability, partitioning
- Strong understanding of HTTP, TCP/IP, DNS
- Experience with monitoring (Datadog, Prometheus, Grafana)

Responsibilities:
- Design and own backend services from architecture to production
- Build reliable, high-throughput data pipelines
- Implement observability: logging, metrics, alerting
- Write runbooks and conduct blameless postmortems
- On-call rotation (2 weeks per quarter)
```

### Senior Frontend (will score higher — use for contrast)
```
Senior Frontend Engineer — Product Team

Requirements:
- 4+ years of React development
- TypeScript proficiency required
- Experience with GraphQL and REST APIs
- Performance optimization: bundle size, rendering, Core Web Vitals
- Testing: Jest, React Testing Library
- Design system experience
- Collaboration with UX designers using Figma

Responsibilities:
- Build and maintain user-facing features
- Lead code reviews and mentor junior engineers
- Partner with design team on component APIs
- Drive frontend architecture decisions
```

---

## Audience-Specific Tips

### Technical Audience (engineers, CTOs)
- Lead with the code generation pipeline — this is the most interesting technical decision
- Explain the OpenAPI → Orval → type-safe hooks flow
- Mention the JSONB design decision and when you'd normalize instead
- Talk about OIDC/PKCE if the audience includes security-focused people
- Be ready to discuss what you'd add for production scale (rate limiting, queue, streaming)

### Non-Technical Audience (PMs, founders, recruiters)
- Start with the problem (ATS rejection rates, black box feedback)
- Focus on the user experience: file drop → 15 seconds → specific actionable feedback
- Show the suggestions tab with example rewrites — most concrete value
- Mention that it works on any job description (not templated)
- Skip the technical architecture unless asked

### Portfolio/Interview Context
- Walk through the architecture diagram from ARCHITECTURE.md verbally
- Mention the specific technical decisions and tradeoffs (see INTERVIEW-GUIDE.md)
- Have DEMO-SCRIPT.md open as a reference
- Be ready to share the GitHub repo or code on demand

---

## Troubleshooting

**Analysis takes more than 30 seconds:**
- Check the API server is running
- Check `OPENAI_API_KEY` is set correctly in environment secrets
- OpenAI API may be rate-limited; check the API server logs

**Login fails / redirect loop:**
- Check `REPL_ID` environment variable is set
- Check `SESSION_SECRET` is set
- Try clearing browser cookies for the domain

**PDF extraction shows 0 characters:**
- The PDF may be image-based (scanned document) — pdfjs-dist can't extract text from images
- Try a native PDF exported from Word, Google Docs, or a PDF editor
- Workaround: paste the resume text directly instead

**Score seems wrong / generic:**
- Ensure the job description is the full text (responsibilities + requirements), not just a title
- A very short job description (<200 chars) will produce a less calibrated score
- GPT-4o occasionally produces outlier scores; running the same resume again may give ±5 points variance
