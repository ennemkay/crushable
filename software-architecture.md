# Crushable Software Architecture

This document defines the intended software structure before implementation.
It should guide scaffolding, module boundaries, and future refactors.

## Goals

```text
Keep provider integrations replaceable.
Keep UI components reusable and provider-agnostic.
Keep business rules centralized and testable.
Avoid scattering Prisma, Stripe, Postmark, or auth-provider calls through pages.
Let the data schema evolve incrementally without losing clear boundaries.
```

## High-Level Stack

```text
Next.js + TypeScript
React
Tailwind CSS
Postgres
Prisma
Stripe, provisional
Postmark, provisional
Email link sign-in, with 2FA desired
Docker Compose
```

## Layering

Preferred dependency direction:

```text
UI/routes
  -> application services
    -> domain services
      -> repositories
      -> provider adapters
```

Rules:

```text
UI components should not call Prisma directly.
UI components should not call Stripe, Postmark, or auth providers directly.
Provider-specific code should live in adapters.
Business rules should live in domain/application services, not route components.
Repositories should hide database access details from domain services.
```

Example:

```text
ContactForm
  calls requestPublicProfileContact()

requestPublicProfileContact()
  checks auth/session
  checks profile completion
  checks entitlements and usage limits
  checks block rules
  creates contact/connection records
  calls emailRelay.sendInitialContact()
  writes profile activity and audit records
```

## Proposed Source Layout

```text
app/
  layout.tsx
  page.tsx
  sign-in/page.tsx
  sign-in/check-email/page.tsx
  sign-up/page.tsx
  p/[linkId]/[username]/page.tsx
  p/[linkId]/[username]/contact/page.tsx
  onboarding/page.tsx
  settings/profile/page.tsx
  settings/links/page.tsx
  settings/billing/page.tsx
  settings/activity/page.tsx
  crushes/new/page.tsx
  crushes/search/page.tsx
  crushes/results/page.tsx
  crushes/[id]/page.tsx
  crushes/[id]/connect/page.tsx
  admin/reports/page.tsx
  admin/accounts/page.tsx
  admin/accounts/[id]/page.tsx
  admin/audit/page.tsx

components/
  ui/
  forms/
  profile/
  profile-links/
  crushes/
  contact/
  admin/
  layout/

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
  config/

prisma/
  schema.prisma
  migrations/
```

This layout can change during scaffolding, but the boundaries should remain.

## Domain Modules

### Auth

Responsibilities:

```text
current user/session lookup
sign-in/sign-out boundary
2FA status, when added
role lookup, such as user/admin
```

Rules:

```text
App code should call auth/session helpers, not provider APIs directly.
Email link sign-in is acceptable for MVP.
The first scaffold uses email-link request server actions that redirect to a
check-email confirmation page without sending real email yet.
2FA is desired and should fit behind the same auth boundary.
```

### Billing

Responsibilities:

```text
payment provider customer IDs
subscription status
billing identity fields collected for lightweight verification
payment webhooks
billing portal/checkout sessions
```

Rules:

```text
Stripe is provisional.
Do not store raw card data.
Store provider references and normalized billing/search identity fields only.
Billing/search name cannot differ from the name sent to the processor.
Billing/search name and ZIP changes are limited and audited.
```

### Entitlements

Responsibilities:

```text
plan definitions
feature access checks
usage counters
quota windows
upgrade/limit reasons
```

Example API shape:

```text
canCreateProfile(userId)
canSubmitCrush(userId)
canSearchCrushes(userId)
canViewCrushDetails(userId)
canContactProfile(userId, targetProfileId)
consumeUsage(userId, actionType)
```

Rules:

```text
No feature should hard-code "paid" checks directly.
Features should ask the entitlement service.
Limits should be configurable.
System-global plan/limit details should be loaded from versioned config files,
using JSON or YAML.
Per-user plan assignment, subscription state, usage counters, identity state, and
user-specific overrides must be persisted in the database.
```

### Profiles

Responsibilities:

```text
profile create/edit
profile completion status
photo requirements
profile field visibility
public profile rendering data
profile description validation
profile activity records
```

Rules:

```text
Nothing user-facing can be done without an active/complete profile.
Profile completion rules should be centralized and expandable.
Email is required but never public.
Profile descriptions must prohibit social handles, emails, phone numbers, and
other direct-contact patterns.
```

### Profile Links

Responsibilities:

```text
disposable public profile links
link labels
active/revoked status
maximum active links per profile
public link lookup
```

Rules:

```text
Each profile can have many active disposable links.
Each link can be revoked independently.
Each link needs a user-facing label.
The active-link maximum is configurable.
```

### Crushes

Responsibilities:

```text
crush submission
crush duplicate prevention
crush search
crush result presentation
crush match/accept flow
crusher connect flow
```

Rules:

```text
Crush target does not require an existing profile.
First-name variants have max 5 initially.
First-name variants are normalized and sorted on the backend.
Duplicate active crushes are scoped to submitter + target identity key.
Different users can submit crushes for the same apparent target.
Free users cannot search crushes.
Paid/payment-verified users can search crushes, with search quota disabled initially.
Crush detail access is all-or-nothing for eligible users.
Crusher cannot see crushee unless crushee accepts/initiates connection.
Crusher must be paid/eligible to send a crush connect message.
```

### Verification

Responsibilities:

```text
lightweight payment/billing identity matching
search eligibility identity
billing name/ZIP change rules
verification disclosure state
```

Rules:

```text
Use payment-provider billing information as lightweight attestation, not full ID.
Postal/ZIP check is stronger if provider returns a verification result.
Billing name is weak unless the provider documents name verification.
Use hard logic on last name and ZIP/postal code.
Use fuzzy logic on first name, including possible first-initial search.
Disclose billing name/ZIP usage before payment/card entry.
```

### Contact

Responsibilities:

```text
public profile contact requests
crush connect messages
connection lifecycle
block/closed/admin-disabled enforcement
contact metadata and activity records
```

Rules:

```text
Contact through public profiles uses /p/[linkId]/[username]/contact.
Crush connect uses /crushes/[id]/connect.
Contact is access-restricted by auth, profile status, entitlements, usage, and blocks.
Email routing is permitted only for active Connection records.
```

### Email Relay

Responsibilities:

```text
send outbound contact emails
set Reply-To relay addresses such as someaddress@crushable.me
receive inbound email provider webhooks
map inbound replies to Connection records
forward replies without exposing personal email addresses
enforce blocked/closed/admin-disabled connection status
```

Rules:

```text
Postmark is provisional because inbound email processing is needed.
No full app inbox is required for MVP.
Avoid storing full message bodies if technically and legally feasible.
Store routing metadata, delivery status, abuse state, and activity records.
```

### Moderation

Responsibilities:

```text
per-user blocking
profile reports
rate limits
account/contact restrictions
post-MVP flagging/filtering
```

Rules:

```text
Prefer visible enforcement states over shadow banning.
MVP supports blocking and reporting profiles.
Crowd-sourced flagging and per-user content filtering are post-MVP.
Agent-assisted profile scanning is post-MVP.
```

### Admin

Responsibilities:

```text
view reports
search profiles/accounts
suspend any account for a duration
soft-delete/deactivate accounts
undo supported admin actions
view audit history
```

Rules:

```text
Admin actions should be auditable.
Admin actions should support undo where feasible.
Deletion should start as reversible soft delete/deactivation with a retention
window before hard purge.
```

### Audit

Responsibilities:

```text
admin audit log
billing identity change audit
profile activity records
security-sensitive event history
```

Rules:

```text
Audit records should capture actor, target, action, previous state, new state,
reason, reversibility, and timestamp where applicable.
```

## Repositories

Use repositories to isolate Prisma/database access.

Examples:

```text
userRepository
profileRepository
profileLinkRepository
crushRepository
connectionRepository
blockRepository
reportRepository
auditRepository
usageCounterRepository
subscriptionRepository
```

Rules:

```text
Repositories should not contain UI logic.
Repositories should not call provider APIs.
Repositories should be small and focused on persistence.
Domain/application services should coordinate multi-step workflows.
```

## Provider Adapters

Provider adapters isolate third-party services.

Examples:

```text
billingProvider
  createCheckoutSession()
  createBillingPortalSession()
  parseWebhook()
  getCustomerBillingDetails()

emailProvider
  sendEmail()
  parseInboundWebhook()
  verifyWebhook()

authProvider
  getSession()
  requireUser()
  requireAdmin()
```

Rules:

```text
Adapters return app-owned types, not raw provider objects where possible.
Raw provider payloads can be stored separately for audit/debugging when needed.
Domain code should not depend on provider-specific object shapes.
```

## Reusable Components

Build shared UI components for common controls and flows.

Component groups:

```text
Base UI:
  Button
  Input
  Select
  Checkbox
  Dialog
  Toast
  Badge
  Tabs
  Card

Forms:
  Field
  FieldError
  FormSection
  SubmitBar

Profile:
  ProfileCard
  PhotoGrid
  ProfileCompletionChecklist
  PublicFieldVisibilityControl

Profile links:
  LinkRow
  LinkLabelEditor
  RevokeLinkButton

Crushes:
  FirstNameVariantsInput
  CrushForm
  CrushResultCard
  CrushConnectPanel

Contact:
  ContactMessageForm
  ContactLimitNotice
  BlockContactButton

Admin:
  ReportTable
  AccountSearch
  AccountStatusBadge
  SuspensionDialog
  AuditTimeline
```

Rules:

```text
Reusable components should be provider-agnostic.
Components should receive data and callbacks, not import provider adapters.
Complex workflows should be orchestrated by app services or route/server actions.
```

## Validation And Normalization

Centralize validation and normalization.

Examples:

```text
normalizeName()
normalizeCity()
normalizeZip()
normalizeFirstNameVariants()
sortFirstNameVariants()
validateProfileCompletion()
validateProfileDescription()
validateCrushTarget()
validateContactMessage()
```

Rules:

```text
Client validation improves UX.
Server validation is authoritative.
Never rely only on client validation for privacy, billing, moderation, or access
control.
```

## Access Control

Access checks should be centralized and explicit.

Examples:

```text
requireSignedInUser()
requireAdmin()
requireActiveProfile()
requireCanSearchCrushes()
requireCanContactProfile()
requireConnectionActive()
requireNotBlocked()
```

Rules:

```text
Every server action/API route that changes or reveals sensitive data must call
the relevant access checks.
Access checks should return clear reasons for upgrade/limit/block UI where safe.
```

## Testing Priorities

Highest-risk logic should get focused tests.

Test first:

```text
profile completion rules
profile description contact-info prohibition
entitlement checks
usage counter windows
crush duplicate prevention
first-name variant normalization/sorting
search eligibility verification
block/contact restrictions
email relay inbound mapping
admin undo/audit behavior
```

## Incremental Schema Strategy

The schema should evolve incrementally, but the core boundaries should remain.

Start with stable concepts:

```text
User
Profile
ProfileLink
Subscription/Plan
UsageCounter
Crush
Connection
Block
Report
AdminAuditLog
ProfileActivity
BillingIdentityChange
```

Avoid over-modeling future profile fields in the first schema. Future profile
fields can be added as configurable/enumerated fields after the MVP shape is
clearer.
