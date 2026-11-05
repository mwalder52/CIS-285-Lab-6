# Proposed SplitSmart Interface Boundaries

**Status**: Conceptual contracts only; no URLs, wire schema, or provider has
been approved. This document does not define finalized API endpoints.

## Contract conventions

- All commands operate for an authenticated account context; caller identity
  is obtained from the authentication boundary, not trusted from a
  caller-supplied user ID.
- Group-scoped operations re-check current membership and role in the
  application layer.
- Amounts are decimal values with explicit currency code and group precision.
  No binary floating-point representation is permitted.
- Dates are calendar dates and cannot be after today for expenses/payments.
- A rejected command returns a stable error category and no partial financial
  mutation. Presentation-specific wording and transport status codes remain
  undecided.

## Application commands

| Boundary | Conceptual request | Successful result | Important rejection cases |
|---|---|---|---|
| Account registration | Email, password | Pending account and verification handoff | Invalid email/password policy, duplicate identity, rate limit |
| Account verification | Single-use verification token | Activated account | Expired/used token |
| Sign-in/reset | Email/password or reset token/new password | Authenticated context or reset confirmation | Invalid credentials, expired token; avoid account enumeration |
| Group creation | Name, initial currency/policy selections if configured | Group ID and owner membership | Missing required configuration |
| Membership management | Group, account, role/action | Updated membership/role | Non-owner/manager, removing owner, already inactive/not found |
| Expense submission | Group, payer, amount/currency, date, description, split method/percentages, participant IDs, optional receipt reference | Pending expense ID, allocated share snapshot, notification event | Nonmember payer/participant, zero participants, invalid amount/date/percentage, allocation failure |
| Approval decision | Subject ID, level, approve/reject, optional reason | Updated pending/final status | Self-approval, unauthorized level, repeat/late decision, stale state |
| Balance query | Group and optional pair/filter | Authorized pairwise net balances and as-of marker | Nonmember access |
| Payment recording | Group, debtor, creditor, positive amount, date, submission identity | Immutable payment ID and journal posting | Overpayment, invalid date/amount, unauthorized group |
| Correction submission | Original record ID, correction kind, amount/reason | Pending correction ID | Not owner/manager, unknown original, exceeded unreversed amount |
| Report request | Group, inclusive start/end dates, supported filters | Authorized summary/records | Start after end, unsupported filter, unauthorized record |

## Notification and receipt boundaries

- Expense submission produces a notification event for every current group
  member other than the submitter at submission time.
- Before dispatching expense details, recheck current membership and suppress
  detail-bearing delivery to a recipient who has since been removed.
- Notification delivery accepts an opaque event/recipient reference and
  delivery channel. Provider, payload schema, retry count, and channel remain
  unselected.
- Detail retrieval follows a notification reference through an authorization
  check; a removed member cannot retrieve old group details.
- Receipt upload returns a private reference only after validation and
  successful storage. Receipt retrieval always rechecks membership. Allowed
  media types, size limits, scanning, retention and storage are open decisions.

## Error behavior

The application boundary distinguishes:

- validation failure (no state change);
- authorization denial (no protected details returned);
- conflict/stale decision (no duplicate approval or financial posting);
- unavailable dependent integration (clear failure or retriable delivery
  state, not success-shaped fallback);
- persistence/transaction failure (no partial finalized financial state).

## Deferred contract choices

HTTP/REST, RPC, desktop inter-process calls, request/response serialization,
versioning, pagination, session mechanism, CSRF/CORS policy, API endpoint
names, provider protocols, and event transport are not selected here. The
platform decision (D-01) and service deployment must precede those contracts.
