# SplitSmart Risk and Decision Log

**Status**: Proposed; stakeholder decisions remain open
**Rating**: Likelihood/impact are qualitative architecture estimates, not
measured probabilities.

## Risk register

| ID | Risk | Likelihood | Impact | Mitigation / evidence | Owner or approval |
|---|---|---:|---:|---|---|
| R-01 | Swing-only delivery conflicts with primary-web customer requirement; course handout also mentions Android/iOS. | High | Critical | Keep full web product and Swing MVP separate; do not claim NFR-001 compliance; approve one of the platform paths before implementation. | Project owner and course stakeholder |
| R-02 | Currency set/precision is unknown, making accepted input precision and production allocation boundary incomplete. | High | High | Select supported currency/scale policy before implementation; keep scale explicit; reject excess precision; test boundary cases. | Product owner |
| R-03 | A persistence/deployment choice may not provide atomic approval, payment, correction and ledger behavior. | Medium | Critical | Evaluate transaction/unique-key guarantees against the use cases; prove concurrent tests before acceptance. No database is selected. | Technical owner |
| R-04 | Derived balances drift or double-post under retries/concurrent reviews. | Medium | Critical | Keep journal authoritative, use conditional finalization and source-specific posting uniqueness, provide reconciliation checks. | Technical owner |
| R-05 | Notification and receipt integrations can leak restricted group details or fail delivery objectives. | Medium | High | Keep payload minimal, authorize every detail retrieval, use retries/outbox, validate storage privacy and delivery measurements. Providers and channels are open. | Product/security owner |
| R-06 | Removed members can reach historical records through direct URLs, cached clients, receipts, reports, or old notifications. | Medium | High | Enforce current membership at service/query/receipt boundaries; invalidate sessions/cache where applicable; test all retrieval paths. | Security reviewer |
| R-07 | Group approval-policy changes could alter decisions for already pending expenses. | Medium | High | Define policy version snapshot or migration rule before implementation; preserve the policy applicable at submission. This is a proposed design guard, not resolved in the spec. | Product owner |
| R-08 | Account recovery/email integration is unavailable or insecure. | Medium | High | Select a verified email provider and token/session policy; use short-lived single-use tokens and non-enumerating responses; conduct human security review. | Security/product owner |
| R-09 | Stated latency/notification/usability objectives are unvalidated and have no hosting or load assumptions beyond NFR-003. | Medium | Medium | Confirm acceptance environment and workload; instrument and measure before claiming conformance. | Product owner/operations |
| R-10 | Course scope may require mobile deliverables omitted from checked-in customer source. | Medium | High | Reconcile Lab_6_Requirement.docx with the owner before platform/client planning; track mobile as course scope pending confirmation. | Course stakeholder |
| R-11 | No source code, Maven build, persistence, or tests currently exist, so architecture/test setup cannot be validated by execution. | High | Medium | Treat this package as design only; create implementation/build artifacts only after decisions and approval. | Project owner |

## Decision log

| ID | Decision | Status | Basis / impact |
|---|---|---|---|
| D-01 | Full customer product must retain primary web access; Swing-only is not full conformance. | **Accepted by source** | `UserRequirement.md`, Constitution, NFR-001/AC-012. |
| D-02 | Java 21, Maven, Swing direction, JUnit 5, PlantUML, OOD, presentation/domain separation, `BigDecimal`, traceability, and human review constrain project work. | **Accepted by source** | Constitution. Where platform scope conflicts, preserve conflict rather than waive it. |
| D-03 | Use a shared application/domain boundary behind presentation adapters. | **Proposed** | Supports full and MVP scopes without duplicating money/approval rules. |
| D-04 | Use an immutable financial journal as source of truth and derive pairwise balances. | **Proposed** | Enables audit/reconciliation and compensating records. |
| D-05 | Approval/payment/correction posting must be atomic and source-idempotent. | **Proposed design invariant** | Storage mechanism remains unselected; verify after product selection. |
| D-06 | A durable notification outbox is a candidate for committed expense notifications. | **Proposed** | Generic pattern; provider and channel remain open. |
| D-07 | The allocation algorithm follows largest remainder and stable account-ID tie-break. | **Accepted by clarified spec** | FR-005/AC-005 and clarification session. |
| D-08 | Supported currencies and precision. | **Awaiting stakeholder approval** | Required for amount acceptance, calculations, and serialization. |
| D-09 | Web/Swing/mobile product delivery path. | **Awaiting project-owner/course approval** | Material architecture and conformance decision. |
| D-10 | Database, hosting topology, browser/mobile frameworks, email, notification and receipt providers. | **Awaiting technical/product selection** | No source requires a vendor or physical deployment. |
| D-11 | Availability, recovery, retention, privacy jurisdiction, and operational monitoring targets. | **Awaiting stakeholder/operations decisions** | Current NFRs do not define these concerns. |

## Approval gates before implementation

1. Resolve R-01/R-10 and record whether delivery is web-first, Swing prototype
   plus later clients, and whether Android/iOS are required.
2. Confirm currencies and precision.
3. Select persistence and deployment only after proving transaction,
   authorization, audit, and recovery requirements.
4. Select notification/email and receipt-storage behavior and verify privacy
   and NFR-004 measurement.
5. Confirm report filters, policy changes for pending expenses, and service
   reliability/recovery targets.
