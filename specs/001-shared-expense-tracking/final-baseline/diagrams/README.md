# PlantUML diagrams

All files are editable standard PlantUML source. Concepts and names align with [data-model](../data-model.md), [architecture](../architecture.md), and [design](../design.md). Dashed/deployment annotations marked proposed or TBD are not technology selections. Current membership is checked at access boundaries; only journal postings change effective balances.

Inventory: `use-cases.puml` (actors and behavior), `system-context.puml` (trust boundaries), `component-architecture.puml`; classes `class-domain-core.puml`, `class-financial-ledger.puml`, `class-approval-notification.puml`; sequences `sequence-expense-submission.puml`, `sequence-approval-posting.puml`, `sequence-notification-dispatch.puml`, `sequence-payment.puml`, `sequence-correction-reversal.puml`, `sequence-balance-report.puml`; states `state-expense.puml`, `state-approval.puml`, `state-payment.puml`, `state-correction.puml`, `state-outbox-message.puml`; activities `activity-expense-submission.puml`, `activity-approval.puml`, `activity-payment.puml`, `activity-correction.puml`, `activity-reporting.puml`; deployments `deployment-web-first.puml`, `deployment-swing-mvp.puml`.

**Validation:** `@startuml`/`@enduml` delimiters are statically checked. No PlantUML executable/compiler was available; no rendering or syntax compilation is claimed. Review semantics against requirements before approval.
