# Crushable Plan

This file should be enough to resume the project from here.

## Current Status

Crushable is a new Docker-deployed web app in:

```text
/home/matt/codex_projects/crushable
```

The user chose to build the app with a JavaScript/TypeScript stack instead of a Python backend.

Crushable is a U.S.-only product. Product and implementation decisions may
assume American conventions, including U.S. ZIP codes, phone-number formats,
addresses, currency, and applicable location terminology unless a requirement
explicitly says otherwise.

Validation should use maintained libraries instead of custom regular
expressions when a suitable validator exists. Keep Zod as the schema and type
boundary, compose it with `validator.js` for common locale-aware string formats,
and use a libphonenumber-based package if phone-number fields are introduced.
Custom validation remains appropriate for Crushable-specific business and
content rules.

Current intended stack:

```text
Next.js
TypeScript
React
Tailwind CSS
Docker
Postgres
Prisma
```

Deployment account and domain:

```text
Railway account/workspace: steadfast-tranquility
Production domain: crushable.me
Domain registrar and DNS provider: Epik
```

The app is still under development and is not ready for production deployment.
Do not deploy it or change DNS yet. After the app is complete and has passed its
release checks, deploy the GitHub repository through Railway, attach
`crushable.me` as the custom domain, and add Railway's required DNS records in
Epik.

The current project still contains an early static placeholder scaffold:

```text
index.html
src/app.js
src/styles.css
Dockerfile
compose.yaml
nginx.conf
.dockerignore
README.md
```

That scaffold should be replaced with a proper Next.js + Tailwind app once requirements are clear enough.

Planning docs:

```text
stack.md
deployment.md
software-architecture.md
data-model.md
docs/application-flow.md
docs/testing-strategy.md
docs/database-operations.md
```

These docs split technology choices, deployment, software architecture, and data
model notes.

## Stack Shape

The intended runtime shape is:

```text
Browser
  |
  v
Next.js app
  |
  +-- React UI
  |     pages, forms, dashboards, boards, buttons
  |
  +-- Server-side code
  |     saves data, reads data, validates requests
  |
  +-- Database access
        Postgres through Prisma
```

This avoids a separate Python/FastAPI backend. Next.js handles frontend rendering and backend-like server logic in one app.

Development shape:

```text
npm run dev
  starts the Next.js dev server
```

Production shape:

```text
npm run build
npm start
  starts the optimized Next.js server
```

Docker shape is described in `deployment.md`.

## Architecture Principles

Keep the implementation modular even though Next.js is the single app framework.
Provider-specific systems should be isolated behind internal service interfaces
instead of being scattered through UI components or domain logic.

Before implementing a common technical capability, check whether a mature,
well-maintained library already solves it. Prefer established libraries for
standards-based or broadly reusable concerns when they fit the requirements,
security needs, maintenance expectations, and bundle/runtime constraints. Avoid
adding dependencies for trivial behavior or delegating Crushable-specific
product rules to generic packages. Record the reason when choosing custom code
over a credible library.

Do not build speculative functionality. Add features, abstractions,
dependencies, and infrastructure only when a current requirement needs them.
Choose the smallest solution that satisfies the requirement cleanly and leaves
a reasonable path for later change.

Keep UI components thin. Put reusable validation, normalization, product rules,
workflow decisions, and provider-independent behavior behind focused library or
application interfaces rather than one-off logic in pages and components. UI
code should primarily render state, collect input, and call those interfaces.

The current UI is intentionally simple and provisional. Optimize it for clear,
testable workflows and easy iteration rather than final production polish. Use
semantic markup, accessible controls, reusable component boundaries, and
centralized design tokens so a future production design can replace the visual
layer without rewriting product or domain behavior. Do not spend time building
a bespoke design system before the final design requirements exist.

Design core logic for unit testing without React, Next.js, a browser, or a live
database wherever those dependencies are not intrinsic to the behavior. Use
integration tests for repositories and external boundaries, UI tests for UI
responsibilities, and a small end-to-end suite for critical cross-layer flows.
Document every unavoidable manual UI test with exact steps and expected results
in `docs/testing-strategy.md`.

Modules to keep separate:

```text
Authentication/login provider integration
Billing/payment provider integration
Plan entitlements and usage limits
Lightweight billing identity/search verification
Profile completion requirements
Crush matching/search
Email/contact routing
Moderation/reporting/blocking
```

Examples:

```text
UI asks entitlement service: canContactProfile(user)
UI asks auth/session service: getCurrentUser()
Domain code asks billing service: getSubscriptionState(user)
Search code asks verification service: getSearchIdentity(user)
Contact code asks email routing service: sendContactMessage(...)
```

This should make it possible to change payment providers, alter plan rules, or
revise verification logic without rewriting the rest of the app.

Provisional provider/tooling choices:

```text
Payments:
  Stripe is the default assumption for MVP because it supports subscriptions,
  hosted checkout, webhooks, and broad ecosystem support.

Email:
  Postmark is the default assumption for MVP because inbound email processing is
  important for anonymized reply routing.

Database/ORM:
  Postgres + Prisma is the default assumption. Prisma provides a typed schema,
  generated TypeScript database client, and migrations.

Auth:
  Better Auth is the selected auth library direction.
  Start with passwordless email-link sign-in.
  Keep password login, third-party OAuth providers, and email OTP available as
  future options within the same auth system.
  Two-factor authentication is desired.
  Auth should be isolated behind an app auth/session module so the provider can
  change later if needed.
```

These choices are provisional. Provider-specific code should live in adapters so
Stripe, Postmark, Prisma, or the auth provider can be replaced with less churn.

Better Auth migration sequence:

```text
1. Install Better Auth and its Prisma adapter without changing the UI.
2. Generate and review the Better Auth schema alongside the existing Prisma schema.
3. Decide which existing User fields map directly and which remain Crushable-owned.
4. Plan migration/backfill for users that already exist in development data.
5. Configure passwordless magic links with hashed, expiring, single-use tokens.
6. Replace the development cookie and custom auth repositories behind lib/auth.
7. Verify server-side session lookup, logout/revocation, and protected routes.
8. Run unit, integration, and manual browser checks against the isolated test setup.
9. Remove temporary custom auth behavior only after the replacement passes review.
10. Add password, third-party login, and 2FA only as separately scoped features.
```

Do not deploy or introduce production auth credentials until this migration,
schema review, and environment-isolation release blocker are complete.

Reusable component direction:

```text
Build shared UI components for common controls and flows, such as buttons, form
fields, dialogs, settings rows, status badges, profile cards, photo grids, link
management rows, plan/limit notices, and report/block actions.

Keep reusable components provider-agnostic. A login button component should not
know which auth provider is used. A billing notice should not directly call the
payment provider. Components should receive data/actions from app-level services
or hooks.
```

## Requirements Process

Define workflows before implementing features.

### 1. Problem

What pain is the app solving?

First-pass product concept:

```text
Crushable is a dating app where users can maintain a linkable dating profile,
share obfuscatable profile links in social bios, and create anonymous-enough
"crush" records that let other users search whether someone may have a crush
on them.
```

Key differentiators:

```text
Profiles are designed to be linkable from social profiles, similar to sharing an
Instagram handle.

Users can create and revoke disposable public profile links, such as:
crushable.me/somerandomid/username

Users can submit crush records containing identifying traits about someone they
are attracted to.

Other users can search to see whether anyone has submitted a crush record that
appears to describe them.

Profile creation, viewing crushes, and contacting users are controlled by plan
entitlements and configurable usage limits. Paid/eligible users may have higher or
unlimited limits, while free users may get limited usage such as seeing one crush
per month, submitting one crush per month, or contacting one user per day.
Searching crush records is also controlled by plan entitlements to prevent random
people from probing who has crushes.

A desired differentiator is to avoid storing user-to-user messages on Crushable
servers. The preferred direction is anonymized email routing, but this is not
fully worked out yet and may prove infeasible or require careful constraints.

Another desired principle is to fight spam and abuse without shadow banning.
Enforcement should be as transparent as practical, but feasibility needs more
design work.

Crowd-sourced flagging and per-user content filtering based on flags are desired
moderation features, but they are likely post-MVP rather than first-build
requirements.

Long term, agent-assisted profile scanning may be useful for detecting prohibited
contact details, policy violations, spam patterns, and moderation risks. This is
post-MVP and should not be required for the first build.

The target of a crush record does not need an existing Crushable profile.
Crush records should be independent descriptive records by default, not direct
links to a target user's account.
```

Open product tension:

```text
Crush records need to be specific enough to be useful, but anonymous and coarse
enough to protect the privacy and safety of the person being described.
```

Example crush record under consideration:

```text
name: Jane Doe
city: Detroit
approximate age: 30s
eye color: blue
hair color: brown
```

### 2. Users

The first version assumes the main non-admin user is a profile owner/account holder.
That same user can also submit crush records and search for possible crush records
about themselves.

Nothing user-facing can be done without a profile. Account creation alone is not
enough to create links, submit crushes, or search for crush records.

Free users can create an active profile, subject to profile completion rules and
system limits.

A profile counts as active/complete when it has:

```text
N photos
Minimal description
ZIP code
Age decade, such as 18-29, 30-39, 40-49
Sex
Email address
```

MVP defaults:

```text
Minimum photos: 3
Maximum photos: 9
Minimum description length: 80 characters
Username: required
Display name: required
Email address: required
Email address: never public
Dating preferences: not MVP
```

Profile completion rules should be easy to expand. Implement them as a central
set of requirements/configuration rather than scattered one-off checks in the UI.
Future rules may include additional fields, verification steps, minimum bio
lengths, photo review status, or location validation.

Profile descriptions should prohibit direct contact information, including email
addresses, phone numbers, and social handles. Public profiles are intended to
route contact through Crushable rather than exposing off-platform contact details.
Use validation and moderation checks to detect and block likely social handles
and other direct-contact patterns.

Future profile fields should be modeled as configurable enumerations
where possible so options can be added, removed, renamed, or hidden without
rewriting core app logic. These are not MVP profile requirements.

Future candidate profile fields:

```text
Eye color:
  black
  dark brown
  light brown
  gray
  dark green
  light green
  hazel
  dark blue
  light blue

Height:
  feet
  inches

Weight range:
  80-100
  100-120
  120-140
  140-160
  160-180
  180-200
  200+

Languages:
  multi-select, options TBD

Location:
  ZIP code

Relationship status:
  single
  not single

Status behavior:
  not single disables likes and messages
  single disables social links

Style:
  casual/baggy
  casual/trendy
  casual/sexy
  dressy/trendy
  dressy/classic
  dressy/sexy

Body type:
  thin
  toned
  muscular
  average
  large-framed
  bbw

Body shape:
  straight, meaning hips/waist/shoulders
  hourglass
  narrow hips wide shoulders
  wide hips narrow shoulders

Best anatomical features:
  choose best 3
  eyes
  hair
  mouth
  chest
  arms
  hands
  abs
  waist
  butt
  legs
  feet

Romantic style:
  flirty
  cuddly
  kinky
  bff
  traditional
  non-traditional

Energy:
  high energy
  medium energy
  low energy

Sibling order:
  oldest
  middle
  youngest
  only

Personality:
  nerdy
  sporty
  stylish
  fashionista
  passionate
  easygoing
  crunchy
  outdoorsy
  new agey

Politics:
  leftwing
  centrist
  rightwing
  other

Politics importance:
  low
  medium
  high

Friends on other side of political spectrum:
  yes
  no

Love language:
  acts of service
  quality time
  gifts
  touch

Energy level:
  high
  medium
  low

Independence level within a relationship:
  high
  medium
  low

MBTI:
  i/e
  n/s
  t/f
  p/j

Attachment style:
  secure
  anxious
```

Open cleanup notes:

```text
Energy and energy level are duplicates; choose one final field.
Chest was listed twice in best anatomical features; store it once.
Attachment style list may be incomplete.
Need to decide which future attributes are public by default, user-configurable
public, private, searchable, or used only for matching/filtering/ranking.
```

User roles:

```text
Profile owner/account holder:
  Creates an account.
  Has a free or paid plan/subscription state.
  Creates and edits their dating profile.
  Creates and revokes disposable public profile links.
  Submits crush records about people they are attracted to.
  Searches for possible crush records about themselves after verification, subject to plan entitlements.
  Views crush results according to plan entitlements and usage limits.
  Contacts another user through a public profile according to plan entitlements and usage limits.
  Blocks another user from contacting them.

Admin/moderator:
  Reviews abuse, reports, unsafe records, disputes, and suspicious behavior.
```

This decision affects auth, privacy, moderation, persistence, permissions, and deployment.

### 3. Core Workflows

Write 3-7 things a user must be able to do. Candidate workflow set:

```text
Create an account
Choose or receive a free/paid plan
Create a dating profile as the required activation step, if the user's plan allows it
Edit the dating profile
Create a disposable public profile link
Revoke a disposable public profile link
View a public profile through a valid link
Submit a crush record about another person, only after creating a profile
Verify identity/name and search for crush records about self, subject to plan entitlements
View crush results/details, subject to plan limits
Contact a user through their public profile, subject to plan limits
Block another user from making contact
```

The Core Workflows section is the most important part to clarify before building.

Public profile links:

```text
By default, a public profile link shows only profile photos and description.
Additional profile fields should be configurable by the profile owner.
Each profile can have many active disposable public links at once.
Each link can be revoked independently without disabling the user's profile or
other active links.
The maximum number of active links per profile should be configurable.
Each link should have a user-facing label so users can remember where it was
shared, such as Instagram bio, TikTok, QR card, or a person's name.
Public links should not expose exact ZIP code, account email/phone, legal name,
crush activity, or internal verification data.
```

### 4. Data Model

List the objects and fields. Early placeholder models:

```text
User:
  id
  email/phone
  display name
  verified legal name status
  plan
  subscription status
  payment provider customer id
  created date

Profile:
  user id
  email address
  username
  display name
  bio
  photos
  zip code
  age decade
  sex
  public field visibility settings
  dating preferences
  visibility status
  completion status

ProfileActivity:
  profile id
  actor user id optional
  activity type, such as contact_sent, contact_received, crush_submitted,
  crush_matched, profile_link_created, profile_link_revoked, profile_reported,
  user_blocked, admin_action
  related entity id optional
  metadata
  created date

ProfileLink:
  profile id
  random id/token
  optional username path segment
  label
  active/revoked status
  created date
  revoked date

Crush:
  submitted by user id
  optional matched target user id
  target first name variants/list of possible spellings, max 5 initially
  target full last name
  target city
  age decade, using the same bands as profiles
  optional target sex
  optional hair color
  optional eye color
  optional controlled context, such as friend/social circle, coworker, school,
  neighborhood, event/venue, online, or other
  no freeform note in MVP
  duplicate prevention key
  visibility/searchability status
  created date

IdentityVerification:
  user id
  provider
  verified name
  verification status
  provider reference id
  created date

BillingIdentityChange:
  user id
  previous normalized billing name
  previous billing ZIP/postal code
  new normalized billing name
  new billing ZIP/postal code
  provider reference id
  changed at

Subscription:
  user id
  provider
  provider customer id
  provider subscription id
  status
  plan
  current period start
  current period end
  created date
  canceled date

UsageCounter:
  user id
  action type, such as view_crush_detail, submit_crush, or contact_profile
  period, such as day or month
  period start
  count
  limit

Block:
  blocker user id
  blocked user id
  optional reason/category
  created date

Connection:
  id
  participant user ids
  source type, such as public_profile_contact, crush_match, or other_match
  source id
  status, such as active, blocked, closed, or admin_disabled
  relay address
  provider thread/reference id
  created date
  closed date
  closed by user id optional
```

This should be revised once the real workflows are defined.

### 5. Persistence

Decide where data lives:

```text
Postgres
User accounts
External identity verification provider
External payment provider
```

Recommended path:

```text
Use Postgres for any real version because this app requires accounts, revocable
links, crush records, audit trails, moderation, and privacy-sensitive state.
```

Do not store raw credit card information. If payment-card-adjacent verification is used, use a PCI-compliant provider and store only provider tokens/references and verification status.

Billing should use an external payment provider such as Stripe. Store provider
references and subscription state, not raw card data.

### 6. Non-Goals

List things explicitly excluded from the first version. Starting examples:

```text
No native mobile app
No stored on-platform direct messaging until safety/moderation and email-routing feasibility are clearer
No storing raw credit card data
No public browsing of crush records
No exact birth dates for crush targets
No exposing full submitted crush details without verified access rules
No freeform crush notes in MVP because they increase spam, harassment, and moderation risk
```

Non-goals should be updated once the real app purpose is clearer.

### 7. MVP Boundary

Define the smallest version worth building. Current placeholder MVP:

```text
A user can create an account.
A user can receive or choose a free/paid plan.
A free user can create an active profile.
A user can create and revoke disposable profile links.
A visitor can view a profile through an active disposable link.
A signed-in user can submit a coarse crush record.
A paid/payment-verified user can search for possible crush records about themselves.
A paid/payment-verified user can view matching crush details after any required identity checks.
A user can contact a user through a public profile, subject to plan limits.
A user can block another user from contacting them.
The app runs in Docker.
```

This should be confirmed or replaced before scaffolding the final app.

## Privacy, Safety, And Verification Notes

This app is privacy-sensitive. Requirements need to define abuse prevention before launch.

Important constraints:

```text
Crush records can describe people who may not have accounts.
Search results could reveal sensitive attraction/identity information.
Name verification via credit card information is not sufficient by itself and
should not require storing raw card data.
The app likely needs moderation, reporting, rate limits, audit logs, and data
deletion flows.
The app should prefer visible enforcement states over shadow bans where feasible.
```

Identity verification should be treated as a product/security decision. Safer implementation direction:

```text
Use a third-party identity verification or payment provider.
Store provider reference IDs and verification status, not raw card data.
Consider whether legal name, card billing name, government ID, phone, or another
method is appropriate for the first version.
```

MVP lightweight verification direction:

```text
Use payment-provider billing information as a lightweight verification signal.
Use hard matching logic on billing last name.
Use hard matching logic on billing ZIP code or postal code.
Use fuzzier matching logic on first name to account for nicknames, variants, and
spelling differences.
Consider allowing first-initial search as part of the fuzzy first-name logic.
Do not store raw credit card data.
Store only provider references, normalized billing identity fields that are safe
and necessary, and verification/search eligibility status.
```

Payment processor caveat:

```text
Payment processors may return billing details that the app collected, such as
full billing name and postal code, but this does not necessarily mean the issuer
verified the billing name.

For ordinary card payments, postal-code/address checks are more commonly exposed
as verification results than name checks. Treat billing name as a user/payment
metadata signal, not strong identity proof, unless the selected provider offers
a verified-name product or documented name-verification result.

If Crushable sends first name, last name, and ZIP/postal code as billing details
and the card authorization succeeds, that can be treated as lightweight account
friction/attestation. It should not be described internally or to users as
confirmed legal-name verification unless the provider returns a documented
verified-name result.

Users should not be allowed to store a search-eligibility/legal-name value that
differs from the name sent to the payment processor for lightweight verification.
If the app supports a public display name, keep it separate from the billing/
verification name used for crush search eligibility.

Billing/search identity fields should be change-limited. Initially, billing name
and ZIP/postal code cannot be changed more than once per month, with the exact
period configurable. Changes should be auditable.
```

User disclosure requirement:

```text
Before payment or card entry, tell users that billing last name and billing ZIP/
postal code may be used to verify search eligibility and protect privacy.
Tell users that using a card with someone else's billing name or ZIP may prevent
them from finding crushes intended for them.
Explain that Crushable does not store raw credit card data.
```

## Plans, Usage Limits, And Billing

Part of the product model is that profile creation, viewing crushes, and contacting
users through public profiles may be restricted by plan entitlements and usage
limits. This can support a free tier with limited usage and paid tiers with higher
or unlimited usage.

First-pass rule:

```text
Users can create an account without paying.
Users receive or choose a plan.
Plan entitlements determine whether the user can create an active profile.
Users must have a profile before creating links, submitting crushes, or searching crushes.
Plan entitlements and usage counters determine whether the user can search crush records.
Plan entitlements determine whether the user can view matching crush result details.
For MVP, seeing crush details is all-or-nothing for eligible paid users, not
metered per result.
Plan entitlements and usage counters determine whether the user can submit a crush.
Plan entitlements and usage counters determine whether the user can contact a user through a public profile.
```

Plan details, entitlements, and usage limits are system configuration. They
should be configurable rather than scattered as hard-coded logic.
System-global config should live in versioned JSON or YAML config files.
Per-user plan assignment, subscription state, usage counters, identity state, and
user-specific overrides must live in the database, not in a config file.

Pre-subscription teaser states are acceptable and should be configurable. Possible teaser states:

```text
No details: "You may have crushes waiting."
Count only: "3 possible crushes found."
Coarse hint only: "Possible crushes in Detroit."
```

Remaining open product question:

```text
What contact affordance is shown to non-subscribers on public profiles?
```

Example configurable limits:

```text
Free plan:
  create active profile
  create limited public profile links
  search crush records 0 times
  view crush result details 0 times
  submit 1 crush per month
  contact 1 user per day

Paid plan:
  search crush records allowed
  crush search quota disabled initially/unlimited searches, but configurable for future use
  higher or unlimited crush submissions
  all-or-nothing access to matching crush result details
  higher or unlimited public-profile contacts
  higher public profile link limit
```

Search result UI:

```text
Paid/eligible users can see a list of matching crush result links.
Clicking a result opens its details.
The click is a UI interaction, not a per-result paid reveal or quota event for MVP.
The detail view can show the profile of the user who submitted the crush.
The searched user can then decide whether to contact the crusher, subject to
contact rules, blocking, and plan/usage limits.
The crusher cannot see the crushee's profile or identity from the crush result
unless the crushee accepts/initiates contact.
Submitting a crush does not create reciprocal visibility by itself.
After the crushee accepts/initiates the connection, the crusher can send a crush
connect message only if the crusher is a paid/eligible user.
This requirement is intended to reduce bogus crush submissions and spammy connect
attempts.
```

Initial search result presentation:

```text
Show a crusher profile card plus limited crush context.
Example fields: profile display info, controlled context, submitted month/year,
and a link/button to view the crusher profile.
Do not show all target-identifying fields by default.
Keep this presentation configurable/easy to modify.
```

Duplicate crush rule:

```text
A user can never submit duplicate active crushes for the same apparent target.
Different users can submit crushes for the same apparent target.
The app should enforce one active crush per submitter + target identity key.
The target identity key should likely be based on normalized first-name variants,
last name, city, age decade, and target sex, with care around spelling/case normalization.
First-name variants should have a configurable maximum, initially 5.
First-name variants should be normalized and sorted on the backend before storage,
comparison, or duplicate checks.

MVP uniqueness scope:
  submitter user id
  overlapping normalized first-name variants
  normalized full last name
  normalized city
  age decade
  target sex

Fields not included in uniqueness:
  hair color
  eye color
  controlled context
```

Crush search privacy rule:

```text
Searching crush records should be paywalled or otherwise entitlement-limited.
This prevents random users from probing names and cities to infer who has crushes.
Search should be scoped to the searching user's verified identity and profile
where possible, not arbitrary public lookup.
Free accounts cannot search crush records because Crushable needs payment/billing
identity information before allowing search.
```

Billing should use a payment provider such as Stripe. Do not store raw credit card
data. Store plan, subscription status, provider customer ID, provider subscription
ID, usage counters, and relevant billing state.

## Communication Model

The preferred communication direction is anonymized email routing instead of
stored on-platform messages.

Goal:

```text
Let users contact each other without exposing personal email addresses and without
Crushable storing full message history as an app-level messaging product.
```

Possible shape:

```text
Sender writes a short contact message.
Crushable sends it through an email provider using anonymized relay addresses.
Recipient can reply through the relay.
Email replies from the recipient's email client route back through Crushable's
email proxy/relay to the other participant.
Crushable stores delivery/routing metadata, abuse state, and opt-out/block state,
but not full message bodies if technically and legally feasible.
```

MVP contact flow:

```text
A visitor opens a public profile link.
They choose to contact the profile owner.
If not signed in, they must sign in and have a profile.
If not allowed by plan or usage limits, they see an upgrade/limit message.
If allowed, they send a short contact message.
Crushable sends the message by email.
Recipient can rely on their own email spam filters in addition to Crushable
blocking/reporting controls.
Recipient can ignore, block, or report the sender.
No full app inbox is required for MVP.
```

Open feasibility questions:

```text
Can abuse/spam moderation work without storing message bodies?
How are reports handled if the app does not store messages?
Can users block a sender or revoke a relay thread?
How long does routing metadata need to be retained?
What does the email provider retain?
What privacy claims can be made accurately?
How should inbound reply webhooks be authenticated and mapped to the correct
relay/contact context?
```

This should be treated as an open design area, not a finalized architecture.

Email reply routing requirement:

```text
Crushable needs inbound email handling so replies from a user's normal email
client can pass through the anonymized relay.

Each contact/relay context should have provider-managed or app-managed relay
addresses/thread identifiers.

Example:

```text
Outbound contact email sets Reply-To to a relay address such as:
someaddress@crushable.me
```

Inbound email provider webhooks should map replies back to the correct relay
context, enforce block/closed status, and forward the reply without exposing
personal email addresses.

Once users are connected, they continue communicating through the email relay.
The relay remains active until one participant blocks contact, closes the relay,
or an admin/moderation action disables it.

Email routing is permitted only for valid active Connection records. If a
Connection is blocked, closed, missing, or admin-disabled, inbound replies should
not be forwarded.
```

## Anti-Abuse And Enforcement

The product should try to fight spam and abuse without shadow banning.

Preferred principles:

```text
Use explicit account states where possible, such as active, limited, suspended,
under review, or contact-restricted.
Tell users when an action is blocked or limited, unless disclosure would create
a serious security or abuse risk.
Use rate limits, quotas, verification, payment friction, email reputation checks,
reporting, blocking, and moderation queues before relying on invisible suppression.
Crowd-sourced flagging and user-controlled filtering are desirable later features.
Keep moderation and enforcement actions auditable.
```

MVP safety baseline:

```text
Per-user blocking
Report a profile
Rate limits
Admin/moderator report review queue
Timed account suspension
Explicit account/contact restriction states
```

MVP admin tools:

```text
View reports
Search profiles/accounts
Suspend any account for a specified duration
Delete any account
Undo supported admin actions
```

Admin account actions should be auditable.
Admin actions should support undo where feasible. Account deletion should likely
start as a reversible soft delete/deactivation with a retention window before any
hard purge.

Undo should be available from the admin audit/history view when an action is
reversible. Examples include lifting a suspension, restoring a soft-deleted
account, or reversing a mistaken restriction.

AdminAuditLog:
  admin user id
  target user id
  action type
  action reason
  previous state
  new state
  undo/reversal status
  created date

Open feasibility questions:

```text
Can transparent enforcement prevent abuse without teaching attackers exactly how
to evade limits?
Which actions should be rate limited?
Which limits should be user-visible?
When is temporary hidden risk scoring acceptable internally if user-facing action
states remain explicit?
What is the appeal or review path for restricted users?
```

This should remain a product/security design topic before launch.

Post-MVP desired flagging/filtering model:

```text
Users can flag profiles, crush records, contact attempts, or relay interactions.
Flags can have categories, such as spam, harassment, impersonation, explicit
content, fake profile, unsafe behavior, or other.
Users can choose content-filtering preferences based on aggregate flags.
Filtering can be personalized rather than always becoming a global hidden ban.
Moderators can review high-risk or high-volume flags.
```

Post-MVP agent-assisted moderation:

```text
Scan profile descriptions for social handles, emails, phone numbers, spam, or
policy violations.
Flag risky profiles for user correction or moderator review.
Keep deterministic server-side validation for obvious prohibited patterns even
if agent scanning is added later.
```

Implementation direction:

```text
Store flags as auditable records.
Separate user-facing content filters from admin enforcement actions.
Avoid silently hiding a user's content globally without an explicit enforcement state.
Let users opt into stricter or looser filters where safe.
```

## Immediate Next Steps

1. Review the current persisted auth/onboarding/profile foundation in the browser.
2. Create developer documentation that assumes no prior understanding of React,
   Tailwind CSS, TypeScript, Next.js, Prisma, or Docker Compose.
3. Choose the next feature goal: disposable profile links, crush records/search,
   billing/subscriptions, email relay/contact routing, or product review cleanup.
4. Implement the next feature incrementally behind existing module boundaries.
5. Keep local app control scripts working for start/stop/status/logs.
6. Run local verification and Docker verification before checkpointing each phase.
7. When richer immediate form feedback is needed, move reusable Zod schemas to
   shared validation modules and run the same schemas on the client and server.
   Keep server validation authoritative, retain native HTML constraints for
   simple feedback, and avoid duplicating validation rules or adding a form
   framework before the forms require one.
8. Required release blocker, deferred until deployment work: before any
   production deployment, add versioned, non-secret environment
   metadata (YAML is the current preference) and a fail-closed deployment check.
   The check must confirm that development, test, and production use distinct
   environment identifiers, application hostnames, database hostnames, and
   database names. Keep credentials and full production connection strings in
   Railway rather than the repository. Run the guard as a Railway pre-deploy
   command before migrations or application startup.
9. Integrate Better Auth before extending custom email-link token or session
   behavior beyond temporary scaffolding. Verify its Prisma schema migration,
   custom simple sign-in UI, session lookup, and magic-link flow first.

## MVP Routes

Proposed routes:

```text
Public:
  /                         landing or redirect
  /p/[linkId]/[username]    public disposable profile link
  /p/[linkId]/[username]/contact
                            contact through that public profile link

Auth/account:
  /sign-in
  /sign-up
  /sign-in/check-email     email-link confirmation/stub
  /onboarding              create profile
  /settings/profile        edit profile
  /settings/links          manage disposable links
  /settings/billing        plan/payment status
  /settings/activity       profile activity

Crushes:
  /crushes/new             submit crush
  /crushes/search          paid/payment-verified search
  /crushes/results         matching crushes
  /crushes/[id]            crusher profile/details from a match

Contact:
  /p/[linkId]/[username]/contact
                            contact through a public profile link
  /crushes/[id]/connect    paid/eligible crusher sends connect message after crushee accepts
  /settings/activity       contact/activity status metadata

Admin:
  /admin/reports
  /admin/accounts
  /admin/accounts/[id]
  /admin/audit
```

First-build route focus:

```text
/p/[linkId]/[username]
/onboarding
/settings/profile
/settings/links
/crushes/new
/crushes/search
/admin/accounts
/admin/reports
```

Contact route access:

```text
/p/[linkId]/[username]/contact is the route for contacting through a public
profile link.

/crushes/[id]/connect is the route for a paid/eligible crusher to send a connect
message after the crushee accepts/initiates the connection.

/settings/activity can show contact/activity status metadata.

Contact routes are access-restricted.
The user must be signed in.
The user must have an active/complete profile.
Plan entitlements and usage limits must allow contact.
Blocking rules must allow contact.
For crush connect access, there must be an existing accepted crush match or other
approved match/contact context.
The crushee must have accepted/initiated the connection and the crusher must be
paid/eligible.
```

## Implementation Notes For Next Session

Before editing, verify current files because the worktree may have changed.

## Developer Documentation Requirement

Create beginner-oriented developer documentation before the feature surface gets
much larger. Assume the reader understands general programming concepts but does
not yet understand this stack.

The docs should explain:

```text
How to start, stop, inspect, and troubleshoot the local app stack.
What Next.js is doing in this project.
What React components are and where they live.
What TypeScript adds over plain JavaScript.
How Tailwind CSS is used for styling.
How Prisma maps code to Postgres tables and migrations.
How server actions, repositories, and provider adapters fit together.
How to add a page, component, form field, validation rule, database field, and
configuration value in the style of this codebase.
How to read common errors from Docker, Prisma, Next.js, TypeScript, and Tailwind.
```

Suggested first documents:

```text
docs/development-guide.md
docs/react-typescript-tailwind-tutorial.md
```

The guide and tutorial should use concrete examples from the current Crushable
files rather than generic framework tutorials.

The tutorial should teach React, TypeScript, and Tailwind through this app by
walking through real tasks such as:

```text
Reading a Next.js page file and understanding how it renders.
Reading and modifying a React component.
Understanding props, state, server components, and client components using
Crushable examples.
Understanding TypeScript types and enums from profile/auth code.
Adding a simple UI field to a form.
Adding Tailwind classes to style layout, spacing, typography, and states.
Following a submitted form from component to server action to validation to
repository/database call.
Interpreting TypeScript and React errors encountered during those edits.
```

Expected replacement direction:

```text
Remove the static index.html/src placeholder.
Create a Next.js app with TypeScript, Tailwind, Prisma, and Postgres.
Keep Docker deployment simple: app service plus db service.
Stub provider adapters before adding real Stripe/Postmark/auth credentials.
```

Likely final project shape:

```text
crushable/
  app/
    page.tsx
    layout.tsx
    p/[linkId]/[username]/page.tsx
    p/[linkId]/[username]/contact/page.tsx
    onboarding/page.tsx
    settings/
    crushes/
    admin/

  components/
    ui/
    profile/
    profile-links/
    crushes/
    contact/
    admin/

  lib/
    app-services/
    auth/
    billing/
    entitlements/
    profiles/
    profile-links/
    crushes/
    verification/
    contact/
    email-relay/
    moderation/
    admin/
    audit/
    db/
    validation/
    normalization/

  prisma/
    schema.prisma

  public/

  package.json
  Dockerfile
  compose.yaml
```
