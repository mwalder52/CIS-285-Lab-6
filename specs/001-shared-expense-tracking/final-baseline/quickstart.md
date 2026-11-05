# Reviewer quickstart

1. Read [source inventory](source-inventory.md) and [requirements](requirements.md) to understand authority and scope.
2. Review [decisions](decisions.md) before treating the design as approved; D-01 and D-02 are especially significant.
3. Compare [architecture](architecture.md), [data model](data-model.md), [design](design.md), [contracts](contracts.md), and [traceability](traceability.md).
4. Open editable diagrams in `diagrams/`; each is intended to be rendered with standard PlantUML. Renderer/version is not installed/configured here, so no rendering command is claimed as verified. Example only: `plantuml diagrams/*.puml` when PlantUML is installed.
5. Use [validation checklist](validation-checklist.md) to record review evidence and approvals.

Prerequisites/toolchain: Constitution proposes Java 21, Maven, JUnit 5 and PlantUML; ratification pending and implementation tools are not selected/configured. Future implementation/testing follows [plan](plan.md), only after requirements and architecture gates are approved. Record requirement changes in `spec.md` after human decision and update this baseline/traceability; record design choices in `decisions.md`. No commands below the UML example are represented as runnable in this repository.
