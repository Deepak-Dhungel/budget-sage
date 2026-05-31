# BudgetSage — Claude Code Instructions

## Project Overview

BudgetSage is a full-stack, multi-agent AI financial copilot for personal use. Built with Next.js, PostgreSQL (Supabase), Prisma, Clerk auth, and Gemini AI. Full design document is at /docs/design-document.md — read it before making architectural decisions.

## Tech Stack

- Framework: Next.js App Router (never use Pages Router)
- Language: TypeScript
- Styling: Tailwind CSS only (no CSS modules, no inline styles)
- Auth: Clerk (@clerk/nextjs)
- Database: PostgreSQL via Supabase + Prisma ORM
- AI: Google Gemini 1.5 Flash (@google/generative-ai)
- Agent Framework: Custom TypeScript orchestration (no LangChain)

## Project Structure

src/
app/ # Next.js App Router pages
(auth)/ # Clerk auth pages
(dashboard)/ # Protected dashboard pages
api/ # API routes
agent/route.ts # Main agent endpoint
transactions/ # Transaction CRUD
subscriptions/ # Subscription CRUD
goals/ # Goals CRUD
agents/ # Agent logic
orchestrator.ts
budgetAgent.ts
spendingAgent.ts
subscriptionMonitor.ts
planningAgent.ts
anomalyAgent.ts
tools/ # Tool functions called by agents
budget.tools.ts
spending.tools.ts
subscription.tools.ts
lib/
prisma.ts # Prisma client singleton
gemini.ts # Gemini client singleton
types/ # Shared TypeScript types

## Critical Rules

- NEVER use the Pages Router. Always App Router.
- NEVER trust userId from the client. Always get it from Clerk's auth() server-side.
- ALWAYS run `npx prisma migrate dev` after schema changes.
- ALWAYS use the Prisma singleton from lib/prisma.ts (never instantiate directly).
- NEVER hardcode API keys. Always use process.env.
- Every agent action MUST write to the AgentLog table.
- The Orchestrator is the only agent the frontend calls directly.

## Agent Architecture

There are 5 specialist agents + 1 orchestrator:

1. OrchestratorAgent — classifies intent, routes to specialist agents
2. BudgetAgent — affordability checks, remaining budget
3. SpendingAnalysisAgent — trends, category breakdowns, forecasts
4. SubscriptionMonitorAgent — detects new/changed subscriptions (runs via cron)
5. PlanningAgent — savings goals and planning
6. AnomalyDetectionAgent — unusual spending spikes

## Database

- ORM: Prisma with Supabase PostgreSQL
- Schema is at prisma/schema.prisma
- Always use `prisma.findMany`, `prisma.create` etc — never raw SQL
- After any schema change: npx prisma migrate dev --name describe_change

## Build Order (follow this sequence)

1. Prisma schema + DB connection verified
2. Clerk auth middleware and protected routes
3. Onboarding wizard (budget + subscriptions setup)
4. /api/agent route + OrchestratorAgent
5. BudgetAgent + tools
6. Dashboard UI with real data
7. SpendingAnalysisAgent + Insights page
8. PlanningAgent + Goals page
9. SubscriptionMonitorAgent cron job
10. AnomalyDetectionAgent

## Code Style

- Use modern async/await with direct variable assignment and destructuring, never .then() chains
- All API routes return typed JSON responses
- Zod for input validation on all API routes
- Handle errors gracefully — never expose raw error messages to the frontend

## Environment Variables

All required env variables are listed in .env.local at the project root.
Never hardcode any of these values — always use process.env.VARIABLE_NAME.
The actual values are in .env.local which is gitignored and never committed.

Required variables:

- DATABASE_URL → Supabase Transaction Pooler connection string
- DIRECT_URL → Supabase Direct Connection string
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY → Clerk public key
- CLERK_SECRET_KEY → Clerk secret key
- GEMINI_API_KEY → Google AI Studio API key
