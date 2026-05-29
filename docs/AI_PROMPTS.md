# AI Prompts Used

This project was built using **Antigravity IDE**, a Gemini-powered agentic coding tool capable of analyzing codebases, executing terminal commands, editing files, and running browser test assertions.

## Development Approach
We employed a Test-Driven and incremental development strategy:
- Each commit had a highly detailed instruction outlining directory structures, interfaces, behaviors, and testing assertions.
- The AI agent wrote code, resolved TypeScript type mismatches, ran tests, and ran browser-based verification checkpoints recursively.

## Prompts Summary

- **Commit 1: Monorepo Foundation**: Initialized the Turborepo monorepo workspace containing a Next.js web application and a NestJS API server.
- **Commit 2: Schema Migration & Database Entities**: Created the 8 Core entities (Country, State, Department, JobTitle, HRManager, Employee, SalaryHistory, AuditLog) with TypeORM and established migration routines.
- **Commit 3: Security & JWT authentication**: Setup access logic including salt hashing with bcrypt, JWT signatures, guard decorators, and self profile lookups.
- **Commit 4: Employee Management & BullMQ Audit Queue**: Implemented search, filtering, and soft deletes. Configured BullMQ to process user audits in Redis.
- **Commit 5: Insights and Business Analytics**: Programmed queries calculating average compensation groups by country, department, job title, and salary bands.
- **Commit 6: Spreadsheet Export Service**: Configured ExcelJS to generate CSV and xlsx spreadsheet downloads matching database records.
- **Commit 7: High-Performance Employee Seeding**: Built a seed script using file parsing to generate 10,000 randomized employee profiles in ~6 seconds using bulk inserts.
- **Commit 8: Comprehensive Service Testing**: Created Jest unit tests verifying core services (Auth, Employees, Insights, and Export).
- **Commit 9: Next.js Login and Registration UI**: Created the portal authentication forms with Zod, Axios, React Hook Form, and Tailwind CSS.
- **Commit 10: Next.js Employee CRUD Portal**: Integrated table layouts, cascading forms, filters, and salary logs inside Next.js routes.
- **Commit 11: Next.js Insights Dashboard with Charts**: Built visual components using Recharts (horizontal charts, bar distribution graphs) and file downloads.
- **Commit 12: Architecture & Setup Guides**: Compiled setup guidelines, API endpoints, schema structures, and project documentations.

## AI Tool Usage Guidelines
1. **Be Precise**: Prompts specified inputs, outputs, exact paths, validation constraints, and database relationships.
2. **Strict Verification**: Every step was verified using tests (`pnpm test`), compiler checks (`pnpm build`), and browser validation.
3. **Refinement Iterations**: Build errors and TypeScript types (such as Recharts tooltips and form resolvers) were addressed immediately.
