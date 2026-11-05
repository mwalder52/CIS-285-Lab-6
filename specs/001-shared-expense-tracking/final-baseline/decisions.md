# Decision and risk log

No item below claims stakeholder approval. Approval owner identifies who must resolve it.

| ID | Issue/options and trade-off | Recommendation | Owner / status / blocking impact |
|---|---|---|---|
| D-01 Platform | Swing MVP then web vs web-first full product; desktop-only fails NFR-001. | Keep paths separate; if customer product is deliverable, web-first. | Project owner + course stakeholder; open; blocks platform approval and implementation. |
| D-02 Mobile | `UserRequirement.md` requests web; DOCX embedded request says web plus Android/iOS. Lab tasks focus UML/spec, unclear product delivery. | Confirm native app scope and whether responsive web is sufficient; no mobile baseline until resolved. | Course stakeholder + owner; open; blocks final client scope. |
| D-03 Currency | One currency/group is only a draft assumption; codes, precision and mixed currencies/change handling unknown. | Select supported currency set and precision; never reinterpret posted history after policy change. | Product owner; open; blocks financial implementation. |
| D-04 Approval policy | Current vs submission-time policy for pending items; snapshots avoid silent policy drift but constrain edits. | Snapshot immutable policy version at submission; require explicit migration for pending work. | Product/group-policy owner; proposed, unapproved; blocks review semantics. |
| D-05 Persistence/deployment | Relational transaction store plausible; no technology or topology selected. | Select only after proving atomicity, uniqueness and concurrency requirements. | Technical owner; open; blocks implementation readiness. |
| D-06 Notifications | In-app/email/push/provider and failure semantics unspecified. | Outbox plus idempotent retries is proposal; select channel and operational target. | Product/operations owner; open. |
| D-07 Receipt | Cardinality, limits, types, scanning, encryption, retention and provider unspecified. | Private reference and authorized retrieval; define controls before enabling. | Product/security owner; open. |
| D-08 Reporting | Supported filters, export formats, timestamp/timezone semantics open. | Preserve inclusive calendar-date behavior from draft; define filters before acceptance. | Product owner; open. |
| D-09 Operations | Availability, backup, recovery, retention, monitoring and privacy jurisdiction unspecified. | Set operational objectives before deployment. | Product/operations/security owner; open. |
| D-10 Constitution | Version 1.0.0 says ratification pending. | Project owner confirms ratification or amends governance; do not call binding approvals completed. | Project owner; open governance gate. |

## Risks

| ID | Severity | Evidence / impact | Mitigation |
|---|---|---|---|
| R-01 | Critical | Web/Swing conflict; false conformance possible. | Resolve D-01, retain separate alternatives, test browser NFR. |
| R-02 | High | Mobile wording differs between customer file and course handout. | Resolve D-02 before client scope. |
| R-03 | High | Currency/scale open; amount acceptance and allocation incomplete. | Resolve D-03 before financial implementation. |
| R-04 | Critical | Concurrent approval/payment could double-post or overpay without transaction guarantees. | Select/prove storage transaction, unique keys, concurrency tests. |
| R-05 | High | Removed member may access old report, receipt, notification link. | Reauthorize every data access and test stale links. |
| R-06 | High | Mutable balance can drift and obscure audit trail. | Journal canonical; derived projection reconciled. |
| R-07 | High | Receipt binaries can leak or contain unsafe content. | Define private storage controls and retention before enabling. |
| R-08 | Medium | Delivery channel and latency evidence absent. | Decide channel; instrument NFR-004. |
| R-09 | Medium | Report filters/time semantics incomplete. | Define query contract, preserve inclusive dates, test boundaries. |

Required human gates: stakeholder review → requirement approval → platform/mobile/currency/approval decision → architecture approval → implementation planning. These are separate gates; all currently Not Started/In Review.
