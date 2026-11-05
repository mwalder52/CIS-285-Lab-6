# Architecture proposal

**Status:** Proposed for review; no platform or infrastructure choice is approved. Detailed Copilot design is the starting point, enriched with SpecKit planning/contracts/validation artifacts.

## Scope and boundary

Full customer product includes accounts, groups, expense submission, receipts, equal/percentage allocation, configurable review, notification, balances, payments, corrections, summaries, and date/filter reports. Customer asks for primary web and Android/iOS (`UserRequirement.md`; copied in `Lab_6_Requirement.docx`). The course lab itself is a UML/specification exercise. The Constitution directs Java 21/Maven/Swing but states Swing alone does not satisfy the web requirement; its ratification is pending. Thus neither web-only nor Swing-only is approved. Mobile remains unresolved from assignment text; do not treat it as accepted delivery scope until owner confirms.

## Logical architecture

Presentation adapters (browser; possible Swing prototype; mobile only if confirmed) call application use cases. Application services authenticate and authorize, coordinate transaction boundaries and explicit errors. Domain types own allocation, approval, money, membership and ledger rules. Infrastructure implements repository, transaction, identity/email, receipt, and notification ports. Dependencies point Presentation → Application → Domain; infrastructure adapters implement inward-facing ports. No financial rule depends on UI technology.

Application areas: Identity/Groups; Expense/Allocation; Approval/Correction; Payment/Ledger; Notification/Outbox; authorized Balance/Report queries. Shared application/domain behavior can serve browser and Swing adapters; this does not make the Swing user experience web compliant.

## Platform alternatives

| Option | Scope/conformance | Trade-off | Approval/blocker |
|---|---|---|---|
| Swing MVP then web product | Meets only proposed Java/Swing subset; a Swing-only release fails NFR-001 and defers receipts, percentage, multi-level review, custom/date reports and service targets. | Fits assignment direction, bounded prototype; requires later web delivery and shared service. | Owner + course stakeholder decide whether interim prototype is acceptable and what final deliverables are. |
| Web-first full product, with Swing prototype if course requires | Directly addresses NFR-001; still needs client/backend/tooling decisions. | Aligns customer channel; web framework/deployment not specified. | Owner + course stakeholder approve; reconcile Java/Swing direction. |
| Web plus native Android/iOS | Mirrors wording in DOCX, beyond checked-in customer source and unclear as Lab 6 deliverable. | Adds client scope, testing and maintenance. | Owner/course stakeholder explicitly confirm native apps; responsive web is not assumed equivalent. |

Do not weaken NFR-001. The web and Swing deployment alternatives are separate diagrams. A desktop-only deployment does not conform.

## Financial authority and transaction guarantees

Immutable approved expense/payment/correction source records plus linked append-only JournalEntry postings are canonical. Approval decisions authorize expense posting; pending/rejected expense has none. Expense shares create debtor→payer obligations, excluding payer's own share. Payment offsets that obligation. Approved reversal/correction appends compensating entry; originals stay unchanged. Balance is net journal projection and must be rebuildable/reconciled.

Approval finalization, unique posting, payment record/posting, and correction posting must be atomic. Use a source-record + posting-kind uniqueness key; review uniqueness by subject/reviewer/level; retries return prior result or explicit conflict without duplicate posting. Concurrent payment requests re-read/version-check current debt inside transaction and reject excess. These are technology-independent requirements; database/isolation/transaction feasibility is unproven until storage is selected and tested.

## Privacy, reliability, quality

Authorization is enforced in application/data-access boundaries, not UI visibility. Recheck current membership for reports, receipt downloads, notification dispatch and linked details. Notification payloads are minimal; durable outbox with idempotent retries is a proposal. Receipt binaries use private storage adapter and authorized retrieval; type/size/scanning/retention need decisions. NFR-003/004/005 are targets, not evidence. No availability/recovery/retention target exists.

## Standards and evidence

Constitution proposes Java 21, Maven, JUnit 5, PlantUML, OOD, GUI/domain separation, BigDecimal, traceability and human review. Constitution ratification pending. Course asks UML modeling and Spec Kit. No runnable app, persistence selection, build configuration or renderer exists. Full design inventory is in [diagrams](diagrams/README.md); decisions/blockers in [decisions.md](decisions.md).
