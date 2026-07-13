# Crushable Deployment

This document records the intended deployment shape. Technology choices live in
`stack.md`; product requirements live in `plan.md`; software boundaries live in
`software-architecture.md`.

## Initial Deployment Shape

Use Docker Compose with an app service and a database service.

```text
services:
  app:
    Next.js server

  db:
    Postgres
```

The app container runs the optimized Next.js server. The database container runs
Postgres for local development and Docker-based deployment.

## Development

Local development should run the Next.js dev server:

```text
npm run dev
```

The dev server is for editing and local feedback. It is not the production
runtime.

## Production

Production should build and run the optimized Next.js app:

```text
npm run build
npm start
```

The production server serves the built Next.js app and handles server-side app
logic.

Production deployment remains deferred while the app is incomplete. Environment
isolation is a required release blocker, although it is not an immediate
development task. Before the first Railway deployment, implement a versioned
non-secret environment manifest and a fail-closed pre-deploy guard. The guard must reject deployment when
development/test and production share an environment identifier, application
hostname, database hostname, or database name. Production secrets and full
connection strings must remain in Railway-managed environment variables.

## Environment

Expected environment categories:

```text
database connection
auth/session secrets
payment provider keys and webhook secrets
email provider keys and webhook secrets
app base URL
admin bootstrap configuration
```

Do not commit real secrets. Use `.env.example` for required variable names once
the app is scaffolded.

## Provider Webhooks

The app will likely need public webhook endpoints for:

```text
Stripe subscription/payment events
Postmark inbound email replies
Postmark delivery/bounce/spam events, if used
```

Webhook handlers must verify provider signatures or authentication before
processing events.

## Persistence

Postgres should be treated as required because the app needs accounts,
subscriptions, profile links, crush records, connections, moderation state, audit
history, and activity records.

## Database Verification

Once Postgres is running and `DATABASE_URL` points at it, apply the checked-in
migration and run the smoke check:

```bash
npm run prisma:deploy
npm run db:smoke
```

The smoke check creates a temporary user, email-link token, auth session,
profile, and placeholder profile photo row, reads them back through Prisma, then
removes the temporary rows.
