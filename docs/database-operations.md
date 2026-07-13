# Crushable Database Operations

This document describes how database environments and operations are intended
to work. It is a safety guide as well as a testing guide.

## Environments

| Environment | Database | Purpose | Data policy |
|---|---|---|---|
| Development | `crushable_dev` | Local app and manual browser review | Disposable local data |
| Test | `crushable_test` | Automated integration tests | Resettable; never shared with development |
| Production | `crushable_prod` | Live Railway application | Persistent; never used by local commands |

Each environment must have an explicit `CRUSHABLE_ENV` value:

```text
development → crushable_dev
test        → crushable_test
production  → crushable_prod
```

Production credentials and the complete production connection string belong in
Railway-managed environment variables, not in this repository.

## Crushable domain records

The database is not just a generic key-value store. These relationships and
lifecycle rules are part of the product behavior:

```text
User
 ├─ AuthSession             persisted session state
 ├─ EmailLinkToken          short-lived sign-in token hash and purpose
 └─ Profile                 at most one current profile per user
     └─ ProfilePhoto        ordered image metadata for that profile
```

- A `User` can exist before profile completion.
- A profile becomes active only after all completion rules pass.
- Profile email is stored for account/profile workflows but is never public.
- Email-link tokens and session values are stored as hashes, not reusable raw
  credentials.
- Updating a profile replaces the current placeholder photo metadata inside the
  same transaction until real image storage is implemented.
- Profile completion and visibility are separate concepts; moderation and
  visibility state must not be silently inferred from form rendering.
- Future crush, link, contact, billing, moderation, audit, and activity records
  must retain explicit ownership and lifecycle state rather than being hidden
  in UI-only state.

The Prisma schema and repositories are the implementation boundary for these
rules. Pages and components should call application actions or services instead
of constructing persistence records directly.

## Schema migrations

The checked-in Prisma migrations are the source of truth for schema history.

Development:

```bash
npm run prisma:migrate
```

This creates and applies a development migration while iterating locally.

Test and production:

```bash
npm run prisma:deploy
```

This applies existing migrations without creating new ones. Production should
run it only through an approved Railway deployment/pre-deploy process after the
environment guard passes.

Never edit an already-applied migration to change history. Create a new
migration instead.

## Database smoke checks

`npm run db:smoke` creates temporary records for a user, email-link token,
session, profile, and placeholder photo, verifies that they can be read back,
and removes them. It is a connectivity/schema check, not a complete integration
suite.

The smoke check must refuse production and should be run only against the
intended development database until the isolated test command exists.

## Integration tests

Repository and persistence integration tests run only against `crushable_test`.
They should verify:

- user upsert behavior;
- profile create/update behavior;
- transactional photo replacement;
- email-link and auth-session persistence;
- database error classification;
- cleanup and rollback behavior.

The test runner must fail closed when `CRUSHABLE_ENV` is not `test` or when the
database name is not `crushable_test`. Tests must use unique record identifiers
and clean up their own records, with a final safety cleanup for abandoned test
runs.

## Cleanup and rollback

Cleanup removes temporary test records after a test. It protects test isolation
but is not a substitute for transaction safety.

Rollback verifies that a failed multi-step operation leaves no partial writes.
Repository operations that update a profile and its related photos should use a
Prisma transaction so either all writes succeed or all are undone.

Migration rollback and production disaster recovery are separate operations.
They require an explicit release procedure, backups, and human approval; they
are not ordinary test cleanup.

## Production safety requirements

Before production deployment is enabled, implement a versioned non-secret
environment manifest and a fail-closed pre-deploy guard. It must compare the
runtime environment marker, app hostname, database hostname, and database name
against the intended production values and ensure they differ from development
and test. Railway pre-deploy commands are the intended enforcement point.
