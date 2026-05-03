## Medikita API Overview

This backend API powers the Medikita application, a modular healthcare management system built with NestJS and PostgreSQL.

**Features:**

- User authentication & authorization (JWT, role-based access)
- Employee management (doctors, nurses, admin staff)
- Patient registration & management
  - **Auto-generated Medical Record Number (MRN)** in the format `{YYYYMM}{NNNNNN}` (e.g. `202605000001`), with the 6-digit sequence resetting every month
  - Multi-patient-per-user support with relationship type (`Self`, `Spouse`, `Child`, `Parent`, `Sibling`, `Other`) and per-user ordinal ordering
- Appointment scheduling
- Department and role assignment
- Group-based response serialization (`user-full`, `patient-for-user`) for context-aware payloads
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

- A **User** can be linked to **many Patients** through the `UserPatient` join table (e.g. a parent managing their own record plus their children's). Each link carries a `relationship` (`Self`, `Spouse`, `Child`, `Parent`, `Sibling`, `Other`) and an `ordinal` for per-user display ordering.
- A **User** may also be an **Employee** (one-to-one), and an **Employee** is further specialized as either a **Doctor** or a **Nurse**.

This structure ensures:

- Centralized authentication and authorization via the User entity.
- Consistent linkage between personal data (User) and domain-specific roles (Patient, Employee, Doctor, Nurse).
- Flexible patient management — one account, multiple medical records.
- Easy extension for future roles or modules.

**Diagram:**

```
User ──< UserPatient >── Patient
 │
 └── Employee (1:1)
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

## Medical Record Number (MRN) Generation

Every `Patient` is assigned a unique Medical Record Number on creation. Clients **never send** this value — it is generated server-side.

- **Format:** `{YYYYMM}{NNNNNN}` — 12 characters, e.g. `202605000001`
- **Sequence:** zero-padded to 6 digits (max 999,999 per month, enforced by a `CHECK` constraint at the DB level)
- **Reset:** the sequence restarts at `000001` on the first patient of every new month

**How it works:**

- A dedicated `MedicalRecordCounter` table tracks `lastSequence` per `yearMonth`.
- A TypeORM `EntitySubscriber` (`PatientSubscriber`) hooks into `beforeInsert` and:
  1. Acquires a `pessimistic_write` row lock on the counter for the current month.
  2. Increments (or initializes) `lastSequence`.
  3. Sets `medicalRecordNumber` on the entity using the formatted sequence.
- The whole flow runs inside the same transaction as the patient insert, so concurrent `POST /patients` calls are safe — no race conditions, no duplicate MRNs.

Because it lives in a subscriber, **any** code path that saves a `Patient` (controllers, seeders, future modules) automatically receives a valid MRN with zero caller awareness.

**Summary:**  
The Medikita backend provides a secure, modular, and scalable foundation for healthcare management, supporting authentication, user/employee/patient management, scheduling, and robust data operations.
