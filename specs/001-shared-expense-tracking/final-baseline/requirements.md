# Consolidated requirements baseline

**Status:** Proposed; source requirements remain Draft. The IDs below retain `spec.md` identifiers. Rationale/source for each FR/NFR is the corresponding entry and user scenario in `specs/001-shared-expense-tracking/spec.md`, grounded in `UserRequirement.md` and its Customer Requirements Inventory. Priority: P1 core unless noted. Verification methods are proposed acceptance scenarios, not performed tests.

| ID | Requirement and acceptance measure | Design allocation | Verification |
|---|---|---|---|
| FR-001 | Verified-email account, sign-in, private own data, password reset; unauthorized account gets no private data. | Identity service and authorization | AC-001 account/privacy test |
| FR-002 | Create group; creator owner; owner manages managers; owner/manager adds/removes; owner cannot leave; removed member loses current and historical group-only access while obligations remain available to current members. | Group/Membership and authorization | AC-002 role and removal tests |
| FR-003 | Submit positive amount at configured currency precision, date not future, description, payer, method, optional receipt; payer current member and distinct role; at least one participant; payer's own share is not owed back. | Expense, Money, ReceiptReference | AC-003 boundary and payer cases |
| FR-004 | Participants are distinct current members; one allowed, zero rejected. | Membership validation and Allocation | AC-004 member/cardinality cases |
| FR-005 | Equal and percentage shares; nonnegative percentages total exactly 100%; exact minor-unit total; largest fractional remainder, stable account-ID tie-break. | AllocationPolicy | AC-005 deterministic allocation examples |
| FR-006 | Configured one/multi-level review; submitter cannot approve; each required level approves; rejection rejects; one decision/reviewer/level; late/duplicate decisions fail; only approved expense posts, exactly once. | ApprovalPolicyVersion, ApprovalDecision, atomic journal post | AC-006 concurrency and state cases |
| FR-007 | On submission notify current group members other than submitter; detail available only after authorization recheck; removed member cannot follow stale link. | Notification + OutboxMessage | AC-007 recipient/removal test |
| FR-008 | Show pairwise debtor/creditor balances from approved activity and payments, reconciling to source financial records. | Journal and derived BalanceProjection | AC-008 independent arithmetic comparison |
| FR-009 | Record partial/full dated payment; reject overpayment; every accepted submission has one immutable payment; similar fields do not imply duplicate; owner/manager correction references original and is reviewed; reversal bounded by unreversed original; approved correction alone changes balance. | Payment, Correction, journal | AC-009/009a payment, retry, reversal tests |
| FR-010 | Authorized summaries of expenses, balances, payments reconcile to authorized records. | Query/report use cases | AC-010 totals comparison |
| FR-011 | Reports support date range and supported filters, inclusive boundaries, start ≤ end, authorized contents only. | ReportRequest/query authorization | AC-011 boundary/permission tests |
| NFR-001 | Primary experience web-accessible; Swing-only does not conform. | Browser presentation path | AC-012 browser acceptance; not demonstrated |
| NFR-002 | Accurate repeatable monetary arithmetic at declared currency precision; allocations/settlements conserve value. | BigDecimal/Money and ledger invariants | AC-013 plus SC-002/004 |
| NFR-003 | With 100 concurrent active users, ≥95% summary requests within 2 seconds during a 15-minute representative test. Proposed target from draft spec. | Query/deployment capacity | Load test after topology selection; not run |
| NFR-004 | Under normal operation ≥95% notifications available within 60 seconds. Proposed target from draft spec. | Outbox and delivery adapter | Instrumented delivery test; not run |
| NFR-005 | At least 9 of 10 representative users complete equal-split submission and locate approved balance unaided. Proposed target. | Presentation/usability | User study; not run |
| NFR-006 | Account/group data only accessible to account owner or authorized current group members; removal blocks subsequent access. | Authorization at every data boundary | AC-001/002/007; SC-008 security tests |

**Success criteria retained:** SC-001–SC-008 remain as stated in `spec.md` and are linked through traceability. They are acceptance targets, not evidence of achieved outcomes.

**Open scope:** currency/precision; notification channel; report filters/export; performance test profile; mobile client scope; approval-policy change semantics; retention, receipt constraints, deployment and security operational objectives. See [decisions.md](decisions.md).

## Domain invariants

1. Amounts are positive and exact decimal; configured currency and precision govern input. Binary float/double must not represent money (Constitution III).
2. Allocate only across listed, current members. Payer may also participate; their own allocated share nets to zero against payer. Single participant valid; empty set invalid.
3. For equal split, compute exact quotient in minor units then distribute residual units using largest remainder. For percentage split, require exact 100% and use the same deterministic minor-unit allocation; ties use ascending stable account ID. Sum of shares equals original exactly.
4. PENDING/REJECTED expenses have no effective posting. Final approval and all journal entries commit once together. Decision uniqueness and posting uniqueness are source/level scoped, not based on matching payment details.
5. Payments atomically validate current pair debt; partial allowed, overpayment rejected. Payment corrections/reversals are append-only compensating records; reversed amount cannot exceed unreversed original. Approved expense corrections are separately reviewed and link to original.
6. Financial source facts/journal are immutable. Balances are derived and reconcilable projections, never the sole source of truth.
7. Check current membership and role at submit, decision, query, receipt retrieval, notification dispatch and detail access. Removed members cannot access group history; active members retain obligations/history.
8. Report endpoints are inclusive dates and start ≤ end. Time-zone semantics for timestamps remain unspecified; expense/payment fields currently use calendar dates.

Each invariant requires domain validation plus transaction/persistence enforcement where concurrency applies, and scenario verification. Technology selection is pending, so implementation feasibility is unproven.
