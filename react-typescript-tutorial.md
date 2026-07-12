# React + TypeScript Tutorial: Crushable

A hands-on guide to React, TypeScript, and Next.js through the Crushable dating app codebase. Read actual files, understand the patterns, then make real changes.

---

## 1. How to Run Crushable Locally

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- A Postgres client (`psql`) — optional, the script can install it

### Install dependencies

```bash
cd crushable
npm install
```

### Set up local infrastructure

```bash
# Installs Docker, Docker Compose, and Postgres client if missing
./scripts/setup-local-db-tools.sh
```

### Start the app

```bash
npm run app:start
```

This single command does four things:

1. **Docker Compose** starts a Postgres container defined in `compose.yaml`
2. **Prisma Migrate** applies any pending migrations (`prisma migrate deploy`)
3. **Smoke check** (`scripts/db-smoke-check.mjs`) verifies the database is reachable and the schema is correct
4. **Next.js dev server** starts at `http://localhost:3000`

If you only need the database without the Next.js server:

```bash
docker compose up db            # Postgres only
npm run prisma:deploy           # apply migrations
npm run db:smoke                # verify
```

To stop everything:

```bash
npm run app:stop
```

### Understanding the stack

| Layer | What it does | Config |
|---|---|---|
| **Postgres** | Relational database | `compose.yaml`, env `DATABASE_URL` |
| **Prisma** | Type-safe ORM — generates TypeScript types from your schema | `prisma/schema.prisma` |
| **Next.js** | React framework — server-rendered pages and server actions | `next.config.ts` |
| **Tailwind CSS** | Utility-first CSS framework | `tailwind.config.ts` |

---

## 2. How the App is Organized

- `crushable/app/` — Routes (Next.js App Router)
  - `layout.tsx` — Root layout (HTML shell)
  - `page.tsx` — Home page (/)
  - `sign-in/` — `/sign-in`
  - `sign-up/` — `/sign-up`
  - `onboarding/` — `/onboarding`
  - `settings/` — `/settings/{profile,links,billing,activity}`
  - `crushes/` — `/crushes/{new,search,results,[id]}`
  - `admin/` — `/admin/{reports,accounts,audit}`
  - `p/` — `/p/{linkId}/{username}` (public profile links)

- `crushable/components/` — Reusable React components
  - `auth/` — Sign-in/up panel and form
  - `layout/` — Page shells, navigation
  - `profile/` — Profile form and card
  - `ui/` — Generic UI controls
  - Add feature directories such as `crushes/` or `admin/` when those features need reusable components

- `crushable/lib/` — Implementation logic (no JSX)
  - `profiles/` — Profile data access, server actions, and completion rules
  - `auth/` — Email link auth, sessions, tokens
  - `users/` — User repository
  - `crushes/` — Crush deduplication logic
  - `contact/` — Contact access gating
  - `config/` — Plan config reader
  - `billing/` — Stripe adapter stub
  - `email-relay/` — Postmark adapter stub
  - `db/` — Prisma client singleton
  - `normalization/` — Name/city/zip normalization
  - `validation/` — Profile description rules

- `crushable/prisma/` — Database
  - `schema.prisma` — Data model (Users, Profiles, Crushes, etc.)
  - `migrations/` — Migrated SQL

- `crushable/config/plans.json` — Free and Paid plan limits
- `crushable/public/` — Static assets
- `crushable/scripts/` — Dev tooling scripts
- `crushable/compose.yaml` — Docker Compose (Postgres)
- `crushable/tailwind.config.ts` — Design tokens (colors, shadows, spacing)

### The data flow

1. `app/settings/profile/page.tsx` — Server Component receives browser request, fetches data
2. `lib/auth/session.ts` — Calls `getCurrentUser()` to read session cookie
3. `lib/profiles/repository.ts` — Calls `getProfileByUserId()` to query Prisma
4. `components/profile/profile-form.tsx` — Client Component (`"use client"`) renders form
5. `lib/profiles/profile-actions.ts` — Server Action (`"use server"`) receives form submission
6. `lib/profiles/repository.ts` — Calls `upsertProfileForUser()` to write via Prisma
7. `redirect()` — Next.js navigation after success

---

## 3. How to Make UX Tweaks Safely

### Golden rule: start at the leaves, then work inward

When you want to change what the user sees, your first instinct should be to edit **page components** (`app/`) or **feature components** (`components/`), not `lib/` files.

### Safe change layers

| What you want to do | Edit here | Risk |
|---|---|---|
| Change button text, layout, colors | `app/*/page.tsx` or `components/*.tsx` | Low — visual only |
| Add a form field | `components/profile/profile-form.tsx` + `lib/profiles/profile-actions.ts`; also `prisma/schema.prisma` and repositories if persisted | Medium — needs parallel edits |
| Change validation rules | `lib/profiles/profile-actions.ts`, `lib/profiles/completion.ts`, or `lib/validation/profile.ts` | Medium — recheck edge cases |
| Change database schema | `prisma/schema.prisma` + migration | High — run `npm run prisma:migrate` |
| Change business logic | `lib/*/*.ts` | Medium — update tests if any |

### Keep reusable controls in components/ui

The `components/ui/` directory holds low-level, generic components that can be reused across features. Currently it has only `status-card.tsx`. If you find yourself copying the same card/button/input pattern across pages, extract it into `components/ui/`.

**Example**: if you need a styled button in multiple places, create `components/ui/button.tsx` rather than styling a raw `<button>` each time.

### Avoid changing lib/ unless behavior changes

`lib/` contains business logic and data access. If your task is purely visual (change the heading text, reorder elements), stay in `app/` and `components/`. Only touch `lib/` when you need to add new server actions, change repository queries, or adjust validation rules.

---

## 4. Walk Through One Real Page

Let's trace exactly what happens when a user fills out the onboarding form at `/onboarding`.

### 4.1 The route page: `crushable/app/onboarding/page.tsx`

This is a **Server Component** — it runs on the server, fetches data, then renders UI.

```tsx
export default async function OnboardingPage() {
  const user = await getCurrentUser();        // reads session cookie

  return (
    <PageShell title="Create profile" description="...">
      {user ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ProfileForm defaultEmail={user.email} mode="onboarding" />

          {/* Sidebar cards */}
          <StatusCard title="Required profile fields">...</StatusCard>
          <StatusCard title="Persistence status">...</StatusCard>
        </div>
      ) : (
        <StatusCard title="Sign in required">
          <Link href="/sign-up">Start with email sign-up.</Link>
        </StatusCard>
      )}
    </PageShell>
  );
}
```

Key takeaways:
- The component is `async` — it awaits `getCurrentUser()` directly
- If there is no user, it shows a sign-in prompt instead of the form
- The page passes data **down** to child components as props

### 4.2 The form: `crushable/components/profile/profile-form.tsx`

This is a **Client Component** — notice `"use client"` at the top. It needs hooks.

```tsx
"use client";

export function ProfileForm({ defaultEmail, defaults = {}, mode }: ProfileFormProps) {
  const serverAction = mode === "onboarding" ? saveOnboardingProfile : saveProfileSettings;
  const [state, action, pending] = useActionState(serverAction, initialState);
  // state    = return value from the server action
  // action   = pass to <form> — React calls the server action on submit
  // pending  = true while the server action runs

  return (
    <form action={action} className="...">
      {/* Validation errors */}
      {state.issues.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <ul>{state.issues.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ) : null}

      <Field label="Email address" name="emailAddress" ... />
      <Field label="Username" name="username" ... />
      <Field label="Display name" name="displayName" ... />
      {/* ... more fields ... */}

      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
```

Key takeaways:
- `useActionState` connects the form to a server action
- `state.issues` contains error messages returned from the server
- `pending` disables the button and shows "Saving..." during submission
- `Field`, `SelectField` are helper components defined in the same file

### 4.3 The helper components (same file)

```tsx
type FieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
};

function Field({ label, name, type = "text", defaultValue, placeholder }: FieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-ink" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required
        defaultValue={defaultValue} placeholder={placeholder}
        className="min-h-11 rounded-md border border-line bg-white px-3 py-2
                   text-base text-ink outline-none focus:border-teal-700" />
    </div>
  );
}
```

### 4.4 Validation path

When the user submits, the form data goes to `saveOnboardingProfile` in `crushable/lib/profiles/profile-actions.ts`:

```tsx
"use server";

const onboardingSchema = z.object({
  emailAddress: z.string().trim().email("Enter a valid email address."),
  username: z.string().trim().min(3).max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only include letters, numbers, and underscores."),
  displayName: z.string().trim().min(1).max(60),
  // ...
});

export async function saveOnboardingProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const values = getSubmittedValues(formData);              // extract form fields
  const parsed = onboardingSchema.safeParse(values);        // validate with Zod

  if (!parsed.success) {
    return { values, issues: parsed.error.issues.map((i) => i.message) };
  }

  const completionIssues = getProfileCompletionIssues(parsed.data);  // business rules
  if (completionIssues.length > 0) {
    return { values, issues: completionIssues };
  }

  // ... persist to database ...
}
```

Two layers of validation:

1. **Zod schema** — field format rules (email format, min length, regex pattern)
2. **Business rules** in `crushable/lib/profiles/completion.ts` — cross-field rules (at least 3 photos, description ≥ 80 chars, no contact info)

The content rules in `crushable/lib/validation/profile.ts` check for prohibited patterns:

```tsx
const directContactPatterns = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,   // email addresses
  /(?:^|\s)@[a-z0-9_.]{2,}/i,                         // @handles
  /\b(?:instagram|insta|ig|snapchat|snap|tiktok|twitter|...)\b/i,  // platform names
];

export function findProhibitedProfileDescriptionPattern(description: string) {
  return directContactPatterns.find((pattern) => pattern.test(description));
}
```

### 4.5 Persistence path

If validation passes, the data is saved through `crushable/lib/profiles/repository.ts`:

```tsx
export async function upsertProfileForUser(input: UpsertProfileInput) {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { userId: input.userId },
      create: { /* all fields */ },
      update: { /* all fields */ },
    });

    await tx.profilePhoto.deleteMany({ where: { profileId: profile.id } });
    if (input.photoCount > 0) {
      await tx.profilePhoto.createMany({
        data: buildPlaceholderPhotos(profile.id, input.photoCount),
      });
    }

    return tx.profile.findUniqueOrThrow({
      where: { id: profile.id },
      include: { photos: true },
    });
  });
}
```

If the database is unreachable, the server action catches the error and returns a user-friendly message instead of crashing:

```tsx
catch (error) {
  if (isDatabaseConnectionError(error)) {
    return {
      values,
      issues: ["Postgres is not reachable from this environment yet."],
    };
  }
  throw error;
}
```

---

## 5. Common Tasks

### 5.1 Change button text

**Before**: `crushable/components/profile/profile-form.tsx`
```tsx
const submitLabel = mode === "onboarding" ? "Save profile" : "Update profile";
```

**After**:
```tsx
const submitLabel = mode === "onboarding" ? "Create my profile" : "Save changes";
```

That's it. No other files need to change.

### 5.2 Add a form field

Let's add an optional "Tagline" field to the profile form and persist it.

**Step 1**: Add it to the Prisma schema in `prisma/schema.prisma`

```prisma
model Profile {
  // ... existing fields ...
  tagline String?
}
```

Then create the migration and regenerate the Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Prisma-generated TypeScript types will not know about the field until this runs.

**Step 2**: Add it to the form state in `crushable/lib/profiles/profile-actions.ts`

```tsx
export type ProfileFormState = {
  issues: string[];
  values?: {
    // ... existing fields ...
    tagline?: string;
  };
};
```

**Step 3**: Add it to the Zod schema in `crushable/lib/profiles/profile-actions.ts`

```tsx
const onboardingSchema = z.object({
  // ... existing fields ...
  tagline: z.string().trim().max(100).optional(),
});
```

**Step 4**: Read it from the submitted form in `crushable/lib/profiles/profile-actions.ts`

```tsx
function getSubmittedValues(formData: FormData): ProfileFormState["values"] {
  return {
    // ... existing fields ...
    tagline: getStringValue(formData, "tagline"),
  };
}
```

**Step 5**: Pass it to the repository call in `saveOnboardingProfile`

```tsx
await upsertProfileForUser({
  // ... existing fields ...
  tagline: parsed.data.tagline,
});
```

**Step 6**: Add it to the upsert input and Prisma write in `crushable/lib/profiles/repository.ts`

```tsx
export type UpsertProfileInput = {
  // ... existing fields ...
  tagline?: string;
};

await tx.profile.upsert({
  where: { userId: input.userId },
  create: {
    // ... existing fields ...
    tagline: input.tagline,
  },
  update: {
    // ... existing fields ...
    tagline: input.tagline,
  },
});
```

**Step 7**: Add it to form defaults and render an optional field in `crushable/components/profile/profile-form.tsx`

```tsx
export type ProfileFormDefaults = {
  // ... existing fields ...
  tagline?: string;
};

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  min?: string;
  max?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  min,
  max,
  required = true,
}: FieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-11 rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-teal-700"
      />
    </div>
  );
}

<Field
  label="Tagline"
  name="tagline"
  required={false}
  defaultValue={values.tagline}
  placeholder="A short tagline"
/>
```

The existing `Field` helper currently marks every input as `required`, so optional inputs need an explicit `required` prop or a separate optional field helper.

**Step 8**: Include it when loading existing profile settings in `crushable/app/settings/profile/page.tsx`

```tsx
<ProfileForm
  defaults={{
    // ... existing defaults ...
    tagline: profileResult.profile.tagline ?? "",
  }}
/>
```

If the field should appear on public profiles, also add it to `crushable/components/profile/profile-card.tsx`.

### 5.3 Adjust Tailwind classes

**Example: Change the primary button from teal to indigo**

**Before** (`crushable/components/profile/profile-form.tsx`):
```tsx
<button className="... rounded-md bg-teal-700 px-4 py-2 font-black text-white ...">
```

**After**:
```tsx
<button className="... rounded-md bg-indigo-700 px-4 py-2 font-black text-white ...">
```

If you want future button colors to come from one named token, add a color in `crushable/tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      primary: "#4338ca",   // indigo-700
      // ... existing tokens ...
    },
  },
},
```

Then replace button/link classes with `bg-primary`, `text-primary`, etc. where that token should apply. Adding the token alone does not update existing components.

### 5.4 Update validation

**Example: Require a longer description (120 chars minimum)**

**Before** (`crushable/lib/profiles/completion.ts`):
```tsx
if (profile.description.trim().length < 80) {
  issues.push("Description must be at least 80 characters.");
}
```

**After**:
```tsx
if (profile.description.trim().length < 120) {
  issues.push("Description must be at least 120 characters.");
}
```

Also update the `minLength` on the textarea in `crushable/components/profile/profile-form.tsx`:

```tsx
<textarea id="description" name="description" required minLength={120} rows={6} />
```

### 5.5 Run lint / build / db smoke check

Always run these after making changes:

```bash
npm run lint                # ESLint — catches lint and style issues
npm run build               # TypeScript + Next.js build — catches compilation errors
npm run db:smoke            # Verifies the database schema matches Prisma
```

If you changed `prisma/schema.prisma`:

```bash
npm run prisma:migrate      # Create a new migration
npm run prisma:generate     # Regenerate Prisma client types
```

---

## 6. Cheat Sheet: Key Files in This Repo

| File | Purpose |
|---|---|
| `crushable/app/layout.tsx` | Root HTML shell |
| `crushable/app/page.tsx` | Home page hero |
| `crushable/app/sign-in/page.tsx` | Sign-in page |
| `crushable/app/onboarding/page.tsx` | Profile creation form page |
| `crushable/app/settings/profile/page.tsx` | Edit existing profile |
| `crushable/app/admin/reports/page.tsx` | Admin report queue stub |
| `crushable/components/layout/page-shell.tsx` | Standard page layout |
| `crushable/components/auth/auth-panel.tsx` | Narrow auth card layout |
| `crushable/components/auth/email-link-form.tsx` | Email sign-in form |
| `crushable/components/profile/profile-form.tsx` | Profile edit form (Client) |
| `crushable/components/profile/profile-card.tsx` | Public-facing profile card |
| `crushable/components/ui/status-card.tsx` | Info/status card |
| `crushable/lib/auth/email-link.ts` | Sign-in/sign-up server actions |
| `crushable/lib/auth/session.ts` | Current user session |
| `crushable/lib/profiles/profile-actions.ts` | Profile server actions + Zod schema |
| `crushable/lib/profiles/completion.ts` | Profile completion rules |
| `crushable/lib/profiles/repository.ts` | Prisma profile queries |
| `crushable/lib/validation/profile.ts` | Prohibited content patterns |
| `crushable/lib/db/prisma.ts` | Prisma client singleton |
| `crushable/prisma/schema.prisma` | Full data model |
| `crushable/config/plans.json` | Free/paid plan limits |
| `crushable/tailwind.config.ts` | Design tokens (colors, shadows) |
| `crushable/tsconfig.json` | TypeScript config (strict mode, `@/` path alias) |

---

## 7. FAQ

### What is a component?

A function that returns TSX (HTML-like markup). No classes, no lifecycle methods. Props are the function arguments.

### What are props?

The inputs passed to a component: `<StatusCard title="Hello" />`. Props are read-only — data flows downward from parent to child.

### What is TSX?

A syntax extension that looks like HTML but compiles to JavaScript function calls. Differences from HTML: `className` instead of `class`, `htmlFor` instead of `for`, `{}` for embedding JavaScript, and custom components like `<Field>`.

### Can HTML be mixed with TSX?

TSX *is* your markup. There are no separate `.html` files. The return statement of a component is your template.

### What does `<Field>` translate to in HTML?

It's a React component that outputs a `<div>` containing a `<label>` and an `<input>`. React converts `className` → `class`, `htmlFor` → `for`, and renders the component tree as standard HTML in the browser.

### What is `z` in `z.object(...)`?

It's imported from the `zod` npm package — a validation library. `z.object({...})` defines rules for what valid data looks like. `safeParse()` checks data against those rules.

### What is `_previousState` in a server action?

The first argument passed by React's `useActionState` hook — it carries the previous return value from the action. The `_` prefix means "unused." A plain server action without `useActionState` receives only `formData`.

### What is `useActionState`?

A React hook that connects a form to a server action. Returns `[state, action, pending]` — state is the server's last return value (used to show errors), action is passed to `<form action={...}>`, pending is true while the action runs.

### What is the difference between `lib`, `components`, and `app`?

`app/` — routes and pages (thin, fetches data, renders components). `components/` — UI (no data fetching, receives props). `lib/` — logic (no JSX, server actions, Prisma, validation). Never import Prisma from a component.

### What is the client-server architecture?

Server Components render HTML on the server, usually through app service/repository helpers that query Prisma/Postgres. Client Components (`"use client"`) hydrate in the browser and handle interactivity. Forms submit to server actions, which run on the server, validate, persist, and return state. There is no REST API layer in the current covered flows.

### How does the app fetch data?

Server Components fetch from the database through `lib/` helpers during server rendering — no API calls from the browser are needed for the current profile flows. Dynamic writes happen through server action form submissions.

### How does the layout system work?

`app/layout.tsx` wraps every page automatically (root shell). `PageShell` is an explicit per-page wrapper with a header title and nav. Auth screens use `AuthPanel` instead. There is no persistent sidebar or footer — they would need to be added to `app/layout.tsx`.

### What does a Prisma transaction do?

`prisma.$transaction(...)` wraps multiple database operations. If any operation fails, all prior operations in the transaction are rolled back. This prevents partial updates (e.g., deleting photos but failing to insert new ones).

### When do I use `===` vs `==`?

Always use `===`. It checks both value and type without coercion. `==` converts types to match, which causes subtle bugs.

### What is a Zod schema?

A declarative description of valid data: `z.string().email()` means "must be a string that looks like an email." `safeParse()` returns `{ success: true, data }` or `{ success: false, error }`.

### What are the common Tailwind design tokens?

`text-ink` (primary text), `text-muted` (secondary text), `bg-white` (cards), `border-line` (borders), `bg-teal-700` (buttons), `text-teal-700` (links), `shadow-soft` (card shadows). Defined in `tailwind.config.ts`.
