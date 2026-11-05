# Reconciliation report

**Conclusion: Ready for stakeholder review; not requirements-approved, architecture-approved, or implementation-ready.** Source packages remain as historical comparison artifacts.

## Consolidation

Copilot's detailed architecture/design provided the primary direction: layered adapters/use cases/domain/infrastructure; exact largest-remainder allocation; authorization matrix/workflow emphasis; separate Swing and web deployments; policy versions; financial posting and risk detail. SpecKit contributions retained: phase/gate planning, research assumptions, interface boundaries, quickstart, requirement checklist/traceability, and `ReceiptReference`/`OutboxMessage` concepts. The consolidated model standardizes ExpenseAllocation, ApprovalPolicyVersion, Correction, JournalEntry and BalanceProjection terminology and clarifies payer netting, immutable originals, source-specific idempotency and membership checks.

### Comparison findings

Both packages preserve the core financial and privacy concerns and both explicitly keep Swing separate from the full web product. Copilot is more explicit about transaction/posting workflow and access-control responsibilities; SpecKit is stronger in planning, interface-boundary contracts, checklists, quickstart, and traceability scaffolding. Both treat the journal/derived-balance model and outbox as proposals rather than selected infrastructure.

The source packages differ in their modeling emphasis: Copilot has a distinct approval-policy version and correction/posting concepts in its model; SpecKit explicitly names `ReceiptReference` and durable `OutboxMessage`. These were combined. Neither source resolves the web/Swing decision, currency support/scale, pending policy-change behavior, provider/storage selection, or operational retention. Course DOCX adds Android/iOS wording not represented in the checked-in spec inventory; this remains open. No source conflict is concealed by selecting a deployment.

Design choices rejected as facts: one currency per group is retained only as an assumption pending decision; policy snapshot semantics remain proposed; database transaction guarantees are requirements to satisfy, not proven capabilities; notifications and receipt storage are boundaries, not selected vendors. No stated proposal was promoted to an owner-approved decision.

The mobile requirement is present in actual course DOCX customer text (web plus Android/iOS), despite its omission from checked-in `UserRequirement.md` and the spec inventory. It is therefore recorded as a source conflict, not silently included or rejected. Swing-only does not satisfy NFR-001. No technology alternative was approved.

## Coverage and diagram status

FR-001–011, NFR-001–006, AC-001–016, SC-001–008 and every original feature map to design and proposed verification in `requirements.md`/`traceability.md`. This establishes documentation coverage only; no behavior is implemented or verified. Required UML categories are represented by 23 editable `.puml` files (inventory in `diagrams/README.md`). Delimiters were statically inspected; PlantUML renderer was not available, so syntax compilation/rendering and semantic visual validation are Not Run.

## Blockers and evidence gaps

D-01 platform; D-02 native mobile scope; D-03 currency/precision; D-04 pending-policy changes; D-05 storage/transaction/deployment; D-06 notification channel; D-07 receipt controls; D-08 report semantics; D-09 operations/retention; D-10 Constitution ratification. Owners and impacts are in `decisions.md`. These require human decisions. NFR targets remain unmeasured. Security, concurrency, operational recovery and implementation feasibility are not demonstrated.

## Review gates

Ready for stakeholder review. Requirements approval and architecture approval are pending. Implementation readiness is blocked. No application code, tests, build files, migrations, deployment manifests, or executable artifacts were created. Source packages were not edited. See [source inventory](source-inventory.md) for exact reviewed files and [validation checklist](validation-checklist.md) for status.
