# Crushable Stack

This document records the current technology and deployment choices. Detailed
module boundaries live in `software-architecture.md`; product requirements live
in `plan.md`.

## Application Stack

```text
Next.js
TypeScript
React
Tailwind CSS
Postgres
Prisma
Docker Compose
```

Next.js is the app framework. It handles both the React UI and server-side app
logic, so Crushable does not need a separate Python/FastAPI backend.

## Runtime Shape

```text
Browser
  |
  v
Next.js app
  |
  +-- React UI
  +-- server-side routes/actions
  +-- domain/application services
  +-- database access through Prisma
  +-- provider adapters
        auth
        payments
        email relay
```

## Provisional Providers

```text
Payments:
  Stripe

Email:
  Postmark

Auth:
  email link sign-in initially
  two-factor authentication desired

Database ORM:
  Prisma
```

These are provisional defaults. Provider-specific code should live behind
adapters so payment, email, auth, or database tooling can change later with less
impact on product logic.
