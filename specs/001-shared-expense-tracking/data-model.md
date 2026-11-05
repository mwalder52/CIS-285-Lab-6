# SplitSmart Conceptual Data Model

**Status**: Conceptual; no database or physical schema selected
**Scope**: Full product. Swing MVP uses only its documented subset.

## Model rules

- Identifiers are stable and unique within the full product; the stable
  participant account identifier is the allocation remainder tie-breaker.
- Monetary amount, share, payment, and journal values use `BigDecimal`.
  Currency code and allowed scale are group-level configuration candidates;
  the supported currency/scale table remains open.
- Financial records are immutable after finalization. Corrections append
  separately reviewed compensating records.
- Authorization depends on active membership and role at the time of the
  operation; removal does not erase financial history.

## Entities

| Entity | Important attributes | Relationships and constraints |
|---|---|---|
| **UserAccount** | Stable account ID; verified email; credential hash; status; created time | Owns memberships and submits actions. Email uniqueness and account retention policy require definition. FR-001, AC-001. |
| **Group** | Group ID; name; owner account ID; currency code; configured precision; status; approval policy reference | Owner is a member with owner role; has memberships, expenses, approvals, and journal entries. One currency per group is the current assumption. FR-002–FR-009. |
| **Membership** | Group ID; account ID; role (`OWNER`, `MANAGER`, `MEMBER`); status; start/end time | Many-to-many Group/UserAccount. At most one active membership per account/group. Only owner/manager adds or removes members. Removal revokes current and historical group-only access for that account, while records remain for current members. FR-002, NFR-006. |
| **Expense** | Expense ID; group ID; submitter ID; payer ID; amount; currency; expense date; description; allocation method; status (`PENDING`, `APPROVED`, `REJECTED`); submitted/finalized times; approval-policy version reference *(proposed)* | Payer is separate from submitter and participants; payer must be a current member at submission. Positive amount at currency precision; date is a calendar date no later than today. Has allocations, approval decisions, receipt references, journal entries. A policy-version reference is a proposal to preserve the review policy for pending expenses; policy-change behavior remains an open rule. FR-003, FR-006. |
| **ExpenseAllocation** | Expense ID; participant ID; percentage (for percentage split); allocated amount; allocation order/key | One row per distinct current member participant; at least one participant. Percentages are nonnegative and total exactly 100% when used. Amount shares use largest remainder with stable account ID tie-break and sum exactly to expense amount. Payer's own share creates no amount owed to payer. FR-004, FR-005. |
| **ReceiptReference** | Receipt ID; expense ID; private object key/reference; media type; byte size; content digest; upload time | Optional one or more references; exact cardinality, size, type and retention rules remain open. Retrieval rechecks authorization. FR-003, NFR-006. |
| **ApprovalPolicy** | Policy ID; group ID; ordered levels; reviewer eligibility rules; active/effective version | Owned/configured by group owner. Single or multiple levels. Policy-change behavior for already pending expenses needs a design rule before implementation. FR-006. |
| **ApprovalDecision** | Decision ID; expense/correction ID; level; reviewer ID; decision; timestamp; comment/reference | Reviewer must be eligible at that level and cannot be the submitter. At most one decision per reviewer/level/subject. Any rejection finalizes rejected; approval requires every required level. FR-006. |
| **Notification** | Notification ID; event/source ID; recipient account ID; group ID; created/delivery times; delivery state; minimal safe summary | Recipient set is current group members other than submitter at submission. Before dispatch and detail retrieval, recheck current membership; suppress expense details for removed members. Delivery channel is open. FR-007. |
| **JournalEntry** | Entry ID; group ID; source type/ID; entry kind; debtor ID; creditor ID; positive amount; currency; creation time; optional reversed-entry reference | Append-only. Expense shares add debtor-to-payer obligations except payer's own share. Payment entries offset the owed direction. Corrections append compensating entries. Unique posting key prevents the same approval/payment from posting twice. FR-008, FR-009, AC-008–AC-009a. |
| **BalanceProjection** *(optional derived view)* | Group ID; account pair; signed net amount; as-of journal sequence | Rebuildable from JournalEntry and never authoritative. Pairs are netted consistently to show one debtor/creditor direction. FR-008, NFR-002. |
| **Payment** | Payment ID; group ID; payer/debtor ID; payee/creditor ID; amount; date; status; recorded time | Date no later than today; amount positive and no greater than current amount owed. Each accepted submission is one record; matching details alone are not duplicate detection. Immutable; references journal posting. FR-009. |
| **Correction** | Correction ID; original expense/payment ID; submitter ID; correction kind; amount/reason; status; submitted/finalized times | Only group owner/manager submits; goes through configured review. Payment reversal cannot exceed original unreversed amount. Original is unchanged; approval posts compensating journal entries. FR-009, AC-009a. |
| **ReportRequest/ReportResult** *(query concepts)* | Requester ID; group; inclusive start/end dates; supported filters; generated time; result summary | Not necessarily persisted. Start ≤ end; result limited to records requester may access at query time. Additional filters/export formats remain open. FR-010, FR-011. |
| **OutboxMessage** *(infrastructure concept)* | Message ID; source event; recipient; minimal payload/reference; state; attempts; next attempt | Stored atomically with source change if an outbox is selected. Duplicate delivery tolerated; authorization rechecked on detail access. Not a customer-facing requirement by itself. FR-007, NFR-004. |

## Lifecycle and cardinality

- A group has one owner and zero or more active managers/members. The owner
  cannot be removed while the group exists.
- An expense has one payer, one submitter, one or more distinct participants,
  and zero or more receipts. Payer may or may not be a participant.
- Expense lifecycle: `PENDING` → `APPROVED` after every required level
  approves, or `PENDING` → `REJECTED` when any required reviewer rejects.
  Final states do not accept new approval decisions. Corrections are new
  records, not transitions back to editable state.
- A payment is recorded once and remains immutable. A correction/reversal
  requires authorization and review; approved correction entries reference
  and compensate the original, within its unreversed amount.
- Journal entries are append-only and link to their originating expense,
  payment, or correction. A finalized financial source has one posting key.

## Persistence considerations (proposal only)

The conceptual model requires transactional persistence for concurrent
approvals, payments, journal posting, and notification handoff. No SQL vendor,
document store, file layout, schema, ORM, or hosting environment is selected.
A relational transactional store is a plausible option because the model
contains constrained references and atomic multi-record workflows, but it
requires stakeholder and technical evaluation before adoption. Never make a
mutable balance table the only source of financial truth.

## Validation invariants

1. Expense and payment amounts are positive and within configured currency
   precision; dates are not in the future.
2. Payer and participants are active group members at expense submission;
   participants are nonempty and distinct.
3. Percentage shares are nonnegative and sum exactly to 100%; all generated
   allocations sum exactly to the expense total using largest remainder and
   stable-ID tie-break.
4. No balance posting exists for a pending/rejected expense. An approved
   expense posts exactly once after all approvals.
5. Reviewer is authorized for the current level and is not the submitter;
   duplicate/late decisions do not alter status or journal.
6. Payment does not exceed the current pairwise debt. Similar payment fields
   do not suppress a separately accepted payment.
7. Correction references an original financial record, is approved before
   posting, and does not exceed the original payment's unreversed amount.
8. A report query enforces current access authorization and inclusive valid
   date boundaries.
