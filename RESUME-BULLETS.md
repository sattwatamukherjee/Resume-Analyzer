# Resume Bullets — ResumeIQ

Ready-to-use resume bullet points for listing this project in your portfolio section. Tailor to the specific role you're applying for by emphasizing the most relevant aspects.

---

## One-Liner (for space-constrained formats)

**ResumeIQ** — Full-stack AI resume analyzer: React/Vite + Node/Express + GPT-4o + Drizzle/PostgreSQL; OpenAPI-first codegen with Orval; Replit Auth OIDC/PKCE; client-side PDF extraction.

---

## Standard 3-Bullet Format

**ResumeIQ | AI Resume Analyzer** *(TypeScript, React, Node.js, PostgreSQL, OpenAI)*
- Built a full-stack AI resume analyzer using GPT-4o to generate ATS compatibility scores (0–100) with matched/missing skills, weak point detection, and personalized improvement suggestions with example rewrites
- Designed an OpenAPI 3.1 spec as the single source of truth and implemented an Orval code generation pipeline that produces type-safe React Query hooks and Zod validators, eliminating client–server type drift at compile time
- Implemented Replit Auth using OIDC/PKCE with a custom PostgreSQL session store; client-side PDF extraction via pdfjs-dist; JSONB columns for flexible AI output storage with full CRUD analysis history

---

## Expanded 5-Bullet Format

**ResumeIQ | AI Resume Analyzer** *(TypeScript, React, Vite, Node.js, Express, PostgreSQL, OpenAI GPT-4o)*
- Built a production-quality full-stack AI tool that analyzes software engineering resumes against job descriptions, generating ATS scores, skill gap analysis, weak point identification, and actionable improvement suggestions with example rewrites
- Designed an OpenAPI 3.1 spec as the single contract between frontend and backend; configured Orval v8 to generate typed React Query hooks and Zod validators from the spec, catching API contract violations at compile time rather than runtime
- Architected a pnpm monorepo with two runnable artifacts (React/Vite SPA + Node/Express API) and four shared libraries (API spec, generated client, Drizzle ORM schema, browser auth); maintained clean dependency boundaries with TypeScript project references
- Implemented Replit Auth using OIDC/PKCE via openid-client with a server-side PostgreSQL session store, enabling instant session revocation; structured JSONB columns for AI output to support queryable flexible schema
- Engineered client-side PDF text extraction using pdfjs-dist to eliminate file upload infrastructure; integrated GPT-4o with JSON mode and calibrated prompting for consistent ATS score distributions across diverse resumes and job descriptions

---

## Role-Specific Variants

### Targeting Frontend Roles
- Built the frontend for ResumeIQ, a full-stack AI resume analyzer: React + Vite SPA with TanStack Query v5 for all data fetching, wouter for routing, Tailwind CSS v4 + shadcn/ui for UI, and animated SVG gauge components with `requestAnimationFrame` score animations
- Integrated a code-generated API client from an OpenAPI spec using Orval, giving every API call a typed return value, loading state, and error type — eliminating `any` casts and manual loading state management

### Targeting Backend Roles
- Built the backend for ResumeIQ: Node.js + Express API with Drizzle ORM on PostgreSQL, OpenAI GPT-4o integration with structured JSON mode and calibrated prompting, OIDC/PKCE authentication with custom session management, and row-level authorization ensuring users can only access their own analyses
- Designed the data model with JSONB columns for AI output (flexible schema for evolving AI responses), composite indexes for user-scoped queries, and lazy session expiry cleanup to avoid background job complexity

### Targeting Full-Stack Roles
- Designed and built ResumeIQ end-to-end: OpenAPI-first contract with Orval codegen, React/Vite frontend with TanStack Query, Express/Node backend with Drizzle ORM + PostgreSQL, GPT-4o integration, and Replit Auth OIDC/PKCE — deployed as a pnpm monorepo with two services and four shared libraries
- Made deliberate architectural tradeoffs: OpenAPI over tRPC for REST interoperability, JSONB over normalized tables for AI output flexibility, client-side PDF extraction to eliminate file upload infrastructure, and database sessions over JWT for instant revocability

### Targeting ML/AI-Adjacent Roles
- Integrated GPT-4o into an ATS resume analyzer using structured JSON mode with calibrated prompting that produces consistent score distributions (0–100) across diverse resume/JD combinations; validated all AI output with Zod schemas before database writes to prevent corrupt data
- Designed the prompt to include score calibration instructions (what constitutes a 70 vs. an 85) and a full JSON output schema in the system message, improving adherence to the expected structure compared to relying on model defaults alone

---

## GitHub / Portfolio Description

**ResumeIQ** — An AI-powered ATS resume analyzer built for software engineers. Upload a resume (PDF parsed client-side), paste a job description, and get a 0–100 ATS score with matched/missing skills, weak point analysis, and actionable suggestions with example rewrites — all in ~15 seconds.

**Stack:** TypeScript monorepo (pnpm) · React + Vite · Node.js + Express · PostgreSQL + Drizzle ORM · OpenAI GPT-4o · Replit Auth (OIDC/PKCE) · OpenAPI 3.1 + Orval codegen · TanStack Query · Tailwind CSS v4 · shadcn/ui

**Key decisions:** OpenAPI-first code generation eliminates client–server type drift · JSONB columns for flexible AI output storage · Client-side PDF extraction avoids file upload infrastructure · Database sessions for instant revocability
