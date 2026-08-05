# ResumeIQ — AI Resume Analyzer

A full-stack, production-quality web application that analyzes software engineering resumes against job descriptions using GPT-4o, generating an ATS compatibility score, skill gap analysis, weak point identification, and personalized improvement suggestions.

---

## Features

- **AI-powered ATS scoring** — 0–100 score calibrated against real ATS criteria
- **Skill gap analysis** — matched vs. missing skills with importance ratings (high/medium/low)
- **Weak point detection** — identifies section-level issues with severity (critical/moderate/minor)
- **Actionable suggestions** — categorized improvement recommendations with example rewrites
- **Score breakdown** — Keyword Match, Format, Experience Relevance, Education sub-scores
- **Analysis history** — full CRUD history with search, delete, and drill-down
- **Dashboard stats** — average score, highest/lowest, top missing skills across all analyses
- **PDF extraction** — client-side PDF parsing via pdfjs-dist (no server upload required)
- **Authentication** — Replit Auth (OIDC/PKCE), session stored in PostgreSQL
- **Dark mode** — full dark/light theme toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, Lucide icons |
| State | TanStack Query v5 (React Query) |
| Routing | Wouter |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| AI | OpenAI GPT-4o (structured JSON mode) |
| Auth | Replit Auth (OIDC/PKCE via openid-client) |
| API layer | OpenAPI 3.1 → Orval → React Query hooks + Zod validators |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
/
├── artifacts/
│   ├── resume-analyzer/        # React + Vite frontend
│   │   └── src/
│   │       ├── pages/          # Home, Analyze, Results, History
│   │       ├── components/     # Gauge, Layout, shadcn/ui
│   │       └── lib/            # utils (score colors)
│   └── api-server/             # Express backend
│       └── src/
│           ├── routes/         # auth.ts, analyses.ts, index.ts
│           ├── lib/            # auth.ts, openaiClient.ts, resumeAnalyzer.ts
│           └── middlewares/    # authMiddleware.ts
├── lib/
│   ├── api-spec/               # OpenAPI 3.1 spec + Orval codegen config
│   ├── api-client-react/       # Generated React Query hooks (do not edit)
│   ├── api-zod/                # Generated Zod validators (do not edit)
│   ├── db/                     # Drizzle schema, client, migrations
│   └── replit-auth-web/        # useAuth() hook for the frontend
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (Replit provides one automatically)
- OpenAI API key

### Environment Variables

Set the following in your environment (Replit Secrets):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o access required) |
| `SESSION_SECRET` | Random string for session signing |
| `REPL_ID` | Set automatically by Replit |

### Setup

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Regenerate API client (after spec changes)
pnpm --filter @workspace/api-spec run codegen

# Start development servers
# Frontend:
pnpm --filter @workspace/resume-analyzer run dev
# Backend:
pnpm --filter @workspace/api-server run dev
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/auth/user` | Current authenticated user |
| GET | `/api/login` | Begin OIDC login |
| GET | `/api/callback` | OIDC callback |
| GET | `/api/logout` | Clear session |
| GET | `/api/analyses` | List user's analyses |
| POST | `/api/analyses` | Create new analysis |
| GET | `/api/analyses/stats` | Dashboard statistics |
| GET | `/api/analyses/:id` | Get specific analysis |
| DELETE | `/api/analyses/:id` | Delete analysis |

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed technical walkthrough.

## Interview Prep

See [INTERVIEW-GUIDE.md](INTERVIEW-GUIDE.md) for a complete set of interview questions and answers about this project.
