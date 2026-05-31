# API Documentation

## Base URL
All API calls are relative to the following base endpoint address:
```
http://localhost:3001/api
```

---

## Authentication
Every endpoint (except `POST /auth/login`) is protected by a JSON Web Token (JWT) verification guard.
To make requests, include your token in the HTTP Request Header:
```
Authorization: Bearer <your_jwt_token_here>
```

---

## Endpoints

### 1. Authentication
* **`POST /auth/login`**
  - **Access**: Public
  - **Body**:
    ```json
    {
      "email": "admin@salary.com",
      "password": "Admin@123"
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "email": "admin@salary.com",
        "name": "Super Admin"
      }
    }
    ```

* **`POST /auth/register`**
  - **Access**: Admin Token Required
  - **Body**:
    ```json
    {
      "name": "HR Manager Name",
      "email": "manager@salary.com",
      "password": "Manager@123"
    }
    ```

* **`GET /auth/me`**
  - **Access**: Token Required
  - **Response (200 OK)**: Returns the current logged-in HR Manager profile.

---

### 2. Employees Module
* **`GET /employees`**
  - **Access**: Token Required
  - **Description**: Returns a paginated, searchable, and filtered list of employee records.
  - **Query Parameters**:
    - `page` (optional): Page number (defaults to `1`)
    - `limit` (optional): Rows per page (e.g. `10`, `20`, `50`, `100`, defaults to `10`)
    - `search` (optional): Searches names, emails, and phone numbers.
    - `status` (optional): Filter by `'active'` or `'inactive'` status.
    - `country_id` (optional): Filter by integer country ID.
    - `department_id` (optional): Filter by integer department ID.
    - `job_title_id` (optional): Filter by integer job title ID.
    - `min_salary` (optional): Minimum salary amount constraint.
    - `max_salary` (optional): Maximum salary amount constraint.
    - `sortBy` (optional): Column to sort by (e.g. `'full_name'`, `'salary'`, `'joining_date'`)
    - `order` (optional): Sorting order (`'ASC'` or `'DESC'`, defaults to `'ASC'`)
  - **Response (200 OK)**:
    ```json
    {
      "data": [ ... ],
      "meta": {
        "total": 10005,
        "page": 1,
        "limit": 10,
        "totalPages": 1001
      }
    }
    ```

* **`GET /employees/:id`**
  - **Access**: Token Required
  - **Response**: Detailed employee record, including geographical, departmental, and historical salary modification logs.

* **`POST /employees`**
  - **Access**: Token Required
  - **Body**: Create employee payload schema.

* **`PUT /employees/:id`**
  - **Access**: Token Required
  - **Body**: Update employee details. Adjusting `salary` generates a historical audit entry.

* **`DELETE /employees/:id`**
  - **Access**: Token Required
  - **Description**: Performs a soft delete, setting the employee status badge to `'inactive'`.

---

### 3. Insights and Statistics
* **`GET /insights/dashboard`**
  - **Access**: Token Required
  - **Response**: Summaries of active/inactive employee counts, average/min/max salaries, and total regions.

* **`GET /insights/salary-by-country`**
  - **Access**: Token Required
  - **Query Parameters**: `countryId` (optional)
  - **Response**: Minimun, maximum, and average salary breakdowns with employee headcounts grouped by country.

* **`GET /insights/salary-by-job-title`**
  - **Access**: Token Required
  - **Query Parameters**: `jobTitleId` (optional), `countryId` (optional)
  - **Response**: Average salary benchmarks and headcounts grouped by position title.

* **`GET /insights/salary-by-department`**
  - **Access**: Token Required
  - **Response**: Salary and headcount metrics grouped by department.

* **`GET /insights/top-paid`**
  - **Access**: Token Required
  - **Query Parameters**: `countryId` (optional), `limit` (defaults to `10`)
  - **Response**: List of the highest-earning employees.

* **`GET /insights/salary-distribution`**
  - **Access**: Token Required
  - **Response**: Counts and percentages of active workforce across standard income bands (`0-30k`, `30k-60k`, etc.).

---

### 4. Bulk Exports
* **`GET /export/employees`**
  - **Query Parameters**: `format` (`'csv'` or `'excel'`, defaults to `'excel'`)
  - **Response**: Binary file stream download of the employee registry database.

* **`GET /export/hr-managers`**
  - **Query Parameters**: `format` (`'csv'` or `'excel'`)
  - **Response**: Binary file stream download of HR manager admin users.

* **`GET /export/audit-logs`**
  - **Query Parameters**: `format` (`'csv'` or `'excel'`)
  - **Response**: Binary file stream download of security activity audit trails.
