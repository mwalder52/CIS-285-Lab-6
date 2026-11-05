# Interface boundary contracts

Contracts are technology-independent proposals; they do not imply REST, Java interfaces, database product, or provider selection.

| Boundary | Input/output | Required guarantees / errors |
|---|---|---|
| IdentityPort | register, verify, authenticate, reset; account/session result | Verified email; credential secret never returned/logged; safe generic recovery response; provider and token policy TBD. |
| GroupRepository + AuthorizationPolicy | group, membership, actor, operation → allow/deny | Evaluate active membership/role per operation; deny by default; removal revokes historical group-only access. |
| ExpenseUseCase | actor, group, payer, participants, amount/currency/date/description, split data, optional receipt → expense ID/status/shares | Validate current members and exact money; save pending only; notification intent handoff; validation/forbidden/conflict outcomes. |
| ApprovalUseCase | subject, level, decision, reviewer → status | Verify policy eligibility, no self-approval, uniqueness and current pending state; atomically finalize plus unique journal posting. |
| PaymentUseCase | actor, group, debtor, creditor, amount/date, request key → payment ID/balance | Transactionally re-read outstanding; reject overpayment; one accepted submission → one payment/posting; explicit stale/conflict. Optional request key must not dedup by matching fields. |
| CorrectionUseCase | actor, source reference, kind, amount/reason → correction status | Owner/manager only; exactly one original; review required; bounded reversal; compensate only after approval. |
| JournalRepository / TransactionBoundary | append posting and source transition; query entries | Atomicity, unique source/posting key, append-only, consistency under retries/concurrency. Storage selection and feasibility TBD. |
| ReceiptStore | private put/get by opaque ref | Authorization before get; no public URL; limits, media policy, malware scanning, retention and encryption TBD. |
| NotificationPort / Outbox | committed notification intent → delivery status | Minimal payload; idempotent retry; recheck membership before dispatch/read; channel and provider TBD. |
| ReportQuery | actor, group scope, inclusive range, filter → authorized summary | start ≤ end; current authorization; totals reconcile to source facts; timezone/filter definitions TBD. |

Error categories: validation, unauthenticated, forbidden, not found (non-disclosing), stale state, duplicate decision/posting, overpayment, unavailable integration, and retryable delivery. Interface implementation and transport are future decisions.
