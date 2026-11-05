# Reconciliation Prompt: Final Requirements, Architecture, Design, Data, and UML Baseline

> **Purpose:** Give GitHub Copilot (or another repository-aware engineering assistant) one controlled task to reconcile the existing SpecKit and Copilot architecture packages into a single, reviewable, internally consistent project baseline for the CIS-285 SplitSmart term project.
>
> **Operating mode:** Requirements and architecture documentation only. Do not implement application code, create a runnable application, or silently make unresolved product decisions.

---

## Copy everything below this line into the repository-aware assistant

# Role and objective

Act as a principal software architect, senior business analyst, requirements engineer, data architect, security architect, and UML modeler.

Your task is to produce the **final proposed requirements and solution-design documentation baseline** for the SplitSmart shared-expense tracking project in this repository. You must independently inspect the repository's actual current contents before writing. Do not rely on summaries, assumptions, prior chat messages, or filenames alone.

The project owner has selected this reconciliation strategy:

- Use **GitHub Copilot's detailed design package** as the primary starting point for architecture and detailed design.
- Enrich it with **SpecKit's planning, interface contracts, research, quickstart, traceability, and validation artifacts**.
- Preserve the original SpecKit and Copilot outputs as historical comparison artifacts. Do not overwrite, delete, or silently rewrite either source package.
- Produce one clearly identified consolidated baseline that is coherent, traceable, reviewable, and suitable for subsequent implementation planning after human decisions are approved.

This is a documentation and modeling task, not a coding task.

## 1. Mandatory repository discovery and source hierarchy

First inspect and read the actual contents of all relevant files, including (where present):

### Authoritative project inputs

1. `UserRequirement.md`
2. `.specify/memory/constitution.md`
3. `specs/001-shared-expense-tracking/spec.md`
4. The course handout `Lab_6_Requirement.docx` and any other assignment/rubric documents that are actually present and readable.
5. Any README, project brief, or existing decision records that materially affect scope.

If a binary document cannot be read with available repository tools, state that limitation explicitly. Do not infer its contents from references made by other documents.

### SpecKit reference package

Inspect all applicable files under `specs/001-shared-expense-tracking/`, including:

- `plan.md`
- `research.md`
- `architecture.md`
- `design.md`
- `data-model.md`
- `traceability-matrix.md`
- `risk-and-decision-log.md`
- `quickstart.md`
- `contracts/interface-boundaries.md`
- `checklists/requirements.md`
- all PlantUML files under that feature's diagram directory.

### Copilot reference package

Inspect all applicable files under `specs/001-shared-expense-tracking/copilot/`, including:

- `architecture.md`
- `design.md`
- `data-model.md`
- `research.md`
- `traceability-matrix.md`
- `risk-and-decision-log.md`
- all PlantUML files in that directory.

Also inspect related repository files that establish project conventions, tooling, naming, or constraints.

### Authority and conflict rules

Use this precedence order, while preserving and reporting genuine conflicts rather than concealing them:

1. Explicit customer requirements and approved project-owner decisions.
2. Approved course/assignment requirements and constraints.
3. The project Constitution, **only to the extent it has actually been ratified**.
4. The canonical feature specification and its approved acceptance criteria.
5. Existing SpecKit and Copilot architecture/design artifacts as proposals and evidence, not as higher authority than requirements.
6. Your own recommendations, clearly labeled as recommendations requiring approval.

The Constitution's ratification status and the feature specification's approval status must be checked from the files. Do not call a pending or draft document approved. Do not claim that a proposed design decision is a customer requirement.

Create a source inventory with each file's path, role, and status (authoritative input, approved decision, draft, generated proposal, or unreadable). Note missing or inaccessible sources. Never invent a missing artifact or claim to have reviewed one that you could not read.

## 2. Non-negotiable working rules

1. **No application implementation.** Do not create or modify Java source files, tests, build files, database migrations, deployment manifests, or executable application code. Do not run implementation generators.
2. **Preserve the source packages.** Do not edit or delete the existing SpecKit or Copilot comparison artifacts. Create the consolidated package in a new, clearly named directory.
3. **No silent conflict resolution.** Record each material disagreement, its source, impact, recommendation, approval owner, and status.
4. **No fabricated certainty.** If a technology, business rule, threshold, data-retention period, currency policy, or deployment decision is unspecified, mark it unresolved and propose options. Never invent an approval.
5. **Trace every requirement.** Every functional and nonfunctional requirement must have a stable ID, rationale/source, priority, measurable acceptance criteria, design allocation, and verification method.
6. **Use consistent terminology and identifiers** across all documents and diagrams.
7. **Keep financial correctness central.** Model money, allocation, approvals, postings, payments, reversals, audit history, concurrency, and idempotency explicitly.
8. **Keep privacy and authorization central.** Do not assume that membership in one group grants access to another group or to historical data after removal.
9. **Distinguish design intent from evidence.** A planned test is not a passed test; a diagram is not proof of runtime behavior; an architectural guarantee is not proven until supported by a selected technology and verification.
10. **Cite exact repository paths and headings** in reconciliation notes, decisions, and source comparisons. Use line numbers if available.
11. **Do not add scope merely because it is common in commercial products.** Label optional enhancements separately from required scope.
12. **Do not start implementation or declare the architecture implementation-ready** until all required human decisions and review gates are explicitly identified and approved.

## 3. Reconciliation decisions and known issues to address

Treat the following as audit findings to verify against the repository, not as unquestionable facts. Re-check the source files and correct any discrepancy you discover.

### 3.1 Copilot versus SpecKit strengths to combine

Use Copilot's detailed design as the primary basis, particularly where it provides:

- explicit largest-remainder allocation steps;
- authorization matrix and access-control detail;
- approval and payment workflow detail;
- approval-policy versioning;
- separate Swing-MVP and web-first deployment alternatives;
- more detailed risk and decision records.

Bring forward SpecKit's useful project-level artifacts and concepts, particularly:

- implementation planning and phase/gate structure;
- research references and assumptions;
- interface-boundary contracts;
- quickstart and validation guidance;
- requirements checklist and traceability practices;
- explicit `ReceiptReference` and durable `OutboxMessage` concepts where they remain appropriate.

Do not mechanically copy both versions. Reconcile their terminology, cardinalities, responsibilities, and decisions into one model.

### 3.2 Web versus Swing platform conflict — critical

The customer requirement indicates a primarily web-based product (including NFR-001), while the Constitution and course context may direct a Java 21/Maven/Swing implementation or limited Swing MVP. Existing designs have treated Swing as a constrained MVP and acknowledged that Swing alone does not satisfy the full web requirement.

You must:

- quote or accurately summarize the exact source statements and cite their paths/headings;
- distinguish the customer's required product experience from the course's required implementation/demonstration deliverable;
- keep a web-first/full-product architecture and a Swing MVP/prototype as distinct deployment or presentation alternatives if the conflict remains unresolved;
- explicitly state whether a Swing-only deliverable satisfies NFR-001 (do not claim it does if it does not);
- identify what can be shared across presentation adapters (application services, domain model, persistence contracts, validation, and business rules);
- provide a clear decision record with options, trade-offs, recommendation, approver, and blocking impact.

Do not silently choose Swing-only or web-only. Do not weaken NFR-001 to make the architecture easier. If the repository contains an explicit approved decision resolving this conflict, follow it and cite it.

### 3.3 Mobile scope

Verify whether Android and/or iOS are actually required by the course handout or customer source. Do not treat a generated document's mention of mobile scope as proof. If the handout is inaccessible or ambiguous, record the scope as unresolved and request confirmation. Keep mobile clients out of committed scope until supported by an authoritative source or approved decision.

### 3.4 Financial model and source of truth

Reconcile the use of immutable source records, journal entries/postings, derived balances, payment records, reversals, and corrections.

Explicitly define:

- which records are canonical and authoritative;
- which records are immutable source facts versus derived projections;
- how an expense becomes financially effective;
- how approval decisions authorize posting;
- how payments, partial payments, reversals, and corrections affect balances;
- how all postings reconcile to source transactions;
- uniqueness/idempotency keys and duplicate handling;
- transaction boundaries and concurrency controls;
- how failed or retried operations avoid double posting.

Do not use a mutable balance field as the sole financial source of truth. If the database/transaction technology is not selected, describe the required guarantees as technology-independent requirements and leave implementation feasibility unproven.

### 3.5 Money and allocation

Preserve exact decimal arithmetic; do not use binary floating point for financial calculations.

Specify and reconcile:

- currency code and currency scope (per group, per expense, or system-wide);
- supported currency precision and rounding policy;
- whether mixed-currency groups or expenses are allowed;
- what happens if a group's currency policy changes;
- equal split and percentage split semantics;
- payer treatment and payer's own share;
- positive amount and participant-count validation;
- deterministic largest-remainder allocation;
- stable tie-breaking rule;
- exact reconciliation of allocated shares to the original expense amount.

Where the sources do not decide currency behavior, present options and record a blocking decision rather than inventing one.

### 3.6 Approval workflow

Model the approval policy, approval levels/thresholds, eligible approvers, self-approval prohibition, duplicate decisions, late decisions, rejection, resubmission, and exactly-once posting.

Explicitly resolve or record:

- whether pending expenses use the policy snapshot taken at submission or the current policy;
- what happens when a group policy changes while an expense is pending;
- how policy versions are retained and referenced;
- how corrections/reversals are reviewed and linked to approval decisions;
- how approval decisions and ledger posting remain atomic or recoverably coordinated.

### 3.7 Notifications and membership changes

Define event generation, durable dispatch, retry/idempotency, delivery status, and privacy boundaries.

Resolve or record:

- notification recipient snapshot timing;
- whether a person removed from a group after submission but before queued dispatch still receives the notification;
- whether current membership is rechecked at dispatch and at content access;
- how notification content avoids disclosing group/expense data to unauthorized users;
- what happens when a notification provider is unavailable.

Do not claim an availability target is met without an operational design and measured evidence.

### 3.8 Receipts and attachments

Define receipt metadata, storage abstraction, access authorization, upload/download flow, allowed formats/size limits (if specified), malware/content validation considerations, retention/deletion policy, and references from expenses.

Do not invent retention periods or claim that storing a URL alone secures the file. Identify provider and encryption choices as unresolved if not approved.

### 3.9 Reports, dates, and privacy

Specify required reports and summaries from the source requirements. Define report parameters, date inclusivity, time-zone semantics, group/member filters, export formats, authorization, and treatment of removed members. Mark unsupported report features as optional rather than silently adding them.

### 3.10 Model consistency issues to verify

Check and correct, where applicable:

- Correction-to-ApprovalDecision and Correction-to-ApprovalPolicy relationships;
- explicit ApprovalPolicy representation in the domain model;
- posting/journal cardinalities and the distinction between source records and projections;
- durable OutboxMessage and dispatcher responsibilities;
- payment authorization and cross-group balance access;
- deployment diagram alignment with the web/Swing decision;
- consistent naming, multiplicities, identifiers, and state transitions across all diagrams and prose.

## 4. Required consolidated output package

Create a new directory, preferably:

`specs/001-shared-expense-tracking/consolidated/`

If the repository already contains a consolidated package, inspect it and choose a non-destructive versioned or clearly named sibling directory instead. Never overwrite existing artifacts without explicit instruction.

Produce the following documents. You may add supporting documents when useful, but do not omit any required item without explaining why.

### 4.1 `README.md` — package guide

Include:

- purpose and scope;
- status (proposed/draft/approved);
- source hierarchy;
- document index and reading order;
- glossary and canonical terminology;
- major unresolved decisions;
- review/approval gates;
- explicit statement that this package is documentation, not implementation evidence.

### 4.2 `source-inventory-and-reconciliation.md`

Include:

- complete source inventory;
- source authority/status;
- comparison of SpecKit and Copilot artifacts;
- consolidated choice for each material design topic;
- retained, merged, rejected, and deferred concepts with rationale;
- conflicts, omissions, contradictions, and unreadable sources;
- exact source file paths and headings;
- provenance limitation: do not claim independent generation or independent validation unless evidence supports it.

### 4.3 `requirements.md`

Produce a single coherent requirements specification covering:

- project purpose, goals, stakeholders, user classes, assumptions, constraints, scope, and exclusions;
- functional requirements FR-001 onward, preserving existing identifiers when meaning is unchanged;
- nonfunctional requirements NFR-001 onward, preserving existing identifiers when meaning is unchanged;
- business rules BR-001 onward;
- data and interface requirements where applicable;
- dependencies and external-system requirements;
- requirement priorities and rationale;
- measurable acceptance criteria AC-001 onward;
- explicit open questions and approval status.

Do not renumber existing requirements merely for cosmetic reasons. If a requirement is split, merged, changed, or retired, provide an ID migration/cross-reference table. Keep functional and nonfunctional requirements distinct.

For each requirement include, as appropriate:

- ID;
- requirement statement using clear, testable language;
- source and rationale;
- priority;
- actors/components affected;
- acceptance criteria;
- verification method;
- status (proposed, approved, deferred, rejected).

Requirements must be atomic, unambiguous, feasible, necessary, and verifiable. Avoid vague terms such as "fast", "secure", "user-friendly", or "reliable" unless quantified or tied to a defined standard.

### 4.4 `nfr-verification-plan.md`

For every NFR, specify:

- metric and operational definition;
- target/threshold from an authoritative source;
- workload, environment, and duration;
- measurement method and instrumentation;
- test or review method;
- pass/fail criteria;
- evidence artifact expected;
- owner and status.

Include performance, availability, usability/accessibility, security/privacy, data integrity, maintainability, compatibility, and operational concerns only where supported by project scope. Clearly distinguish specified targets from recommended targets requiring approval.

In particular, do not claim NFR-003, NFR-004, or NFR-005 are verified without measured load, delivery, or user-test evidence.

### 4.5 `architecture.md`

Include:

- architecture drivers and quality attributes;
- context and scope boundaries;
- architectural principles;
- selected logical architecture (or alternatives where decision pending);
- layers and responsibilities;
- presentation adapters and platform strategy;
- application/use-case services;
- domain services/entities/value objects;
- persistence and infrastructure adapters;
- integration boundaries;
- transaction and consistency strategy;
- security and authorization architecture;
- notification/outbox architecture;
- receipt/attachment architecture;
- deployment topology alternatives;
- technology choices with rationale and status;
- architecture decision records or links to them;
- failure modes, scalability assumptions, and operational concerns.

Show how a browser client and a Swing MVP can share core business capabilities without implying that Swing fulfills the web requirement. Do not select a web framework, database, cloud, identity provider, or notification vendor without evidence or approval.

### 4.6 `design.md`

Provide detailed design for all important use cases and workflows, including:

- registration/authentication/account lifecycle;
- group creation, membership, roles, invitations, and removal;
- expense creation and participant selection;
- equal and percentage allocation;
- expense submission, approval, rejection, and resubmission;
- notifications;
- balances and summaries;
- payments, partial payments, and reversals;
- corrections and audit history;
- reporting and exports;
- receipt upload/access;
- authorization checks and error handling.

For each workflow describe trigger, preconditions, main flow, alternate/exception flows, postconditions, authorization, transaction boundaries, emitted events, and audit records.

Include a role/permission matrix and explain object-level authorization, group isolation, least privilege, and removed-member behavior.

### 4.7 `data-model.md`

Provide a normalized conceptual/logical data model with:

- entity definitions and responsibilities;
- attributes, data types, required/optional status, constraints;
- primary/foreign keys and unique constraints;
- relationships and multiplicities;
- indexes or query needs where justified;
- lifecycle and retention considerations;
- immutable versus mutable attributes;
- audit metadata;
- canonical source-of-truth designation;
- mapping to requirements and use cases.

Cover, where justified by requirements, accounts, groups, memberships, roles, expenses, participants, allocations, approval policies and versions, approval decisions, journal entries/postings, payments, payment allocations, reversals, corrections, receipt references, notifications, outbox messages, and audit events.

Do not add entities solely because they are fashionable. Explain any entity intentionally omitted. Identify unresolved database-specific implementation choices.

### 4.8 `interface-contracts.md`

Consolidate SpecKit interface-boundary thinking into explicit contracts for:

- presentation-to-application boundary;
- application-to-domain boundary;
- application-to-persistence boundary;
- notification dispatch boundary;
- receipt storage boundary;
- identity/authentication boundary (if externalized);
- reporting/export boundary.

For each contract define purpose, operations/commands/queries, input/output concepts, validation, authorization responsibility, error semantics, idempotency, transaction expectations, and dependency direction. Keep contracts technology-neutral unless a technology is approved.

### 4.9 `traceability-matrix.md`

Provide bidirectional traceability among:

- customer and course source statements;
- FRs, NFRs, and business rules;
- use cases;
- acceptance criteria;
- architecture components;
- domain/data entities;
- UML diagrams;
- verification methods and planned tests.

Every in-scope requirement must map to at least one design element and one verification method. Identify orphan requirements, unverified requirements, and design elements without a requirement/rationale.

Include all existing FR-001..FR-011, NFR-001..NFR-006, AC-001..AC-016, and SC-001..SC-008 if those identifiers are present in the source. Preserve, migrate, or explicitly retire identifiers with rationale; do not silently omit them.

### 4.10 `risk-and-decision-log.md`

Maintain a ranked risk register with:

- ID;
- description/cause;
- probability and impact;
- severity;
- mitigation/contingency;
- owner;
- trigger;
- status.

Include an architecture decision record (ADR) section or separate ADR files for material decisions. Each ADR must include context, options, decision/status, rationale, consequences, approver, date (use a date only when known), and affected documents.

At minimum assess the platform conflict, persistence/transaction guarantees, currency precision, financial source of truth, privacy after membership removal, receipt security, approval-policy versioning, notification delivery, course scope, reporting semantics, identity/recovery, and test evidence.

Distinguish a fixed requirement (for example, web product requirement) from a pending implementation/delivery strategy decision.

### 4.11 `plan.md`

Create a documentation-to-implementation roadmap with phases, dependencies, entry/exit criteria, deliverables, and review gates. Include requirements approval, architecture decisions, prototype/MVP, implementation, integration, verification, usability validation, and final demonstration as appropriate.

Do not imply implementation has started or that milestones are complete. Do not create source code or build configuration.

### 4.12 `quickstart.md`

Provide a concise guide for a future developer/reviewer explaining:

- prerequisites and approved toolchain (mark pending choices);
- how to navigate the documentation;
- how to render/validate PlantUML when the tool is available;
- how future implementation and tests should be organized at a high level;
- where decisions and requirement changes are recorded.

Do not invent working commands for tools that are not present or configured. Mark commands as examples if not verified.

### 4.13 `validation-checklist.md`

Include review gates for:

- requirement quality and completeness;
- source traceability;
- Constitution and course compliance;
- architecture consistency;
- data integrity and financial invariants;
- authorization/privacy;
- UML syntax and semantic consistency;
- NFR measurability and evidence;
- decision approvals;
- implementation readiness.

Use explicit statuses such as Not Started, In Review, Blocked, Passed, and Not Applicable. Do not mark a gate Passed without evidence.

## 5. Required UML and modeling deliverables

Create a dedicated `diagrams/` directory. All diagrams must be actual editable PlantUML source files (`.puml`), not screenshots or prose substitutes. Include a short `diagrams/README.md` explaining purpose, scope, and cross-diagram conventions.

At minimum create the following diagrams:

1. **Use-case diagram** — actors and all major user/system use cases, with meaningful include/extend relationships only where justified.
2. **System context diagram** — system boundary, human actors, external systems, and trust boundaries.
3. **Component diagram** — presentation adapters, application/use-case layer, domain, infrastructure, persistence, notification, and receipt boundaries; show dependency direction and interfaces.
4. **Detailed class diagram(s)** — domain entities, value objects, services, policies, repositories/contracts, key attributes/operations, associations, multiplicities, inheritance/composition where appropriate. Split into multiple focused class diagrams if one diagram would be unreadable. Include explicit approval-policy/version, correction, posting, payment, allocation, receipt reference, and outbox concepts where warranted.
5. **Sequence diagrams** — at least:
   - create/submit expense and calculate allocation;
   - multi-level approval and exactly-once posting;
   - notification creation, outbox dispatch, retries, and membership/privacy recheck;
   - payment and partial payment allocation;
   - reversal/correction and approval;
   - balance/report query with authorization.
6. **State diagrams** — at least:
   - expense lifecycle;
   - approval decision/review lifecycle or approval workflow;
   - payment lifecycle;
   - correction/reversal lifecycle;
   - notification/outbox message lifecycle.
7. **Activity diagrams** — at least:
   - expense creation, validation, allocation, and submission;
   - approval routing and decision;
   - payment recording and balance update;
   - correction/reversal processing;
   - report generation/access control.
8. **Deployment diagrams** — separate alternatives for web-first/full product and Swing MVP if the platform decision remains open. Make their scope and limitations explicit. Add mobile deployment only if authoritative requirements confirm it.

Use stable names and consistent identifiers. Ensure all diagrams agree with the requirements, architecture, design, and data model.

### UML quality requirements

- Every file must have valid `@startuml` and `@enduml` delimiters.
- Use PlantUML syntax that is supported by standard PlantUML.
- Add a title and useful legend/notes where needed.
- Use consistent names, relationships, multiplicities, and state labels.
- Avoid diagram overload; split detailed views rather than making unreadable posters.
- Show exception paths and important invariants where they materially affect behavior.
- Include correction approval linkage and approval-policy versioning where required.
- Do not show a technology as selected in a deployment diagram if it remains a proposal.
- If PlantUML rendering/compilation is unavailable, state that the files were only statically inspected. Do not claim rendered validation.
- Cross-check diagrams against each other and the prose. A syntactically valid diagram can still be semantically wrong.

Suggested filenames (adapt as appropriate, retaining clear names):

- `use-cases.puml`
- `system-context.puml`
- `component-architecture.puml`
- `class-domain-core.puml`
- `class-financial-ledger.puml`
- `class-approval-and-notification.puml`
- `sequence-expense-submission.puml`
- `sequence-approval-posting.puml`
- `sequence-notification-dispatch.puml`
- `sequence-payment.puml`
- `sequence-correction-reversal.puml`
- `sequence-balance-report.puml`
- `state-expense.puml`
- `state-approval.puml`
- `state-payment.puml`
- `state-correction.puml`
- `state-outbox-message.puml`
- `activity-expense-submission.puml`
- `activity-approval.puml`
- `activity-payment.puml`
- `activity-correction.puml`
- `activity-reporting.puml`
- `deployment-web-first.puml`
- `deployment-swing-mvp.puml`

## 6. Domain and financial invariants that must be explicit

Verify each invariant against the authoritative requirements. Preserve it if supported; if unsupported or contradictory, flag it rather than silently adopting it.

At minimum review these known business rules:

- The payer is distinct from the expense participants as a role, but may or may not be one of the participants.
- If the payer is a participant, the payer's own share is netted correctly; do not double-charge the payer.
- A one-person expense may be valid if the requirements permit it; zero participants is invalid.
- Expense amounts must be positive and currency-valid.
- Equal and percentage allocations must reconcile exactly to the expense amount.
- Largest-remainder allocation must be deterministic, use currency minor units, and apply a stable tie-breaker.
- Current group membership and role permissions must be checked at the appropriate operation and data-access boundaries.
- Approval levels, approver eligibility, no self-approval, no duplicate/late decisions, and exactly-once posting must be enforced.
- Pending/rejected expenses must not create effective financial postings unless an explicitly approved rule says otherwise.
- Payment records must prevent duplicate application, support partial payment if required, and reject overpayment where specified.
- Reversals/corrections must preserve audit history and use compensating records rather than destructive edits to finalized financial facts.
- Reports must use defined inclusive/exclusive date and time-zone semantics.
- Removed members must not retain unauthorized access to group data or receive improperly disclosed notifications.
- Group owners/managers must have only the permissions actually granted by approved requirements.
- Historical records must be retained or restricted according to approved policy; do not invent retention periods.

For every invariant, identify the enforcing layer(s), persistence constraints/transaction requirement, and verification scenario.

## 7. Verification and consistency review

Before declaring the package complete:

1. Build a requirements inventory and confirm every source requirement is accounted for.
2. Check all FR, NFR, AC, SC, and business-rule identifiers against the original source documents.
3. Check each requirement has a measurable acceptance criterion and verification method.
4. Check every use case has a primary actor, preconditions, main flow, alternate/error flow, and postconditions.
5. Check all entities and relationships in the data model appear consistently in the class diagrams and relevant sequences.
6. Check every state diagram's transitions against the workflow descriptions.
7. Check sequence diagrams against component responsibilities and interface contracts.
8. Check deployment alternatives against the platform decision record.
9. Check the traceability matrix in both directions.
10. Check all unresolved choices appear in the decision log and are not presented as approved.
11. Check financial invariants, authorization, privacy, and concurrency across requirements, design, data model, and diagrams.
12. Validate PlantUML syntax with an actual renderer/compiler if available. Record tool/version and result. Otherwise mark rendering validation Not Run.
13. Review spelling, terminology, numbering, cross-links, and duplicate/conflicting statements.
14. Do not report test results, load measurements, user studies, or security validation that were not actually performed.

Create a final `reconciliation-report.md` that summarizes:

- what was consolidated from Copilot;
- what was added or retained from SpecKit;
- what was changed or rejected and why;
- requirement coverage and traceability status;
- diagram inventory and validation status;
- unresolved decisions and their approvers;
- known limitations and evidence gaps;
- whether the package is ready for stakeholder review, requirements approval, architecture approval, or implementation (these are separate gates).

The default conclusion should be **Ready for stakeholder review, not implementation-ready**, unless repository evidence and explicit approvals justify a different conclusion.

## 8. Acceptance criteria for this reconciliation task

The task is complete only when:

- the original source and generated comparison packages remain unchanged;
- all required consolidated documents exist and cross-reference one another;
- functional and nonfunctional requirements are explicit and traceable;
- business rules and financial invariants are defined or clearly marked unresolved;
- architecture and design are consistent with approved requirements and clearly label alternatives;
- the logical data model is consistent with class diagrams and workflows;
- all required UML categories exist as editable PlantUML source;
- use cases, components, detailed classes, sequences, states, activities, and deployment alternatives are represented;
- interface contracts and a future implementation/verification plan are included;
- all risks and unresolved decisions have owners/approvers or are explicitly marked TBD;
- a source inventory and reconciliation report identify exactly what was read and what could not be read;
- PlantUML and other validation claims accurately reflect what was actually run;
- no application code or executable build artifacts were created;
- no unresolved decision is disguised as an approved fact.

## 9. Final response format

When finished, report:

1. Exact consolidated directory and list of created files.
2. Source files inspected and any inaccessible files.
3. Summary of major reconciliation decisions.
4. Requirements coverage and traceability status.
5. UML diagram inventory and whether each was rendered/validated.
6. Critical unresolved decisions, approval owners, and blockers.
7. Validation performed and not performed.
8. Confirmation that no application code was implemented and original artifacts were preserved.
9. Recommended next human review actions, in priority order.

Be candid. A comprehensive document set is not automatically a correct or approved design. Clearly distinguish proposed design, stakeholder-approved decisions, and verified implementation evidence.

---

**End of prompt.**
