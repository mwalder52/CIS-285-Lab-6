# SplitSmart Architecture Research Notes

**Status:** Design rationale, not external technology research.  
**Method:** Read the source documents listed below and inspected the repository's SpecKit plan template for documentation conventions. No external benchmarks, vendor documentation, or performance studies were consulted. No implementation or measurements were performed.

## 1. Verified source facts

| Fact | Source |
|---|---|
| Original customer asks for accounts, groups, equal/percentage splits, optional receipts, notifications, approvals, balances, payments, reports, and primary web access. | [UserRequirement.md](../../../UserRequirement.md) |
| Constitution directs Java 21, Maven, Java Swing, JUnit 5, PlantUML; requires BigDecimal money, GUI/domain separation, traceability, and human review. Swing alone is not web compliance. | [Constitution](../../../.specify/memory/constitution.md) |
| Feature specification is **Draft** and preserves full customer scope separately from a limited Swing MVP. | [spec.md](../spec.md) |
| Clarified specification defines payer/participant separation, membership, exact splits, largest-remainder tie rule, approval behavior, notification authorization, payments, corrections, removal behavior, dates, and measurable targets. | [spec.md](../spec.md), FR-001–FR-011, AC-001–AC-016, SC-001–SC-008 |
| Feature spec assumes one currency per group pending confirmation; supported currencies/precision, notification channel, report parameters, and service-target acceptance remain open. | [spec.md](../spec.md), Assumptions and Open Questions |
| Lab assignment asks for SpecKit CLI, Constitution/specification/clarification workflow and contains a customer-requirement reproduction ending with “primary web-based” plus Android and iOS apps. | [Lab_6_Requirement.docx](../../../Lab_6_Requirement.docx) |
| Android/iOS are not listed in the authoritative `UserRequirement.md` or specification Customer Requirements Inventory. | Comparison of [UserRequirement.md](../../../UserRequirement.md), [spec.md](../spec.md), and [Lab_6_Requirement.docx](../../../Lab_6_Requirement.docx) |
| Repository contains a SpecKit `plan-template.md`; it provides planning-artifact conventions, not architecture facts or selected technologies. | `.specify/templates/plan-template.md` |

## 2. Design rationale (proposals)

- **Separate application/domain logic from each presentation.** This is directly required for Swing by the Constitution and preserves reusable rules if the product uses browser or mobile clients. No presentation framework is selected.
- **Treat immutable source financial records as authoritative.** Deriving balances from approved expenses, payments, and compensating corrections supports audit and independent reconciliation. Any projection is a performance optimization proposal, not truth.
- **Make approval finalization and postings atomic.** The specification requires exactly-once balance effect despite duplicate/concurrent decisions. A transactional state transition and unique posting identity are implementation proposals; actual isolation/locking depends on a yet-unselected persistence adapter.
- **Use exact deterministic allocation.** This follows the spec's largest-remainder method, stable account-ID tie-break, currency scale, and `BigDecimal` constraint; no benchmark or external algorithm source was consulted.
- **Use authorization at request/use-case boundaries.** This is needed to enforce current membership for group history, notification detail, and receipts, including after removal.
- **Represent notification integration behind a port.** The channel is open. An outbox/retry proposal supports the stated target, but 60-second compliance cannot be claimed without a chosen channel and measured service.
- **Do not select a database, web framework, identity vendor, hosting environment, or receipt service.** None is mandated by the sources inspected, and platform direction remains unresolved.

## 3. Unverified items and research needed

No evidence is available yet for:

- Web and mobile technology compatibility with course constraints.
- Database transaction/isolation guarantees, capacity, or benchmark performance.
- Identity/email provider security or recovery behavior.
- Receipt storage, file safety, retention, and privacy controls.
- Notification channel delivery rates and latency.
- Report query workload and 100-user performance.
- Availability, backup, recovery, audit retention, or operations.

Investigate these after stakeholders resolve platform, scope, and operational targets. The design diagrams are conceptual PlantUML sources and require rendering/validation in the project toolchain before acceptance.
