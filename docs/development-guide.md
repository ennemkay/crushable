# Crushable Development Guide

This guide explains how to run and change Crushable even if React, TypeScript,
Tailwind CSS, Next.js, Prisma, and Docker Compose are new to you.

## The app in one picture

```text
Browser
  -> Next.js page (app/)
     -> React components (components/)
     -> server actions and services (lib/)
     -> Prisma (lib/db and repositories)
     -> Postgres (Docker Compose)
```

Next.js is the framework that connects the browser-facing pages and the
server-side code. React describes the user interface. TypeScript checks the
shapes of data. Tailwind supplies small CSS utility classes. Prisma translates
typed TypeScript calls into database queries. Docker Compose runs Postgres.

## Start and stop the app

From the repository root:

```bash
npm install
npm run app:start
```

Open `http://localhost:3000`. The start command launches Postgres, applies
migrations, checks the database, and starts the Next.js development server.
Changes normally appear after saving a file.

Useful commands:

```bash
npm run app:status   # show app and database status
npm run app:logs     # follow the development log
npm run app:restart  # restart the stack
npm run app:stop     # stop the stack
npm run lint         # find code and React mistakes
npm run build        # verify a production build
```

If Docker reports permission denied for `/var/run/docker.sock`, follow the
commands printed by `npm run app:start`, then open a new shell and retry.

## Where code lives

| Path | Purpose | Example |
| --- | --- | --- |
| `app/` | URL routes and page layouts | `app/onboarding/page.tsx` |
| `components/` | Reusable interface pieces | `components/profile/profile-form.tsx` |
| `lib/` | Server actions, business rules, and data access | `lib/profiles/profile-actions.ts` |
| `prisma/schema.prisma` | Database models and enums | `Profile`, `ProfilePhoto` |
| `prisma/migrations/` | Versioned SQL database changes | `000001_init` |
| `config/` | Non-secret application configuration | `config/plans.json` |
| `scripts/` | Development and database helpers | `scripts/app.sh` |
| `app/globals.css` | Global styles and Tailwind entry point | page background |

A folder below `app` becomes part of a URL. For example,
`app/settings/profile/page.tsx` serves `/settings/profile`. A bracketed folder
is dynamic: `app/crushes/[id]/page.tsx` can serve `/crushes/123`.

## How a profile form submission works

The profile flow is a useful map of the architecture:

1. `app/onboarding/page.tsx` loads the current user on the server.
2. It renders `ProfileForm`, passing the user's email and an onboarding mode.
3. `components/profile/profile-form.tsx` runs in the browser because it starts
   with `"use client"`. React tracks the pending state and returned errors.
4. Submitting calls `saveOnboardingProfile` in
   `lib/profiles/profile-actions.ts`.
5. That server action parses fields with Zod, checks profile completion rules,
   requires a signed-in user, and calls a repository.
6. `lib/profiles/repository.ts` uses Prisma to save the profile in Postgres.
7. Success redirects to `/settings/profile?saved=1`; validation failure returns
   issues and the submitted values to the same form.

Keep these responsibilities separate. Components render and collect input;
server actions coordinate a request; validation modules enforce rules;
repositories read and write data.

## React and server/client code

A React component is a function that returns JSX, an HTML-like syntax:

```tsx
function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}.</p>;
}
```

Files in `app/` are server components by default. They can safely load database
data and must not use browser-only hooks. Add `"use client"` only when a
component needs interactivity such as `useActionState`, click state, or browser
APIs. Never import database or secret-bearing server code into a client
component.

Props are inputs from a parent component. In `ProfileForm`, `defaultEmail`,
`defaults`, and `mode` are props. State is data that can change while a user is
on the page; `state` and `pending` come from `useActionState`.

## TypeScript

TypeScript adds descriptions of allowed values to JavaScript. For example:

```ts
type ProfileFormProps = {
  defaultEmail: string;
  mode: "onboarding" | "settings";
};
```

This prevents a caller from omitting the email or inventing a third mode. `?`
means optional, `Array<T>` means a list of `T`, and `Promise<T>` means an async
operation that will eventually produce `T`. Prefer a specific type over `any`.
Run `npm run build` to catch type errors.

The `@/` import prefix means the repository root, so
`@/lib/auth/session` refers to `lib/auth/session.ts`.

## Tailwind CSS

Tailwind classes describe one visual rule at a time:

```tsx
<div className="grid gap-4 rounded-lg border bg-white p-5">
```

- `grid` selects CSS Grid.
- `gap-4` adds space between children.
- `rounded-lg` rounds corners.
- `border` draws a border.
- `bg-white` sets the background.
- `p-5` adds padding.

Responsive prefixes apply at a minimum width. `md:grid-cols-2` changes to two
columns on medium screens. State prefixes such as `focus:border-teal-700` and
`disabled:bg-muted` apply only in that state. Project color names such as
`ink`, `line`, and `muted` are defined in `tailwind.config.ts`.

Use `app/globals.css` for truly global rules. Keep component-specific styling
beside the JSX as Tailwind classes.

## Database changes

`prisma/schema.prisma` is the source of truth for application data. A model
becomes a table, a field becomes a column, and an enum limits allowed values.

For a deliberate schema change:

1. Edit `prisma/schema.prisma`.
2. Start the database with `npm run app:start`.
3. Run `npm run prisma:migrate -- --name short_description`.
4. Inspect the generated SQL under `prisma/migrations/`.
5. Run `npm run db:smoke`, `npm run lint`, and `npm run build`.

Commit the schema and generated migration together. Do not edit an already
applied migration to represent a new change. Do not put passwords in the schema
or commit `.env`.

## A safe change workflow

1. Read the page, component, server action, validation, and repository involved.
2. Make the smallest coherent change at the appropriate layer.
3. Exercise both success and error behavior in the browser.
4. Run `npm run lint` and `npm run build`.
5. If persistence changed, also apply migrations and run `npm run db:smoke`.
6. Review `git diff` and confirm no `.env`, generated build output, or session
   summaries are included.

For a guided first change, continue with
[`react-typescript-tailwind-tutorial.md`](./react-typescript-tailwind-tutorial.md).
