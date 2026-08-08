# ResumeIQ — AI Resume Analyzer

A full-stack web application that analyzes software engineering resumes against job descriptions and turns the results into practical, actionable improvements.

## What it does

- Generates an AI-powered ATS compatibility score
- Compares matched and missing skills
- Identifies weak resume sections and their severity
- Suggests concrete improvements and example rewrites
- Provides score breakdowns for keywords, formatting, relevance, and education
- Stores analysis history with search, deletion, and drill-down views
- Extracts text from PDFs directly in the browser
- Supports authenticated analysis history with PostgreSQL-backed sessions
- Includes a responsive dark/light interface

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, Lucide |
| State | TanStack Query v5 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI | OpenAI GPT-4o |
| Auth | Replit Auth (OIDC/PKCE) |
| API | OpenAPI 3.1, Orval, Zod |
| Monorepo | pnpm workspaces |

## Project Structure

```text
/
├── artifacts/
│   ├── resume-analyzer/        # React + Vite frontend
│   │   └── src/                # Pages, components, and client utilities
│   └── api-server/             # Express backend
│       └── src/                # Routes, AI services, auth, middleware
├── lib/
│   ├── api-spec/               # OpenAPI specification and code generation
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated request/response validators
│   ├── db/                     # Drizzle schema, client, migrations
│   └── replit-auth-web/        # Frontend authentication hook
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL
- OpenAI API key

### Environment Variables

Configure these values through your environment or Replit Secrets:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API access |
| `SESSION_SECRET` | Session signing secret |
| `REPL_ID` | Replit runtime identifier |

### Run locally

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-spec run codegen
```

Start the frontend and backend using their respective workspace development commands.

## Documentation

- [Architecture](ARCHITECTURE.md) — technical design and system walkthrough
- [Interview Guide](INTERVIEW-GUIDE.md) — project-focused interview preparation

## API

The backend exposes health, authentication, and resume-analysis endpoints under `/api`.

---

Built as a practical demonstration of AI, full-stack development, and resume intelligence.
