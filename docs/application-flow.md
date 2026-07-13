# Crushable Application Flow

This diagram is a living map of the current product flow and implementation
status. Update it when a route or subsystem changes status.

```text
Legend: [DONE] implemented and exercised
        [PART] implemented foundation; production dependency or behavior remains
        [STUB] route or interface exists; feature behavior is not implemented
        [PLAN] not implemented yet

USER JOURNEY

                         +--------------------+
                         | Landing page       |
                         | /                  |
                         | [DONE]             |
                         +----------+---------+
                                    |
                    +---------------+---------------+
                    |                               |
                    v                               v
          +--------------------+          +--------------------+
          | Create account     |          | Sign in            |
          | /sign-up           |          | /sign-in           |
          | [PART] dev email   |          | [PART] dev email   |
          +----------+---------+          +----------+---------+
                     |                               |
                     +---------------+---------------+
                                     v
                          +--------------------+
                          | Check email        |
                          | /sign-in/check-    |
                          | email [PART]       |
                          +----------+---------+
                                     |
                                     v
                          +--------------------+
                          | Auth session       |
                          | [PART] persisted + |
                          | development cookie |
                          +----------+---------+
                                     |
                                     v
                          +--------------------+
                          | Profile exists and |
                          | is complete?       |
                          +-----+---------+----+
                                | no      | yes
                                v         v
                    +----------------+   +----------------------+
                    | Onboarding     |   | Profile settings     |
                    | /onboarding    |   | /settings/profile    |
                    | [PART]         |   | [PART]               |
                    | data persists; |   | edit/persist works;  |
                    | photos mocked  |   | photos mocked        |
                    +-------+--------+   +-----------+----------+
                            |                        |
                            +------------+-----------+
                                         v
                    +--------------------+--------------------+
                    | Authenticated product features          |
                    +--------------------+--------------------+
                                         |
             +---------------------------+---------------------------+
             |                           |                           |
             v                           v                           v
   +--------------------+      +--------------------+      +--------------------+
   | Disposable profile|      | Crush workflows    |      | Account services   |
   | links              |      | submit/search/    |      | billing/activity   |
   | [STUB]             |      | results [STUB]    |      | [STUB]             |
   +---------+----------+      +---------+----------+      +--------------------+
             |                           |
             v                           v
   +--------------------+      +--------------------+
   | Public profile     |      | Contact/email relay|
   | /p/... [STUB]      |      | [STUB]             |
   +--------------------+      +--------------------+

   Admin reports/accounts/audit routes: [STUB]
   Real photo upload, storage, and review: [PLAN]
   Production auth provider and 2FA: [PLAN]


APPLICATION FLOW

 +--------------------------- UI: intentionally simple ------------------------+
 | Next.js pages + reusable components                                         |
 | Render state, collect input, invoke actions                                 |
 +-----------------------------------+------------------------------------------+
                                     |
                                     v
 +----------------------- Application boundaries ------------------------------+
 | Auth/session services [PART]                                                 |
 | Profile server actions [DONE]                                                |
 | Billing provider interface [STUB]   Email relay interface [STUB]             |
 +-----------------------------------+------------------------------------------+
                                     |
                                     v
 +----------------------- Core libraries: unit-testable ------------------------+
 | Profile completion [DONE, TESTED]                                            |
 | Description contact policy [DONE, TESTED]                                    |
 | U.S. ZIP validation [DONE, TESTED]                                            |
 | Normalization [DONE, TESTS NEXT]                                              |
 | Crush duplicate logic [DONE, TESTS NEXT]                                     |
 | Entitlements/contact access [DONE, TESTS NEXT]                               |
 +-----------------------------------+------------------------------------------+
                                     |
                                     v
 +----------------------- Persistence boundaries -------------------------------+
 | User/profile/auth repositories [PART]                                        |
 | Prisma schema + initial migration [DONE]                                     |
 | Postgres migration + smoke check [DONE]                                      |
 | Repository integration test suite [PLAN]                                     |
 +------------------------------------------------------------------------------+
```

## Current focus

Finish testing and reviewing the auth/onboarding/profile foundation before
selecting the next feature. Production visual design is intentionally deferred;
the current UI exists to make functionality clear and testable.
