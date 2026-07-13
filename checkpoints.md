# Crushable Checkpoints

Active goal:

```text
Implement the persisted auth/onboarding/profile foundation for Crushable with
clear checkpoints for code and product review.
```

## Checkpoint 1: Local Foundation

Status: complete

Scope:

```text
Confirm dev server workflow.
Confirm Postgres strategy for this machine.
Create initial Prisma migration once a database is available.
Keep Docker Compose as the default DB runtime.
```

Current environment findings:

```text
Node: v20.20.2
npm: 10.8.2
Docker: installed and working from the user's terminal
psql/Postgres client: installed by setup script if needed
Dev server: works through npm run dev at http://localhost:3000
Postgres: runs through Docker Compose from the user's terminal
```

Open decision:

```text
None for MVP local development. Use Docker Compose Postgres.
```

Review:

```text
User can inspect Docker/Postgres setup, Prisma schema, and migration strategy.
```

Implemented so far:

```text
Initial SQL migration generated at prisma/migrations/000001_init/migration.sql
using prisma migrate diff without requiring a live database.
Database smoke check script added at scripts/db-smoke-check.mjs.
Package commands added for npm run prisma:deploy and npm run db:smoke.
User reported the Docker Compose/Postgres/Prisma command sequence worked from
their terminal.
```

## Checkpoint 2: Auth Foundation

Status: in progress

Scope:

```text
Choose concrete auth implementation path.
Persist users.
Keep email-link sign-in flow provider-agnostic.
Prepare for 2FA later.
```

Implemented so far:

```text
Email-link sign-in/sign-up route stubs.
Development session cookie set after sign-in/sign-up request.
Provider-agnostic auth/session boundary remains in lib/auth.
User persistence repository added for upserting users by email when Postgres is available.
EmailLinkToken and AuthSession models added to Prisma schema and initial migration.
Sign-in/sign-up actions create persisted users, email-link tokens, and auth
sessions when Postgres is available.
Auth session lookup uses persisted AuthSession when available and falls back to
the development email cookie when Postgres is unavailable.
Check-email page shows whether auth persistence used the database or the
development fallback.
```

Still open:

```text
Choose and wire the real auth provider.
Replace development session cookie with provider session.
Add 2FA design/implementation later.
Verify persisted auth records against a running Postgres database.
```

Review:

```text
User can inspect sign-in/sign-up flow and user persistence boundary.
```

## Checkpoint 3: Profile Onboarding

Status: in progress

Scope:

```text
Build onboarding form for MVP required fields.
Persist profile records.
Validate profile completion server-side.
Enforce no public email and no social handles/contact info in descriptions.
```

Implemented so far:

```text
Onboarding form for required MVP fields.
Server action validates submitted profile data.
Profile completion checks run server-side.
Description validation rejects direct contact info/social handles.
User/profile repositories persist through Prisma when Postgres is available.
Database-unavailable state is shown instead of crashing when Postgres is not running.
The same reusable profile form is used for onboarding and profile settings.
Submitted photo count is persisted as placeholder ProfilePhoto metadata rows
until the real image storage decision is made.
Age decade and sex selections are preserved when server validation returns the
form with errors.
Profile ZIP codes use the maintained `validator.js` U.S. postal-code rule on
the server, with a numeric mobile-keyboard hint in the form.
Core ZIP, profile-completion, and profile-description policy behavior is covered
by framework-independent unit tests.
```

Still open:

```text
Replace placeholder photo metadata with real upload/storage behavior.
```

Review:

```text
User can create/edit a profile locally and inspect validation behavior.
```

## Checkpoint 4: Profile Settings

Status: in progress

Scope:

```text
Build profile edit page.
Support profile photos as metadata placeholders or first storage decision.
Show completion status.
```

Implemented so far:

```text
Profile settings reads current profile through repository/service boundary.
Page handles signed-out, no-profile, database-unavailable, and loaded profile states.
Loaded profile state includes an edit form prefilled from persisted profile data.
Profile edits update placeholder photo metadata from the submitted photo count.
```

Still open:

```text
Replace placeholder photo metadata with real upload/storage behavior.
Verify profile edit persistence against a running Postgres database.
```

Review:

```text
User can inspect profile settings UI and saved profile data.
```

## Checkpoint 5: Foundation Review

Status: pending

Scope:

```text
Run lint/build.
Run database checks/migrations where available.
Review code structure against software-architecture.md.
Identify next goal: disposable links, crushes, billing, or email relay.
```

Latest verification:

```text
node --check scripts/db-smoke-check.mjs: passed
npm run prisma:generate: passed
npm run lint: passed
npm run build: passed
Initial SQL migration file: generated
Database migration apply: user reported successful from their terminal
Database smoke check command: user reported successful from their terminal
Codex shell note: still cannot reach Docker/Postgres due sandbox/session limits
Latest route checks: /sign-in, /sign-up, and /sign-in/check-email returned 200
```

Review:

```text
User reviews code and working product before the next feature phase.
```

## Checkpoint 6: Beginner Developer Documentation

Status: complete

Scope:

```text
Create docs/development-guide.md for working on this app assuming no prior
React, Tailwind CSS, TypeScript, Next.js, Prisma, or Docker Compose knowledge.
Create docs/react-typescript-tailwind-tutorial.md as a hands-on tutorial using
Crushable's actual pages, components, forms, validation, and styles as examples.
Keep the docs concrete and app-specific rather than generic framework notes.
```

Review:

```text
User can follow the docs to understand the stack and make a small UI/form change
without needing outside React, TypeScript, or Tailwind background first.
```

Implemented:

```text
Added docs/development-guide.md with stack, project structure, request flow,
database migration, verification, and safe-change guidance.
Added docs/react-typescript-tailwind-tutorial.md with an app-specific profile
form exercise covering JSX, props, TypeScript, Tailwind, accessibility, React
action state, server validation, and verification.
Proofread the tutorial against the current profile form, onboarding page, server
action, validation, and Tailwind configuration. Corrected ambiguous wording and
consolidated the older root-level tutorial into a pointer to the maintained
document under `docs/`.
Linked both guides from README.md.
```
