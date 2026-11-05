# Logical data model

**Status:** Conceptual proposal; no schema/database selected. Identifiers and terminology are shared with diagrams and requirements.

| Concept | Key data / relationships | Constraints and authority |
|---|---|---|
| UserAccount | accountId, verifiedEmail, credentialHash, status | Owns memberships; personal data private. Email uniqueness and retention open. |
| Group | groupId, ownerId, name, currency policy, active ApprovalPolicyVersion | Owner is current member; one-currency-per-group is a draft assumption only. |
| Membership | groupId, accountId, role, status, start/end | At most one active membership per pair. Historical row retained; removal revokes access. |
| Expense | expenseId, groupId, submitterId, payerId, total, currency, date, description, splitMethod, status, policyVersionId | Immutable after finalization. Payer distinct from participant role; current membership required at submission. |
| ExpenseAllocation | expenseId, participantId, percentage?, amount | One per distinct participant. Exact total; largest-remainder deterministic tie-break. |
| ReceiptReference | receiptId, expenseId, privateObjectRef, mediaType, size, digest | Optional. Every retrieval reauthorizes. Count/size/type/retention unresolved. |
| ApprovalPolicyVersion / ApprovalLevel | policyId, version, effective time; ordered level and eligible reviewers | Preserve versions; pending-expense policy-change behavior is unresolved. |
| ApprovalDecision | subjectId, level, reviewerId, outcome, time | Unique subject/reviewer/level; submitter ineligible. Subject may be expense or correction. |
| Payment | paymentId, groupId, payerId, payeeId, amount, currency, date, createdAt | Immutable; each accepted request creates one. Similar fields are not dedup key. |
| Correction | correctionId, originalExpenseId XOR originalPaymentId, submitterId, kind, amount/reason, status | Owner/manager submit; review required; compensates original, never overwrites. |
| JournalEntry | entryId, groupId, sourceType/id, postingKind, debtorId, creditorId, positive amount, currency, reversalLink?, time | Append-only canonical posting; unique source/posting key; pair directions net consistently. |
| BalanceProjection | groupId, account pair, signed net, journal sequence | Optional cache, rebuildable from journal, never authoritative. |
| Notification / OutboxMessage | event/source, recipient, minimal payload/ref, state, attempts, times | Recipient set current members other than submitter at submission; current access checked on dispatch/read. Outbox atomicity conditional on selected store. |
| ReportRequest | requesterId, groupId, inclusive start/end, supported filters | May be transient; query authorizes every record at request time. |

Expense lifecycle: PENDING → APPROVED after every required level approves, or PENDING → REJECTED on rejection. Final decisions reject late/duplicate actions. Approved expenses post once. Corrections have their own pending/review/finalized lifecycle and append only on approval. Payments are immutable; reversal is a correction bounded by unreversed original amount. Outbox lifecycle is PENDING → DISPATCHING → DELIVERED or RETRY_WAIT/FAILED; retries are idempotent and detail retrieval reauthorizes.

Currency code and precision are required on financial values; supported currency set and group-currency changes are unresolved (D-03). Use exact decimal (BigDecimal per Constitution), no binary floating point. Currency policy changes must not reinterpret historical records; exact migration/immutability semantics need approval. Transactional storage, uniqueness and locking are required guarantees, not selected vendor claims.
