# SplitSmart Conceptual Data Model

**Status:** Proposed conceptual model; no physical schema or database selected  
**Authority:** [Feature specification](../spec.md), especially FR-001–FR-011 and the key entities; money rules are constrained by [Constitution](../../../.specify/memory/constitution.md), Principle III.

This model describes logical records, not SQL tables or database scripts. Keys below are stable identifiers (proposal). Every amount is `BigDecimal` with explicit currency/scale; no binary floating-point representation is permitted. Initially each group has one currency, subject to confirmation.

## 1. Entities

| Entity | Key and important attributes | Lifecycle / invariants | Trace |
|---|---|---|---|
| **UserAccount** | `accountId`; verified email identity reference; account status; created timestamp | Unique identity; sign-in/reset require verified email. Do not store plaintext password. Identity provider and credential storage are unselected. | FR-001, AC-001 |
| **Group** | `groupId`; name; owner account ID; currency code and scale; status | Creator is owner; one currency assumption; cannot remove owner while group exists. Currency semantics need confirmation. | FR-002, FR-003 |
| **Membership** | `membershipId`; group ID; account ID; role; status; joined/removed timestamps | Active/inactive lifecycle; one active membership per account/group. Removal prevents subsequent access but does not erase historical financial references. | FR-002, NFR-006 |
| **ApprovalPolicy** | `policyId`; group ID; version; ordered levels; reviewer assignments; effective metadata | Owner configures reviewers/levels. Expense captures the policy version used at submission; pending-policy-change behavior is proposed/open. | FR-006 |
| **Expense** | `expenseId`; group ID; submitter ID; payer ID; amount; currency; calendar date; description; split method/input; receipt reference; policy version; status; timestamps | `PENDING → APPROVED` only after all required levels approve, or `PENDING → REJECTED` on rejection. Finalized record is immutable. Payer is separate from participants and must be current member on submission. | FR-003, FR-006 |
| **Allocation** | `allocationId`; expense ID; participant account ID; share amount; currency scale; optional exact percentage input | One per participant; no duplicates; at least one; participants current members at submission. Shares sum exactly to expense amount. | FR-004–FR-005 |
| **ApprovalDecision** | `decisionId`; expense/correction ID; level; reviewer ID; decision; timestamp; rationale metadata if policy permits | At most one decision per reviewer and level; immutable; reviewer eligible, not submitter; decisions on finalized item rejected. | FR-006 |
| **Notification** | `notificationId`; expense ID; recipient account ID; created/delivery status/timestamp | Recipient set is current members other than submitter at submission. Detail retrieval always rechecks current access; delivery may retry idempotently. | FR-007 |
| **FinancialPosting** | `postingId`; group ID; source type/ID; posting kind; debtor ID; creditor ID; amount; currency; created timestamp | Immutable, append-only, unique per source/kind; only approved source creates postings. Source record remains authoritative and postings are reconcilable projections of its financial effect. | FR-006, FR-008–FR-009 |
| **Payment** | `paymentId`; group ID; payer/debtor ID; payee/creditor ID; amount; currency; calendar date; recorder ID; timestamp | Accepted submission creates one payment. Same payer/payee/amount/date may recur. Immutable; cannot exceed current amount owed at atomic record time. | FR-009 |
| **Correction** | `correctionId`; group ID; original expense/payment ID; correction type; amount/effect; requester ID; reason; status; policy version | Owner/manager submits. Reviewed under configured process. Original remains unchanged. Pending/rejected correction has no posting. Reversal cannot exceed original payment's unreversed amount. Expense adjustment references approved expense. | FR-009 |
| **Balance (derived)** | Pair `(groupId, debtorId, creditorId, currency)`; net amount; optional as-of/version metadata | Computed from approved expense postings, payment postings, and approved compensating postings. Any stored value is rebuildable and never sole source of truth. | FR-008, AC-008, SC-004 |
| **ReportRequest / ReportResult (transient)** | Requesting account; authorized scope; inclusive date range; supported filters; generated timestamp | Authorization rechecked on each request; start <= end; result limited to currently authorized records. Persisting report output is not required by source. | FR-010–FR-011 |

## 2. Relationships and cardinalities

- UserAccount 1 — 0..* Membership; Group 1 — 1..* Membership. Active membership is unique per user/group.
- Group 1 — 1 owner UserAccount and 0..* Expenses, Payments, and ApprovalPolicies.
- Expense 1 — 1 payer UserAccount; Expense 1 — 1..* Allocations; each Allocation references 1 participant UserAccount. The payer may or may not be among participants.
- Expense 1 — 1..* required review levels according to the policy snapshot; each level has configured reviewer(s) and 0..* decisions; each decision references one reviewer and one level.
- Expense 1 — 0..* Notifications, one per eligible recipient and expense event.
- Approved Expense 1 — 1..* FinancialPostings as needed; pending/rejected Expense — 0 postings.
- Payment 1 — 1 payer and 1 payee; an approved reversal Correction references exactly 1 original Payment. A payment may have 0..* reversals whose total does not exceed unreversed original amount.
- Expense correction references exactly 1 approved Expense and creates separately approved compensating posting(s).
- A Balance is derived for a debtor/creditor pair from all applicable postings; no direct mutable relationship is authoritative.
- Report results reference only records in the authorized user's current scope.

## 3. Status and financial lifecycle

```text
Expense: PENDING -> APPROVED (all required levels approve)
                   -> REJECTED (any required reviewer rejects)
Expense correction: PENDING -> APPROVED / REJECTED
Payment correction: PENDING -> APPROVED / REJECTED
Membership: ACTIVE -> REMOVED (history retained, access revoked)
Notification: QUEUED -> AVAILABLE / FAILED-RETRYABLE (transport is proposal)
```

Only a final approval creates a financial effect. Approval decision, final status, and unique financial posting(s) must be atomic. Repeated or late transitions cannot add another posting. Rejected/pending expenses and corrections do not alter balances (FR-006, FR-009; AC-006, AC-009a; SC-003).

## 4. Financial semantics

For each approved expense, create a debtor-to-payer claim for each participant other than the payer, for that participant's exact allocated share. Do not create a claim for the payer's own share. Net reciprocal obligations for display; preserve original posting lineage for audit.

For a payment from debtor to creditor, subtract the accepted payment from that pair's outstanding amount. Reject an overpayment without writing either a Payment or posting. A separately reviewed reversal restores its approved amount; a reversal cannot exceed the payment's remaining unreversed value. An expense correction is a new compensating record, never an update to its source.

## 5. Data constraints and privacy

- Account IDs used as allocation tie-break keys are stable, canonical, and compared by documented ascending order.
- Expense/payment dates are calendar dates not later than the current date. Report range endpoints are inclusive.
- Uniqueness constraints must prevent duplicate decisions per reviewer/level and duplicate source financial posting. They must **not** deduplicate payments by matching business fields.
- A removed member's account remains referenced for audit and obligation history, but authorization must block all subsequent access to group-only historical records. Remaining authorized members retain the group history and obligations.
- Notification records and receipt references are not authorization tokens. Re-fetch data only after current membership checks.
- Audit metadata should identify actor, timestamps, policy version, source/correction relationships; precise retention and privacy policy remain open.

## 6. Conceptual versus physical persistence

No database product or physical schema is mandated by the inspected sources. A transactional persistence adapter with atomic state transitions, uniqueness for decisions/postings, and durable immutable history is a **proposal**, not a selected database. Evaluate storage technology only after platform/deployment direction is approved. A derived balance projection can be added for performance only if it can be rebuilt and reconciled from immutable source records (NFR-003; SC-004).
