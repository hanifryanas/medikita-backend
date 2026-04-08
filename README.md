## Medikita API Overview

This backend API powers the Medikita application, a modular healthcare management system built with NestJS and PostgreSQL.

**Features:**

- User authentication & authorization (JWT, role-based access)
- Employee management (doctors, nurses, admin staff)
- Patient registration & management
- Appointment scheduling
- Department and role assignment
- Database seeding and migrations for initial data

All endpoints follow RESTful conventions and are documented via Swagger at `/api/docs` when the server is running.

**Tech stack:**  
NestJS, TypeORM, PostgreSQL, JWT, Swagger

**Environment:**  
See `.env.example` for required configuration variables then create a `.env` file at the project root and set the values.

## Prerequisites

Before running the backend, make sure you have **PostgreSQL (psql)** installed and a database created for this project.

1. **Install PostgreSQL:**  
   Download and install from [https://www.postgresql.org/download/](https://www.postgresql.org/download/).

2. **Create a database:**  
   Open your terminal and run:

   ```sh
   psql -U postgres
   CREATE DATABASE medikita;
   ```

3. **Configure environment variables:**  
   Copy `.env.example` to `.env` and set your database connection details:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=medikita
   DB_USERNAME=your_postgres_user
   DB_PASSWORD=your_postgres_password
   ```

Then continue with the steps below to install dependencies, run migrations, and seed data.

## Getting Started

Install dependencies:

```sh
npm install
```

Run database migrations:

```sh
npm run migration:run
```

Seed initial data:

```sh
npm run seed
```

Start the development server:

```sh
npm run start:dev
```

## Entity Relationship Highlight

**User** is the main entity in this backend.

- Every **Patient** and **Employee** is linked to a User account.
- **Employee** entities are further linked to either a **Doctor** or **Nurse** entity, depending on their role.

This structure ensures:

- Centralized authentication and authorization via the User entity.
- Consistent linkage between personal data (User) and domain-specific roles (Patient, Employee, Doctor, Nurse).
- Easy extension for future roles or modules.

**Diagram:**

```
User
 ├── Patient
 └── Employee
      ├── Doctor
      └── Nurse
```

All operations for patients, employees, doctors, and nurses are ultimately tied to a User record, supporting unified identity and access management.

## Application Flow Recap

1. **User Authentication:**  
   Users (admin, staff, doctors, nurses, patients) authenticate via JWT-based login endpoints. Roles and permissions are enforced throughout the API.

2. **Employee & User Management:**  
   Admins can create, update, and manage employee records (doctors, nurses, staff) and link them to user accounts.

3. **Patient Registration:**  
   Patients are registered and managed, including their insurance information and personal details.

4. **Appointment Scheduling:**  
   Doctors, nurses, and patients interact through appointment endpoints to create, update, and manage schedules.

5. **Department & Role Assignment:**  
   Employees are assigned to departments and roles, which control their access and capabilities within the system.

6. **Database Seeding & Migrations:**  
   Initial data (super admin, admin, sample employees, patients) is seeded for first-time setup. Migrations keep the database schema up to date.

7. **API Documentation:**  
   All endpoints are documented and accessible via Swagger UI at `/api/docs`.

**Summary:**  
The Medikita backend provides a secure, modular, and scalable foundation for healthcare management, supporting authentication, user/employee/patient management, scheduling, and robust data operations.
