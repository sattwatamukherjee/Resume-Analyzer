# Production Hardening Plan

This document tracks the security and reliability hardening work for Resume Analyzer.

## Priority fixes

1. Restrict CORS to the deployed frontend origin and localhost development origins.
2. Validate OpenAI structured output at runtime with Zod before persistence.
3. Return safe client-facing errors while keeping detailed errors in server logs.
4. Validate API inputs consistently at runtime.
5. Add a per-user analysis rate limit to protect the OpenAI API.
6. Review authentication/session cookie settings and user-ownership checks.
7. Avoid logging raw resume contents or sensitive credentials.
8. Add focused automated tests for authentication, ownership, validation, AI output validation, and deletion.

## Important product limitation

The ATS score is currently an AI-generated evaluation rather than a deterministic score produced by a traditional ATS parser. Product copy and interview explanations should describe it as an AI-powered resume evaluation/scoring system unless a deterministic scoring engine is added.

## Scalability note

The dashboard's missing-skill aggregation currently operates over a user's analysis records in application code. This is acceptable for the current project scale. At larger scale, aggregation should move into PostgreSQL or a normalized skills table.

## Verification checklist

- [ ] CORS restricted
- [ ] AI output validated with Zod
- [ ] Safe API error responses
- [ ] Runtime input validation
- [ ] Rate limiting
- [ ] Session/auth review
- [ ] Sensitive logging review
- [ ] Automated tests
- [ ] Production build/typecheck/lint
- [ ] Live deployment smoke test
