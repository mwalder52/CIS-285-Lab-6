# SplitSmart Architecture Traceability Matrix

**Status**: Proposed design coverage; verification has not been executed.
**Scope key**: **Full** = complete product design; **Swing MVP** = subset in
spec.md; **Deferred** = not covered by the Swing MVP. Swing-only delivery does
not satisfy NFR-001.

## Functional requirements

| Requirement | Architecture / design coverage | Swing MVP status | Planned verification |
|---|---|---|---|
| FR-001 Account, verified email/password, reset | Account/access use cases; identity/email ports; UserAccount model; auth boundary | Included conceptually; environment and email integration unselected | JUnit 5 account lifecycle and authorization tests; client sign-in/reset scenario |
| FR-002 Groups, owner/manager roles, removal privacy | Group use cases; Membership model; authorization rules; history retained for current members | Included as group/member management | Role matrix tests; removed member denied current and historical access; current member retains history |
| FR-003 Expense fields, positive currency-precision amount, optional receipt | Expense submission; Allocation snapshot; private ReceiptReference/storage port | Core fields included; receipt deferred | Amount/date validation tests; receipt optional/authorization tests; future-date rejection |
| FR-004 Participants are current members; >=1 | Expense use case and allocation invariant | Included | Empty participant, one participant, payer-as-participant, nonmember participant tests |
| FR-005 Equal/percentage allocation, exact 100%, largest remainder and ID tie | `BigDecimal` allocation domain service; currency scale configuration | Equal split included; percentage deferred | JUnit 5 0.01/equal/percentage/tie/negative percentage/sum mismatch tests; shares sum exactly |
| FR-006 Approval levels, reviewer authorization, no self-approval, exact-once post | Approval use case/state machine; transaction + unique source posting | Single reviewer subset; multi-level deferred | Unit and concurrent integration tests for all approval paths, repeated/late decisions, and one posting |
| FR-007 Notify all current members except submitter; privacy | Outbox/notification adapter; recipient snapshot; current-membership check before dispatch and on detail access | In-app notice subset; channel and delivery target are not product-ready | Recipient selection, removal-before-dispatch suppression, retries, removed-member access and NFR-004 delivery measurements |
| FR-008 Pairwise balances | Append-only journal as source; derived pairwise query/projection | Included for approved expenses and payments | Independent reference calculations; reconciliation and payer-own-share cases |
| FR-009 Payments, no overpayment, immutable records, reviewed corrections/reversals | Payment use case; journal offset; Correction; approval flow; source uniqueness | Basic dated payment included; correction workflow not in MVP subset | Partial/full/overpayment, identical business-field payments, immutable original, over-reversal and concurrent-payment tests |
| FR-010 Expense/balance/payment summaries | Authorized report/query use cases over records/journal | Basic summaries included | Totals reconcile to authorized records; empty state and removed-member tests |
| FR-011 Date-range/custom reports, access restriction, inclusive bounds | ReportRequest/query and authorization; inclusive date validation | Custom/date-range reporting deferred | Boundary inclusion, reversed range, unauthorized records, supported filter tests |

## Non-functional requirements

| Requirement | Architecture / design coverage | Swing MVP status | Planned verification |
|---|---|---|---|
| NFR-001 Primary web-based access | Path B is web-first; Path A is a prototype and explicitly nonconformant | **Not satisfied by Swing-only MVP** | AC-012; acceptance test in supported browser; stakeholder must approve web platform and supported browsers |
| NFR-002 Exact/repeatable money | `BigDecimal`, explicit currency scale, deterministic allocation and journal reconciliation | Equal split only; percentage deferred | AC-013; 100+ allocation cases; repeatability and total reconciliation |
| NFR-003 p95 <=2s at 100 concurrent users | Query boundary permits scale testing; no hosting or database selected | Deferred target in MVP spec | AC-014; 15-minute load test; p95 balance/report request latency |
| NFR-004 >=95% notifications available <=60s | Durable outbox proposal, retries, observable delivery state | Production target deferred | AC-015; instrumented delivery measurement under defined normal-service conditions |
| NFR-005 9/10 usability task success | Simple use-case flows; client-specific UX remains a platform decision | Proposed test for desktop prototype only | AC-016; at least 10 representative users; >=9 complete task unaided |
| NFR-006 Access only by owner/authorized group members | Use-case authorization, current membership re-check, private receipt/notification references | Included conceptually | AC-001–AC-002, AC-007, AC-011; negative access tests across account, group, receipt, notification and report paths |

## Original customer requirements inventory

| Customer feature | Coverage | Verification |
|---|---|---|
| Accounts and personal access | FR-001; account boundary | AC-001 |
| Group management | FR-002; group/membership model | AC-002 |
| Expense amount/date/description/equal or percentage/receipt | FR-003, FR-005; expense/allocation/receipt design | AC-003, AC-005 |
| Specify users involved | FR-004; participant allocations | AC-004 |
| Notify on other members' expenses | FR-007; outbox proposal | AC-007, NFR-004 |
| Review and approve before balance update; single/multiple levels | FR-006; approval policy/state model | AC-006 |
| Owed-by-each-user pairwise balance | FR-008; journal-derived pairwise query | AC-008 |
| Payment tracking | FR-009; immutable payment and journal offset | AC-009, AC-009a |
| Summary/custom/date-range reporting | FR-010, FR-011; report/query boundary | AC-010, AC-011 |
| Primary web platform | NFR-001; Path B meets intent, Path A does not | AC-012 |

## Success criteria coverage

| Criterion | Design / verification |
|---|---|
| SC-001 Requirements inventory coverage | Inventory table above maps each source feature; verify during human review |
| SC-002 100 allocations reconcile | JUnit allocation tests include equal, percentage, and remainder cases |
| SC-003 No pending/rejected post; approved exactly once | Approval transaction tests and unique posting invariant |
| SC-004 Pairwise balances match reference | Journal reconciliation tests |
| SC-005 p95 2s at 100 active users | Load test plan in design; no measured result exists |
| SC-006 95% notification availability <=60s | Delivery telemetry/load test plan; provider not selected |
| SC-007 >=90% unaided usability | Moderated task test plan; no test conducted |
| SC-008 No nonmember data retrieval | Authorization negative-test suite |

## Course-handout scope note

The course handout's embedded user-requirement text says the product is
primarily web-based **and** has Android/iOS apps, while the repository's
authoritative `UserRequirement.md` states only "primary web-based." This
matrix does not treat the additional mobile clients as customer requirements.
Their status requires course-owner confirmation; if required, Path B can
consider clients using the shared application boundary.
