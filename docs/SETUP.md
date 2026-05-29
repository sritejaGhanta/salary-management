# Setup Guide

This guide will walk you through setting up the Salary Management System monorepo from scratch.

## Prerequisites
Ensure the following services are installed on your machine:
- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 8.0.0 or higher (preferably latest v11)
- **MySQL**: Database Server version 8.0.0 or higher
- **Redis**: Server version 6.0.0 or higher (needed for BullMQ queues)

---

## Installation Steps

### 1. Clone and Install Dependencies
Clone the repository and install workspace dependencies from the root directory:
```bash
git clone <repository_url> salary-management
cd salary-management
pnpm install
```

### 2. Configure Environments
Copy the environment template files in the root and configure credentials:
```bash
# In root workspace directory:
cp .env.example .env
cp .env.example apps/api/.env
```
Open `apps/api/.env` and update the database/Redis credentials to match your local setup (e.g. database password, username, host, and port).

### 3. Create the Database
Login to your MySQL terminal and create a new schema matches the configuration name (default is `salary_db`):
```sql
CREATE DATABASE salary_db;
```

### 4. Run Migrations
Run the schema migrations using TypeORM to create all 8 tables and relationships:
```bash
# Run migrations inside apps/api
cd apps/api
pnpm migration:run
cd ../..
```

### 5. Seed Database Master Data
Seed geographic directories, departmental roles, and administration users:
```bash
# Seed countries, states, departments, and job titles
pnpm seed

# Seed default Super Admin account (admin@salary.com / Admin@123)
pnpm seed:admin
```

### 6. Optional: Seed Mock Employees
Generate 10,000 mock employee records to test rendering performance and calculations:
```bash
# Runs high-performance seed scripts
pnpm seed:employees
```

### 7. Run the Development Server
Launch both Next.js frontend and NestJS API in parallel:
```bash
pnpm dev
```
Access the application portals:
- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Endpoint**: [http://localhost:3001/api](http://localhost:3001/api)

---

## Environment Variables

The NestJS backend requires these settings inside `apps/api/.env`:

| Key | Description | Default |
|:---|:---|:---|
| `DB_HOST` | Host address for MySQL server | `localhost` |
| `DB_PORT` | Port number for MySQL database | `3306` |
| `DB_USER` | Database connection login username | `root` |
| `DB_PASSWORD`| Database connection login password | `root` |
| `DB_NAME` | MySQL schema name to connect | `salary_db` |
| `JWT_SECRET` | Secret key used to sign JWT user tokens | `super-secret-key` |
| `JWT_EXPIRES_IN`| Session expiration period for JWT credentials | `24h` |
| `REDIS_HOST` | Host address for Redis server | `127.0.0.1` |
| `REDIS_PORT` | Port number for Redis connection | `6379` |

The Next.js frontend requires this setting inside `apps/web/.env.local` or environment configs:

| Key | Description | Default |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | Endpoint base address pointing to NestJS API | `http://localhost:3001/api` |
