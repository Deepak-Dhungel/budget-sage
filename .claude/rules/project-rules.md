# BudgetSage Project Rules

## Always Do

- Read CLAUDE.md before starting any task
- Get userId from Clerk auth() server-side, never from client
- Write to AgentLog table after every agent action
- Use the Prisma singleton from src/lib/prisma.ts
- Validate all API inputs with Zod
- Use TypeScript strict types — no `any`
- Run `npx prisma migrate dev` after every schema change
- Use Next.js App Router conventions always

## Never Do

- Never use Pages Router
- Never instantiate PrismaClient directly — use the singleton
- Never expose raw error messages to the frontend
- Never hardcode API keys or secrets
- Never call specialist agents directly from the frontend
- Never skip the AgentLog entry in an agent

## Code Patterns

- All API routes: validate input → get userId from Clerk → query DB → return typed response
- All agents: receive context → call tools → log to AgentLog → return structured response
- All tool functions live in src/tools/ and are pure async functions
