# Crushable Data Model

This document captures the conceptual data model before the first Prisma schema.
It should guide implementation without pretending every column is final.

## Defaults

```text
Database: Postgres
ORM: Prisma
Primary IDs: UUIDs
Timestamps: createdAt and updatedAt on most records
Soft delete: default for users/profiles and other reversible admin actions
Hard delete: only after retention/admin deletion flow is defined
```

## Core Models

### User

Purpose:

```text
Authentication/account identity.
Plan/subscription ownership.
Admin/user role boundary.
```

Key fields:

```text
id
email
role
status
plan
subscriptionStatus
paymentProviderCustomerId
verified/search legal name status
createdAt
updatedAt
deletedAt optional
```

Notes:

```text
Email is required but never public.
Display name belongs to Profile, not User.
Billing/search identity should be separate from public display identity.
```

### Profile

Purpose:

```text
Dating profile and required activation object.
Nothing user-facing can be done without an active/complete profile.
```

Key fields:

```text
id
userId
emailAddress
username
displayName
bio/description
zipCode
ageDecade
sex
publicFieldVisibilitySettings
visibilityStatus
completionStatus
createdAt
updatedAt
deletedAt optional
```

MVP completion defaults:

```text
minimum photos: 3
maximum photos: 9
minimum description length: 80 characters
username: required
display name: required
email address: required, never public
ZIP code: required
age decade: required
sex: required
```

Validation notes:

```text
Descriptions must prohibit social handles, email addresses, phone numbers, and
other direct-contact patterns.
Completion rules should be centralized and configurable.
```

### ProfilePhoto

Purpose:

```text
Profile image storage metadata.
```

Key fields:

```text
id
profileId
storageKey/url
position
status
createdAt
updatedAt
deletedAt optional
```

Notes:

```text
Photo moderation can be added later.
Primary photo can be represented by position 0 or a dedicated flag.
```

### ProfileLink

Purpose:

```text
Disposable public profile URLs.
```

Key fields:

```text
id
profileId
token/randomId
usernamePathSegment
label
status
createdAt
revokedAt
```

Rules:

```text
Each profile can have many active disposable links.
Each link has a required user-facing label.
Each link can be revoked independently.
Maximum active links should be configurable.
Suggested defaults: 5 free, 20 paid.
```

### Plan

Purpose:

```text
Configurable product tier and feature limits.
```

Key fields:

```text
id
name
status
limits/entitlements config
config version/source metadata
createdAt
updatedAt
```

Notes:

```text
Plans should drive entitlements instead of hard-coded paid/free checks.
Plan details, entitlements, and usage limits are system configuration.
System-global plan details should live in versioned config files, using JSON or
YAML.
Per-user plan assignment, subscription state, usage counters, identity state, and
any user-specific overrides must live in the database, not in a config file.
```

### Subscription

Purpose:

```text
Payment-provider subscription state.
```

Key fields:

```text
id
userId
provider
providerCustomerId
providerSubscriptionId
status
planId
currentPeriodStart
currentPeriodEnd
createdAt
updatedAt
canceledAt optional
```

Notes:

```text
Stripe is provisional.
Store provider references and subscription state, not raw card data.
```

### UsageCounter

Purpose:

```text
Track quota-limited actions.
```

Key fields:

```text
id
userId
actionType
period
periodStart
count
limit
createdAt
updatedAt
```

Example action types:

```text
submit_crush
search_crushes
contact_profile
view_crush_detail, reserved but not used for MVP metering
```

MVP entitlement defaults:

```text
Free:
  create active profile
  limited public links
  submit 1 crush/month
  contact 1 user/day
  no crush search
  no crush result details

Paid:
  search crushes allowed
  search quota disabled initially
  all matching crush details visible
  higher or unlimited submissions/contacts/links
```

### BillingIdentity

Purpose:

```text
Lightweight payment/billing identity used for search eligibility.
```

Key fields:

```text
id
userId
provider
providerReferenceId
normalizedFirstName
normalizedLastName
postalCode
postalCodeCheckStatus
verificationStatus
createdAt
updatedAt
lastChangedAt
```

Rules:

```text
Do not store raw card data.
Billing/search identity cannot differ from the name sent to the payment processor.
Billing name and ZIP/postal code changes are limited, initially once per month.
Billing name is lightweight attestation, not full legal identity verification,
unless the provider returns a documented verified-name result.
```

### BillingIdentityChange

Purpose:

```text
Audit changes to billing/search identity.
```

Key fields:

```text
id
userId
previousNormalizedBillingName
previousPostalCode
newNormalizedBillingName
newPostalCode
providerReferenceId
changedAt
```

### Crush

Purpose:

```text
Structured record that a profile owner has a crush on a target person.
The target does not need a Crushable profile.
```

Key fields:

```text
id
submittedByUserId
optionalMatchedTargetUserId
firstNameVariants
normalizedFirstNameVariants
normalizedFirstNameVariantKey
targetFullLastName
normalizedTargetFullLastName
targetCity
normalizedTargetCity
ageDecade
targetSex
hairColor optional
eyeColor optional
controlledContext optional
status
createdAt
updatedAt
deletedAt optional
```

Rules:

```text
First-name variants max 5 initially.
First-name variants are normalized and sorted on the backend.
Full last name is required.
City is required.
Age decade is required.
Sex is required and part of uniqueness.
Hair color, eye color, and controlled context are optional.
No freeform note in MVP.
```

Duplicate prevention:

```text
Scope: submittedByUserId + apparent target identity.

Same submitter cannot create duplicate active crushes with:
  overlapping normalized first-name variants
  same normalized full last name
  same normalized city
  same age decade
  same target sex

Different users can submit crushes for the same apparent target.
```

Implementation note:

```text
Because first-name variants use overlap logic, duplicate prevention may require
application-level checks or a helper table rather than only a simple unique index.
```

### Connection

Purpose:

```text
Established contact relationship that permits anonymized email relay.
```

Key fields:

```text
id
participantUserIds
sourceType
sourceId
status
relayAddress
providerThreadReferenceId
createdAt
updatedAt
closedAt optional
closedByUserId optional
```

Source types:

```text
public_profile_contact
crush_match
other_match
```

Status values:

```text
active
blocked
closed
admin_disabled
```

Rules:

```text
Email routing is permitted only for active Connection records.
Inbound replies must not forward if the Connection is missing, blocked, closed,
or admin-disabled.
```

### ContactAttempt

Purpose:

```text
Initial contact attempt or crush-connect event before/around connection creation.
```

Key fields:

```text
id
senderUserId
recipientUserId
sourceType
sourceId
status
messageMetadata
createdAt
updatedAt
```

Notes:

```text
Avoid storing full message bodies if technically and legally feasible.
Store enough metadata for rate limits, abuse handling, delivery status, and
activity records.
```

### EmailRelayEvent

Purpose:

```text
Inbound/outbound email relay metadata.
```

Key fields:

```text
id
connectionId
provider
providerMessageId
direction
eventType
deliveryStatus
metadata
createdAt
```

Rules:

```text
Postmark is provisional.
Reply-To can use relay addresses such as someaddress@crushable.me.
Inbound provider webhooks must map replies to active Connection records.
```

### Block

Purpose:

```text
Per-user blocking.
```

Key fields:

```text
id
blockerUserId
blockedUserId
reasonCategory optional
createdAt
```

Rules:

```text
Blocks should prevent contact and email relay forwarding between the users.
```

### Report

Purpose:

```text
Profile reporting for MVP moderation.
```

Key fields:

```text
id
reporterUserId
reportedProfileId
category
details optional
status
createdAt
updatedAt
reviewedByAdminUserId optional
reviewedAt optional
```

MVP:

```text
Report a profile.
Admin can view reports.
```

### Suspension

Purpose:

```text
Timed account suspension.
```

Key fields:

```text
id
userId
createdByAdminUserId
reason
startsAt
endsAt
status
createdAt
updatedAt
reversedAt optional
reversedByAdminUserId optional
```

Rules:

```text
Admins can suspend any account for a specified duration.
Suspensions should be auditable and undoable where feasible.
```

### AdminAuditLog

Purpose:

```text
Audit admin actions and support undo.
```

Key fields:

```text
id
adminUserId
targetUserId optional
targetEntityType
targetEntityId
actionType
actionReason
previousState
newState
undoStatus
createdAt
undoneAt optional
undoneByAdminUserId optional
```

Rules:

```text
Admin actions should be auditable.
Undo should be available for reversible actions.
Deletion should start as reversible soft delete/deactivation with a retention
window before hard purge.
```

### ProfileActivity

Purpose:

```text
Per-profile activity timeline for user-facing status, support, and moderation.
```

Key fields:

```text
id
profileId
actorUserId optional
activityType
relatedEntityType optional
relatedEntityId optional
metadata
createdAt
```

Activity types:

```text
contact_sent
contact_received
crush_submitted
crush_matched
profile_link_created
profile_link_revoked
profile_reported
user_blocked
admin_action
```

## Open Data Model Questions

```text
Whether Profile.emailAddress should duplicate User.email or reference it through User.
Exact representation of participantUserIds on Connection; join table may be cleaner.
Whether first-name variants need a separate CrushFirstNameVariant table.
How much email relay metadata can be stored without becoming message storage.
Exact retention period for soft-deleted accounts.
Exact report categories.
Exact plan/limit config representation for admin-editable plan settings.
```
