# Crushable Testing Strategy

## Goal

Make product and domain behavior testable without driving the UI. Keep UI code
thin enough that browser tests focus on rendering, interaction, accessibility,
and layer wiring rather than proving core business rules.

## Test boundaries

### Unit tests

Use unit tests for pure, framework-independent behavior:

- validation and normalization;
- profile-completion rules;
- plan entitlements and limits;
- crush matching and duplicate detection;
- access and contact policies;
- provider-independent mapping and decision logic.

These modules should expose small named functions or interfaces, avoid React and
Next.js imports, and receive dependencies as arguments when practical.

### Repository and integration tests

Use integration tests for behavior that depends on Postgres, Prisma,
transactions, migrations, or provider adapters. Verify observable results and
rollback/error behavior rather than implementation details.

### UI tests

Use component or browser tests only for UI responsibilities:

- content and conditional states render correctly;
- controls invoke the expected action or callback;
- submitted values and returned errors remain visible;
- keyboard and assistive-technology behavior works;
- responsive layout and visual hierarchy remain usable.

Do not use UI tests as the primary proof for validation, normalization,
entitlements, matching, or other core logic.

### End-to-end tests

Keep a small set of end-to-end tests for critical paths across layers, such as
account creation through persisted profile completion. These complement rather
than replace focused unit and integration tests.

## Manual test policy

Manual tests are reserved for behavior that cannot be covered reasonably by
automated tests, especially subjective visual review, browser/assistive-device
behavior not available to automation, and third-party flows that provide no
safe test interface.

Every required manual test must document:

1. purpose and risk covered;
2. prerequisites and test data;
3. exact steps;
4. expected result;
5. date and result of the latest run;
6. why automation is not currently practical.

When a manual test becomes automatable at reasonable cost, replace it with an
automated test and remove it from the required manual checklist.

## Current manual review checklist

### Profile form visual and interaction review

- Purpose: confirm the rendered form is understandable and returned errors do
  not create confusing visual or interaction states.
- Prerequisites: local Postgres and app running; signed-in development user.
- Steps: submit invalid onboarding data, inspect errors and retained fields;
  submit valid data; edit the saved profile; refresh the page.
- Expected: errors are readable, age decade and sex remain selected, successful
  saves redirect to profile settings, and saved values survive refresh.
- Latest run: passed on 2026-07-12, including invalid and valid U.S. ZIP cases.
- Manual reason: the current environment requires a person to judge the visual
  clarity and browser interaction. Core ZIP behavior is covered by unit tests.

## Commands

```bash
npm test
npm run lint
npm run build
npm run db:smoke
```

Run the narrowest relevant test while developing, then run the full applicable
set before checkpointing or committing a completed change.
