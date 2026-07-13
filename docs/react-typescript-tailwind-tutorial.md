# React, TypeScript, and Tailwind in Crushable

This tutorial makes one small, real improvement: add helper text below the
profile description field. It teaches the three technologies together without
changing the database or server-side validation.

## 1. Find the component

Both onboarding and profile settings render
`components/profile/profile-form.tsx`. Changing that shared component updates
both pages. This reuse is a core React idea: build a component once, then render
it from multiple parents with different props.

The file starts with:

```tsx
"use client";
```

That declares a Client Component. This form needs browser-side React behavior
because `useActionState` tracks submission results and whether a submission is
pending.

## 2. Understand JSX

Near the description field, JSX mixes familiar HTML elements with JavaScript:

```tsx
<label className="text-sm font-bold text-ink" htmlFor="description">
  Description
</label>
```

JSX uses `className` instead of HTML's `class`, and `htmlFor` instead of `for`.
Text and nested elements go between opening and closing tags. Curly braces put a
JavaScript value or expression into JSX, as in `{submitLabel}`.

## 3. Add accessible helper text

In `components/profile/profile-form.tsx`, add a paragraph between the label and
the `<textarea>`:

```tsx
<p id="description-help" className="text-sm text-muted">
  Write at least 80 characters. Contact details and social handles are not
  allowed.
</p>
```

Then add this attribute to the `<textarea>`:

```tsx
aria-describedby="description-help"
```

The id connects the field to its explanation for assistive technology. This is
ordinary HTML accessibility expressed through JSX.

## 4. Read the Tailwind classes

The paragraph uses two utility classes:

- `text-sm` makes the font smaller than normal body text.
- `text-muted` uses the project's muted text color.

`text-muted` is not a built-in Tailwind color. It is a project-specific,
semantic color token. Open `tailwind.config.ts` and find
`theme.extend.colors`. That configuration gives the app a shared visual
vocabulary. If the muted color changes there, every `text-muted` use changes.

Try changing `text-sm` to `text-base`, save, and inspect both versions in the
browser. Restore `text-sm` when finished.

## 5. Add a typed prop

Now make the helper text customizable. Add an optional property to
`ProfileFormProps`:

```tsx
type ProfileFormProps = {
  defaultEmail: string;
  defaults?: ProfileFormDefaults;
  mode: "onboarding" | "settings";
  descriptionHelp?: string;
};
```

The `string` type permits text. The `?` means callers do not have to supply it.
Destructure it with a default value:

```tsx
export function ProfileForm({
  defaultEmail,
  defaults = {},
  mode,
  descriptionHelp =
    "Write at least 80 characters. Contact details and social handles are not allowed.",
}: ProfileFormProps) {
```

Finally render the value:

```tsx
<p id="description-help" className="text-sm text-muted">
  {descriptionHelp}
</p>
```

Curly braces tell JSX to evaluate the TypeScript variable. Existing callers
still work because the prop is optional and has a default.

## 6. Pass a prop from a page

In `app/onboarding/page.tsx`, replace the self-closing form component with:

```tsx
<ProfileForm
  defaultEmail={user.email}
  mode="onboarding"
  descriptionHelp="Tell people what makes spending time with you enjoyable. Leave contact details out."
/>
```

The settings page does not pass `descriptionHelp`, so it uses the default. You
have now seen data flow in React: a parent page passes a prop down to a child
component.

TypeScript protects this boundary. Passing a number such as
`descriptionHelp={42}` should produce an error because the prop requires a
string. Undo that deliberate error before continuing.

## 7. See how form state works

The component contains:

```tsx
const [state, action, pending] = useActionState(serverAction, initialState);
```

- `state` holds issues and previously submitted values returned by the server.
- `action` is assigned to `<form action={action}>`.
- `pending` becomes true while the request is running.

React renders again when this state changes. That is why the button can switch
from its normal label to `Saving...`, and why server validation issues appear
without manually editing the page.

The selected action depends on a typed prop:

```tsx
const serverAction =
  mode === "onboarding" ? saveOnboardingProfile : saveProfileSettings;
```

This is a conditional expression: when `mode` is `"onboarding"`, use the first
action; otherwise use the settings action.

## 8. Follow validation to the server

HTML attributes such as `required` and `minLength={80}` give quick browser
feedback, but browser checks are never sufficient. A request can bypass the
browser.

Open `lib/profiles/profile-actions.ts`. The `"use server"` directive keeps its
exports on the server. The action:

1. Reads `FormData` by each input's `name`.
2. Uses a Zod schema to validate types and basic constraints.
3. Calls `getProfileCompletionIssues` for product-specific rules.
4. Saves through a repository only when checks pass.
5. Returns typed issues on failure or redirects on success.

Notice the contract between HTML and TypeScript: the textarea's
`name="description"` must match `formData.get("description")`. Renaming one
without the other breaks the form-data contract and causes validation to
receive an empty value.

The direct-contact patterns live in `lib/validation/profile.ts`. Keeping that
rule outside the component lets every entry point enforce the same policy.

## 9. Verify the change

With the app running, visit both:

```text
http://localhost:3000/onboarding
http://localhost:3000/settings/profile
```

Confirm the onboarding page uses its custom helper and settings uses the
default. Then run:

```bash
npm run lint
npm run build
```

Lint checks code quality and React rules. Build runs Prisma generation,
TypeScript checking, and the production Next.js build. Both should pass before
the change is considered finished.

## 10. Practice exercises

Try these one at a time and verify after each:

1. Add an optional `submitLabel` prop while preserving the current labels as
   defaults. This practices props, union-driven behavior, and fallback values.
2. Extract the description label, helper, and textarea into a small local
   component with typed props. This practices component composition.
3. Add a visible character-count hint. This requires client state and is a
   larger step; keep the server's 80-character validation authoritative.
4. Add a new persisted profile field. This advanced exercise crosses every
   layer: Prisma schema and migration, form JSX, form-state type, Zod schema,
   completion rules, repository input, and settings defaults.

The important pattern is not any single syntax feature. Trace data from parent
props, through JSX and form state, into a server action, through validation, and
finally into a repository. That path is the backbone of Crushable feature work.
