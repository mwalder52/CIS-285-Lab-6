# Future implementation and verification plan

This is a gated proposal, not authorization to start coding. Constitution/toolchain status remains pending ratification and architecture decisions remain open.

| Phase | Work after approval | Exit evidence |
|---|---|---|
| 0 Decisions | Resolve D-01–D-10 and confirm requirement priorities/scope. | Approved decisions and requirement baseline. |
| 1 Foundations | Select platform, identity, storage, transaction strategy, currency policy and operations. | Architecture review; demonstrated capability for atomicity, authorization and exact money. |
| 2 Core domain | Implement/test account, membership, money/allocation, expense and review semantics. | Requirement-linked unit/component evidence; independent allocation checks. |
| 3 Financial workflows | Payment, corrections, journal, balance projection/reconciliation. | Concurrency, idempotency, reversal and reconciliation evidence. |
| 4 Integration/presentation | Approved client(s), receipts, notification outbox/provider, reports. | Privacy, integration failure/retry, report and accessibility/usability evidence. |
| 5 Acceptance | Performance, notification timing, security/access, user study, recovery as approved. | Measurements against NFR/SC targets; human review and sign-off. |

For Java scope, the Constitution calls for Java 21, Maven and JUnit 5; the course lab requests UML artifacts. This repository currently has no implementation/build/test setup, so no working build commands are claimed. Organize future tests by requirement and financial/privacy invariant; preserve independent reference calculations for balances. Record requirement changes in the feature spec and decisions in `decisions.md`. Keep diagrams synchronized with accepted design.
