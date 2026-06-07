# Salary Management System

A full-stack HR Salary Management System built for 10,000+ employees.

## Tech Stack
- **Monorepo**: TurboRepo
- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: NestJS, TypeORM, MySQL
- **Queue**: BullMQ + Redis
- **Auth**: JWT + bcrypt
- **Export**: ExcelJS
- **Tests**: Jest (44 tests, 100% AuthService coverage)

## Features
- HR Manager authentication (JWT)
- Employee CRUD with pagination, search, filters
- Salary insights and analytics dashboard
- Export to CSV and Excel
- Audit logging via BullMQ
- Salary history tracking
- 10,000 employee seed script (6 seconds)

## Quick Start
```bash
# Setup environment
cp .env.example .env
# Edit the root .env with your DB/Redis credentials

# Copy environment configurations to both backend/frontend
pnpm env:setup

# Install dependencies (automatically handles build approvals)
pnpm install

# Run database migrations
pnpm migration:run

# Seed master data
pnpm seed

# Seed admin user
pnpm seed:admin

# Seed 10,000 employees (optional)
pnpm seed:employees

# Start development
pnpm dev
```

## Access
- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Default admin: admin@salary.com / Admin@123

## Project Structure
```
salary-management/
├── apps/
│   ├── web/     # Next.js frontend
│   └── api/     # NestJS backend
├── packages/
│   ├── types/   # Shared TypeScript interfaces
│   └── db/      # Shared DB config
└── docs/        # Documentation
```

## Scripts
```bash
pnpm dev              # Start both apps
pnpm build            # Build all
pnpm test             # Run tests
pnpm env:setup        # Copy environment variables from root .env to sub-apps
pnpm migration:run    # Run DB migrations
pnpm seed             # Seed master data
pnpm seed:admin       # Seed admin user
pnpm seed:employees   # Seed 10,000 employees
```
