# Architecture

## System Overview
```
Browser (Next.js)
    ↓ HTTP/Axios
NestJS API (port 3001)
    ↓
MySQL Database
    ↓ (async)
BullMQ → Redis → Audit Processor
```

## Database Schema
The database contains the following 8 core tables:
- **`countries`** (249 records): Master data directory storing international country entries, names, and localized default currencies.
- **`states`** (4,873 records): Master data directory storing state or provincial subdivisions mapped back to their respective countries.
- **`departments`** (10 records): Standardized functional departments (e.g. Engineering, Sales, Human Resources).
- **`job_titles`** (15 records): Standardized corporate job titles and roles within the organization.
- **`hr_managers`** (authenticated users): Administrative and supervisor profiles authorized to perform database entries and adjust salaries.
- **`employees`** (10,000+ records): Individual profile records tracking organizational assignments, salaries, active/inactive statuses, and personal details.
- **`salary_history`** (salary audit log): Tracks historical adjustments to employee salaries, capturing the old salary, new adjusted salary, and approving HR manager.
- **`audit_logs`** (async events via BullMQ): Audited activities and security logs processed asynchronously to avoid slowing down API responses.

## API Modules
- **`AuthModule`**: Handles HR Manager signup, login, token signatures, session validation, and password hash validations.
- **`EmployeesModule`**: Orchestrates employee CRUD operations, handling complex parameters for search, filtering, and pagination.
- **`InsightsModule`**: Aggregates compensation statistics, distribution data, and performance rankings.
- **`ExportModule`**: Exports data sets dynamically into standardized CSV or binary Excel sheets using ExcelJS.
- **`AuditModule`**: Manages background queue operations using BullMQ and Redis to log system access and modifications asynchronously.

## Frontend Pages
- **`/login`**: Directs users to verify credentials and stores JWT tokens in local storage.
- **`/register`**: Allows administrative accounts to create new HR manager logins.
- **`/dashboard`**: Provides cards detailing total employee counts, average, minimum, and maximum salaries.
- **`/employees`**: Workforce Directory table supporting search debouncing, complex filters, and pagination.
- **`/employees/new`**: Cascading input form designed to create new employee profiles.
- **`/employees/[id]`**: Employee profile dashboard displaying personal info and salary history audit tables.
- **`/employees/[id]/edit`**: Updates profile values and logs salary adjustments when the base rate changes.
- **`/insights`**: Visual analytics dashboards powered by Recharts (BarCharts, vertical graphs, and rankings).
- **`/export`**: Export control center for bulk data extractions (Employees, HR Managers, and Audits).

## Key Design Decisions
1. **BullMQ for audit logs**: Pushes audit data to a Redis-backed queue. Background workers process it asynchronously, ensuring API requests finish instantly.
2. **Soft delete via status**: Rather than executing physical SQL deletion, profiles are set to `inactive` state (`status = 'inactive'`) to preserve historical audit logs and salary entries.
3. **High Performance Seeding**: Seeder executes bulk inserts of 500 records at a time within single SQL transactions, populating 10,000 employees in roughly 6 seconds.
4. **OnPush-style React rendering**: Minimizes unnecessary DOM updates via strategic React state hooks, memoization, and callback definitions.
5. **Axios Interceptors**: Transparently attaches Authorization JWT tokens to outbound requests and handles automated 401 redirects to `/login`.
6. **TurboRepo Workspace Layout**: Configures monorepo workspaces to share unified TypeScript schemas (in `@salary-management/types`) and database definitions (in `@salary-management/db`) across front and backend modules.
