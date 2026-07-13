# Crushable

Crushable is a Docker-deployed dating app built around linkable dating
profiles, disposable public profile links, and structured crush records.

The current repository has an initial Next.js scaffold with planning docs,
module boundaries, route stubs, Prisma schema, Docker Compose, persisted
auth/profile foundations, and system-global plan config.

## Planning Docs

- `plan.md`: product requirements and decisions.
- `stack.md`: technology choices.
- `deployment.md`: Docker/runtime/environment shape.
- `docs/application-flow.md`: implemented, partial, stubbed, and planned flows.
- `docs/testing-strategy.md`: automated-test boundaries and manual checks.
- `docs/database-operations.md`: database environments, migrations, and safety.
- `software-architecture.md`: software modules, layers, adapters, repositories, and components.
- `data-model.md`: conceptual data model before the first Prisma schema.

## Developer Docs

- `docs/development-guide.md`: how the app fits together, runs, and changes.
- `docs/react-typescript-tailwind-tutorial.md`: a hands-on beginner tutorial
  using the profile form.

## Current Intended Stack

```text
Next.js
TypeScript
React
Tailwind CSS
Postgres
Prisma
Docker Compose
```

Provisional providers:

```text
Payments: Stripe
Email relay/inbound email: Postmark
Auth: email link sign-in initially, 2FA desired
```

## Run Locally

Install dependencies:

```bash
npm install
```

Install Docker, Docker Compose, and the Postgres client on Ubuntu:

```bash
./scripts/setup-local-db-tools.sh
```

Start the local app stack:

```bash
npm run app:start
```

This starts Postgres through Docker Compose, applies Prisma migrations, runs the
database smoke check, and then starts the Next.js dev server at
`http://localhost:3000`.

Stop or inspect the local app stack:

```bash
npm run app:stop
npm run app:restart
npm run app:status
npm run app:logs
```

Run the full app through Docker Compose:

```bash
npm run app:docker
```

This builds the Next.js app image, starts Postgres, waits for database health,
applies Prisma migrations inside the app container, and starts the production
Next.js server at `http://localhost:3000`.

Optional manual database commands:

Run Postgres through Docker Compose without starting the app:

```bash
docker compose up db
```

From the host machine, use a local database URL:

```bash
DATABASE_URL="postgresql://crushable:crushable@localhost:5432/crushable?schema=public"
```

Inside Docker Compose, use the service hostname:

```bash
DATABASE_URL="postgresql://crushable:crushable@db:5432/crushable?schema=public"
```

Apply migrations and run the persistence smoke check:

```bash
npm run prisma:deploy
npm run db:smoke
```

## Next Implementation Step

Verify the first migration against a running Postgres database, then decide the
next feature goal: disposable profile links, crush records/search, billing, or
email relay.
