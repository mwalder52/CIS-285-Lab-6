# Implementation Plan: SplitSmart Shared Expense Tracking

**Branch**: `001-shared-expense-tracking` | **Date**: 2026-11-05 |
**Spec**: [spec.md](./spec.md)

**Input**: Clarified feature specification, original customer request,
project Constitution, architecture/design prompt, and course handout.

## Summary

Produce architecture and design documentation for the complete SplitSmart
product and separately for the proposed Swing MVP. The customer requires
primary web access; the Constitution directs Java 21/Maven/Swing; and the
course handout additionally mentions Android and iOS. No source resolves these
platform differences. The design therefore compares feasible paths and leaves
the delivery platform as a stakeholder decision gate.

The shared conceptual design separates presentation, application use cases,
domain rules, and persistence/integration ports. Approved financial activity
is represented by immutable journal entries; pairwise balances are derived
from those entries rather than treated as the authoritative mutable record.
Specific database, web/mobile UI frameworks, deployment, and notification
providers remain unselected proposals.

## Technical Context

**Language/Version**: Java 21 is a constitutional implementation constraint
for Java components. A web or mobile client language is not selected.

**Primary Dependencies**: Java standard library and Swing for the proposed
desktop MVP; Maven and JUnit 5 are constitutional constraints. No web
framework, persistence library, or notification provider is selected.

**Storage**: No application storage or schema exists in the repository. The
design requires a transactional persistent store; its product and deployment
are open decisions.

**Testing**: JUnit 5 for Java domain/application tests. Browser/mobile
end-to-end, visual Swing, load, delivery, and usability tooling is not yet
selected.

**Target Platform**: Customer source: primarily web-based. Course handout:
web plus Android and iOS. Constitution/spec also describe a Java Swing MVP,
which alone is not customer-conformant. Stakeholder decision required.

**Project Type**: Shared-expense application with a possible Swing desktop
MVP and a separately scoped full web product; mobile apps are a course-handout
scope item pending reconciliation.

**Performance Goals**: NFR-003/SC-005: at 100 concurrent active users, at
least 95% of balance and report-summary requests complete within 2 seconds
over a 15-minute test. NFR-004/SC-006: at least 95% of expense notifications
available within 60 seconds under normal service operation.

**Constraints**: All monetary values use `BigDecimal`; exact deterministic
allocation with configured currency precision; owner/manager and reviewer
authorization; immutable financial records and approved compensating
corrections; no self-approval; exactly-once posting; removed-member privacy.
No database, hosting, identity vendor, or notification channel is mandated.

**Scale/Scope**: Only the stated baseline of 100 concurrent active users is
quantified. User count, group size, retention, availability, disaster recovery,
and data residency targets are unspecified.

## Constitution Check

*Gate before design:*

- **Pass**: Customer requirements and implementation decisions are labeled
  separately; the original request remains authoritative for customer scope.
- **Pass**: Java 21, Maven, Swing where selected, JUnit 5, and PlantUML are
  recognized as constitutional implementation constraints.
- **Pass**: Design keeps Swing presentation separate from domain/business
  logic and uses cohesive object-oriented boundaries.
- **Pass**: Monetary logic uses `BigDecimal`, and allocation/rounding behavior
  is explicit and deterministic.
- **Pass**: Requirement traceability and human review are included.
- **Decision gate, not a waiver**: Swing-only does not satisfy the primary-web
  customer requirement. The architecture compares alternatives and makes no
  final platform selection.

*Post-design review*: No constitutional rule is silently waived. The full
product remains unimplementable as a single approved delivery scope until the
web/Swing direction and course-handout mobile scope are confirmed.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-expense-tracking/
├── plan.md
├── research.md
├── architecture.md
├── design.md
├── data-model.md
├── traceability-matrix.md
├── risk-and-decision-log.md
├── quickstart.md
├── contracts/
│   └── interface-boundaries.md
└── diagrams/
    ├── system-context.puml
    ├── logical-architecture.puml
    ├── domain-model.puml
    ├── expense-approval-sequence.puml
    ├── payment-balance-sequence.puml
    └── deployment-alternatives.puml
```

### Application Source

No application source tree, `pom.xml`, Java files, or test tree was present
when this plan was prepared. Package layout and build configuration are future
implementation decisions and are intentionally not created by this
documentation-only workflow.

**Structure Decision**: Keep this output limited to feature documentation.
If approved for implementation, use Maven's standard source/test layout or a
stakeholder-approved multi-client layout; do not infer one from this plan.

## Workflow Notes

The installed plan workflow was initialized with
`.specify/scripts/powershell/setup-plan.ps1 -Json`. The resolved plan template
provides the plan structure but does not define the prompt's additional
architecture, detailed design, traceability, risk-log, or PlantUML deliverable
templates; those files were added in the existing feature directory according
to the architecture prompt. No `tasks.md`, application code, database script,
build configuration, or executable project was generated.

## Complexity Tracking

No architecture deviation from the Constitution is asserted. The service,
ledger, and notification-outbox boundaries are proposals justified by
multi-user access, financial auditability, and atomic notification needs; they
do not establish a database or deployment product.
