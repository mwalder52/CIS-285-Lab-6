# SplitSmart Detailed Design

**Status**: Proposed; no platform or persistence decision is approved
**Scope**: Full customer product plus separately identified Swing MVP
**Traceability**: Requirement IDs refer to [spec.md](./spec.md).

## 1. Design principles

- UI components collect and display data; use cases authorize and coordinate;
  domain objects own business invariants; infrastructure implements persistence
  and delivery ports. Domain calculations do not depend on Swing or web UI
  types (Constitution II; FR-001–FR-011).
- Use Java 21 and `BigDecimal` for monetary domain behavior. No money enters
  through `float` or `double`. Use a declared group currency scale; reject
  unsupported precision rather than silently round user-entered expense
  amounts (Constitution III; FR-003, FR-005, FR-009, NFR-002).
- Preserve finalized financial records. Add approved compensating postings for
  corrections; do not edit/delete original payments or approved expenses
  (FR-009, AC-009a).
- Recheck authorization at each application boundary and when retrieving
  notification-linked details, not only in the presentation (FR-002,
  FR-007, FR-011, NFR-006).
- Use simple in-process modules unless deployment or scale evidence justifies
  additional services. Database, queue, web/mobile frameworks, and providers
  remain proposals.

## 2. Logical modules and dependency direction

| Module boundary | Responsibilities | Dependencies / trace |
|---|---|---|
| Presentation adapter | Browser pages, Swing panels, or later mobile screens; input formatting and view state only | Calls application use cases; no domain calculation. FR-001–FR-011; Constitution II. |
| Account and access use cases | Registration, email verification, sign-in, reset, authorization context | Account repository and email port; FR-001, NFR-006. |
| Group use cases | Group creation, owner/manager changes, membership add/remove | Group/membership repository; FR-002. |
| Expense use cases | Validate command, snapshot payer/participants/split, submit for review | Domain allocation and expense policy; FR-003–FR-006. |
| Approval use cases | Validate reviewer and level; accept one decision; finalize or reject | Approval policy, transaction and journal ports; FR-006, FR-008. |
| Ledger and payment use cases | Append expense/payment/correction journal entries; query pairwise balance | Journal, payment, transaction ports; FR-008, FR-009. |
| Report/query use cases | Authorized summary and inclusive date-range queries | Journal and record repositories; FR-010, FR-011. |
| Notification adapter | Persist and dispatch authorized new-expense notices | Outbox and notification channel port; FR-007, NFR-004. |
| Receipt adapter | Store and retrieve receipt bytes privately | Receipt storage port and authorization use case; FR-003, NFR-006. |

Domain objects and use-case interfaces do not depend on delivery adapters.
Infrastructure adapters can be replaced without changing allocation or
approval rules. This layered boundary is logical; it does not prescribe
microservices or multiple deployment tiers.

## 3. Decision record

| ID | Decision / status | Rationale and trace |
|---|---|---|
| D-01 | **Awaiting stakeholder approval**: choose web-first versus Swing-first and clarify whether Android/iOS are required. | Customer source says primary web; Constitution names Swing; course handout additionally mentions mobile. See platform comparison in [architecture.md](./architecture.md). NFR-001. |
| D-02 | **Source-constrained**: Java 21, Maven, Swing where MVP is selected, JUnit 5, PlantUML, object-oriented separation, `BigDecimal`, human review. | Constitution. These constraints do not resolve which full-product client is delivered. |
| D-03 | **Proposed**: presentational adapters call a shared application/domain boundary. | Avoids duplicating financial behavior across clients and keeps GUI rules separate. FR-001–FR-011; Constitution II. |
| D-04 | **Proposed**: append-only journal is financial source of truth; pairwise balance is derived/rebuildable. | Supports auditability, correction history, reconciliation, and exact-once posting. FR-008–FR-009, SC-003–SC-004. |
| D-05 | **Proposed**: approval finalization and journal posting share one transaction with a source-specific uniqueness guard. | Prevents partial finalization and double posting under retries/concurrency. FR-006, SC-003. Storage-specific guarantee awaits database choice. |
| D-06 | **Proposed**: use a transactional outbox or equivalent durable handoff for notification work. | Avoids inconsistent expense/notification dual writes and tolerates retries. FR-007, NFR-004. Delivery provider remains unselected. |
| D-07 | **Source-constrained**: percentage allocation uses largest fractional remainder; equal remainders use ascending stable account ID. | Confirmed clarification in spec. Currency and scale mapping still open. FR-005, AC-005, NFR-002. |
| D-08 | **Awaiting stakeholder approval**: select supported currencies and precision. | The spec leaves currency set/scale open; it affects validation, serialization, and every money test. FR-003, FR-005, FR-009. |
| D-09 | **Awaiting stakeholder approval**: choose notification channel(s), receipt storage, and email delivery integration. | These are external integrations not specified by source docs. FR-001, FR-003, FR-007, NFR-004, NFR-006. |
| D-10 | **Proposed**: do not infer database, web/mobile framework, hosting, or identity vendor. | No source requires a provider; this avoids converting design proposals into facts. |

## 4. Core use-case flows

### 4.1 Account registration, sign-in, and reset

1. Presentation submits email and password over the selected protected
   transport.
2. Application validates fields, creates a pending account with a salted
   adaptive password hash from a vetted implementation, and asks the email
   port to send a verification link/token.
3. Verification token is short-lived, single-use, and bound to the account;
   successful verification activates the account.
4. Sign-in verifies the password and creates an authenticated session or
   equivalent access context. The mechanism/session lifetime is not selected.
5. Password reset uses a single-use token sent to the already verified email.
   Never reveal whether an unverified/unknown email exists in a way that
   enables account enumeration.

Email delivery and token lifetime/retention are proposals requiring security
review and provider choice (FR-001, AC-001, NFR-006).

### 4.2 Group creation and membership

1. Authenticated account requests group creation.
2. Application creates Group and owner Membership atomically.
3. Owner grants/revokes manager role. Owner/manager adds or removes members;
   owner cannot be removed.
4. Removal marks membership inactive and immediately changes authorization
   for current and historical group-only data. It does not erase the group's
   journal or obligations visible to remaining members (FR-002, AC-002).

The invitation/acceptance protocol is not defined; adding an account is not
silently treated as accepting an invitation.

### 4.3 Expense submission and allocation

1. Authenticated submitter selects a group, payer, one or more participants,
   amount, calendar date, description, split method, and optional receipt.
2. Application confirms submitter can submit and payer/participants are
   current group members; amount is positive and has configured currency
   precision; date is no later than today.
3. Domain allocation validates percentages (nonnegative, total exactly 100%)
   or creates equal weights. It computes exact decimal shares at the group
   currency scale. For each share, retain the exact fractional remainder
   before quantization; assign leftover minor units by descending remainder,
   then ascending stable participant account ID. Result must equal total.
4. Store the submitted expense and immutable allocation snapshot as PENDING.
   Save the receipt reference privately if present. Create notification work
   for all current group members other than the submitter.
5. No journal entry is posted until approval. A payer who is also a participant
   is not owed their own share.

### 4.4 Review, approval, rejection, and posting

1. Reviewer acts on a pending subject and approval level.
2. Application confirms reviewer is an eligible current reviewer, is not the
   submitter, has not already decided at this level, and the subject remains
   pending.
3. Rejecting at any required level finalizes rejection and posts no balance.
   Approving a level records the decision; remain pending until all configured
   levels approve.
4. On final approval, one transaction conditionally finalizes the subject and
   appends all journal entries under a unique `(source ID, posting kind)`
   constraint. If the state is no longer pending or a posting already exists,
   return a conflict and make no new entries.
5. The same finalization rules apply to approved corrections. There is no
   in-place edit to an approved record.

The database-specific lock/constraint/transaction mode must be proven after
the storage choice; the behavior, not a particular locking technology, is
the design requirement (FR-006, FR-008, SC-003).

### 4.5 Notification delivery

1. Expense submission records the event and recipient list from current group
   membership, excluding the submitter.
2. A background dispatcher claims eligible work and calls the selected
   channel adapter. Retry state is recorded; duplicate delivery is possible.
3. A notification contains a safe summary or opaque reference. Fetching full
   details performs fresh group-membership authorization; removal prevents
   access even from an old link. Before dispatching expense details, suppress
   delivery to a recipient who is no longer a current member.
4. Metrics track created, attempted, delivered, delayed, and failed notices
   without logging sensitive payloads.

Recipient and privacy behavior are specified; in-app/email/push channel,
service, retry limits, and degradation messaging remain open (FR-007,
NFR-004, NFR-006).

### 4.6 Balance and payment

1. Balance query authorizes current group membership, reads or computes journal
   net between each account pair, and displays one net debtor/creditor
   direction.
2. Payment command checks positive amount, current date, payer/payee
   authorization, and amount not exceeding current debt.
3. In one transaction, store one immutable Payment and its offsetting journal
   entry. A distinct accepted submission is not deduplicated merely because
   payer/payee/amount/date match an earlier payment.
4. A transport retry may use a separate request/idempotency token to avoid
   duplicating the same submission; this token must not conflate distinct
   user-confirmed payments. Exact token policy is a proposal to validate.
5. Correction command is owner/manager-only, references original and is
   approved through the configured review process. An approved reversal
   cannot exceed the original payment's unreversed amount; it appends a
   compensating journal entry and preserves the original.

### 4.7 Reports and summaries

Every query checks requester access. Start/end boundaries are inclusive, and
start must be on or before end. Summary totals must reconcile with the source
records. The report criteria beyond date range and any export format are open
questions (FR-010, FR-011, AC-010–AC-011).

## 5. Monetary representation

- Store and calculate money as `BigDecimal`; construct from decimal strings
  or exact minor-unit integers, never binary floating point.
- Keep monetary amount, currency code, and currency precision together.
  Group currency is one currency under the current assumption; supported
  currency scales remain to be approved.
- Reject expense amounts with excess precision; do not silently normalize.
- Percentage weights are exact nonnegative decimal percentages summing to
  exactly 100. Equal split uses equal exact weights.
- For positive allocations, first round each exact raw share down to the
  currency scale (truncate fractional minor units), then rank those discarded
  fractional minor-unit remainders descending; ties use stable participant
  account ID ascending. Distribute the remaining minor units in that order.
  A final invariant checks allocated sum equals expense total. This is the
  largest-remainder procedure required by the clarified spec, not a choice of
  currency scale or a provider rounding convention.
- Settlement and reversal arithmetic also uses exact decimal values at the
  group scale. Explicitly reject overpayment and over-reversal.
- Ensure input/output comparison uses numeric decimal semantics consistently;
  a different scale representation must not produce an incorrect financial
  mismatch.

## 6. Validation and failure handling

| Failure | Result |
|---|---|
| Invalid amount, percentage total, participant, payer, or date | Reject command with field-level validation result; no record or ledger mutation |
| Unauthorized actor, removed member, or nonmember notification access | Deny; return no protected record details |
| Self-approval, unauthorized level, duplicate or late decision | Reject decision; status and journal unchanged |
| Concurrent final approvals | One conditional transaction posts; other receives conflict/no-op, never a second posting |
| Payment exceeds current debt | Reject with current permitted amount if safe to disclose; history and ledger unchanged |
| Duplicate transport retry | Use an explicit request identity if implemented; never deduplicate solely from matching payment business fields |
| Outbox/provider unavailable | Preserve committed expense and retry delivery; expose delivery state/operational alert without leaking payload |
| Persistence/transaction failure | Report failure; no partial finalized status or partial journal commit |
| Report invalid range | Reject request; do not return misleading partial data |
| Receipt store failure | Do not claim attachment succeeded; either reject the full command or save expense without receipt only after explicit user confirmation |

Error codes/protocol representations belong to the selected client contract;
they are not finalized endpoints.

## 7. Transaction and concurrency design

Required atomic units:

- Group creation with owner membership.
- Expense submission with immutable allocation snapshot and notification
  outbox work.
- Final approval with status transition and all expense journal entries.
- Payment recording with payment record and offset journal entry.
- Approved correction with correction status and compensating journal.

Use a conditional transition from PENDING and a source-specific unique posting
key, backed by equivalent transactional guarantees in the eventual storage.
Payment debt checks and posting must serialize or revalidate against a
consistent current journal state, so concurrent partial payments cannot both
spend the same outstanding amount. The exact isolation/locking mechanism is
database-specific and unselected. Do not rely on UI button state for
concurrency safety.

## 8. Authorization rules

| Operation | Authorization |
|---|---|
| Read personal account data | Authenticated account owner |
| Read group history, balances, reports, receipt | Current group member with operation-level access |
| Create group | Authenticated account; becomes owner |
| Grant/revoke manager; add/remove member | Group owner or manager; owner cannot be removed |
| Submit expense | Authorized current group member; payer and all participants are current members |
| Decide approval | Configured reviewer at that level; submitter cannot decide own expense |
| Submit financial correction | Group owner or manager; correction itself goes through configured review |
| Receive expense notice | Current members except submitter at creation; details always reauthorized on access |
| Report/export | Authenticated requester with access to every included record |

## 9. Testing strategy

The repository currently has no `pom.xml`, application source, or test source.
When implementation is approved:

- **JUnit 5 unit tests**: exact allocation including 0.01 split, largest
  remainder ties by stable ID, participant/payer cases, currency precision,
  status transitions, authorization decisions, pairwise netting, and reversal
  bounds.
- **JUnit 5 application/integration tests**: transaction rollback, all-level
  approval, self-review rejection, duplicate/late decision, exactly-once
  posting under repeated/concurrent calls, concurrent payment race, correction
  audit trail, outbox retry, and removed-member access.
- **Contract tests**: presentation adapters and external identity,
  notification, and receipt ports once the interfaces/providers are selected.
- **Swing UI tests**: verify UI invokes use cases and remains responsive;
  separate headless-compatible domain tests from display-dependent tests.
- **Web/mobile UI tests**: platform-specific test tooling remains unselected;
  validate user scenarios and access behavior on supported clients.
- **Performance**: load-test balance/report queries at 100 concurrent active
  users and measure p95 against NFR-003 for 15 minutes.
- **Notification service objective**: measure delivery availability within
  60 seconds under normal operation against NFR-004.
- **Usability**: test at least 10 representative people; at least 9 complete
  the expense-to-balance task without assistance (NFR-005).
- **Traceability**: attach each test/result to FR/NFR/AC/SC as listed in
  [traceability-matrix.md](./traceability-matrix.md).

No tests or system performance have been run; these are planned verification
approaches, not achieved results.
