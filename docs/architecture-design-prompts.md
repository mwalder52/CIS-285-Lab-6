# SplitSmart Architecture & Design Generation Prompts

**Repository:** `mwalder52/CIS-285-Lab-6`  
**Feature:** `001-shared-expense-tracking`  
**Purpose:** Generate architecture and design independently with SpecKit and GitHub Copilot, then use ChatGPT as an independent reviewer to compare and cross-check both sets of artifacts.  
**Status:** Working draft — review and edit before merging into `main`.

---

## 1. Workflow and ground rules

### Source-of-truth documents

Both generators must use the same baseline documents from the repository:

1. `UserRequirement.md` — original customer request; authoritative for what the customer asked for.
2. `.specify/memory/constitution.md` — project principles, constraints, and governance.
3. `specs/001-shared-expense-tracking/spec.md` — clarified feature specification, including functional requirements, non-functional requirements, acceptance criteria, entities, assumptions, and open questions.
4. `Lab_6_Requirement.docx` — course/lab assignment requirements, if relevant to the architecture/design deliverables. Read it if the environment supports it; do not guess its contents if it cannot be read.

The feature specification is currently marked **Draft**. Do not describe it as approved or final.

### Non-negotiable rules for both generators

- Work from the same source documents and feature branch. Do not use one generator's outputs as input to the other.
- Do not edit `UserRequirement.md`, the Constitution, or the clarified `spec.md`.
- Do not implement the application, generate Java source code, create a database, or modify build configuration. This task is architecture and design documentation only.
- Do not invent customer requirements, technologies, business rules, service levels, or decisions.
- Clearly label each statement as one of:
  - **Customer requirement** — explicitly present in `UserRequirement.md` and/or preserved in the specification's customer requirements inventory.
  - **Constitutional constraint** — required by `.specify/memory/constitution.md`.
  - **Clarified specification requirement** — defined in the clarified `spec.md`.
  - **Implementation decision/proposal** — a design choice made to realize requirements.
  - **Assumption** — used provisionally because a decision is missing.
  - **Open question / decision required** — cannot be safely decided from current sources.
- Preserve traceability. Every significant architectural component and design decision must identify the requirements and/or constitutional principles it supports.
- Use Java `BigDecimal` for all monetary values and calculations. Never use `float` or `double` for money.
- Respect separation of presentation, application/domain behavior, and persistence/infrastructure. Swing event handlers must not contain business calculations or domain rules.
- Use Java 21, Maven, JUnit 5, and PlantUML as stated implementation constraints, while clearly identifying the web-platform conflict below.
- Keep diagrams consistent with the written architecture and design. PlantUML source files must be included; diagrams must not be the only explanation.
- Do not claim that a design satisfies a requirement unless the design actually addresses it. Explicitly identify partial coverage, deferred scope, and non-conformance.
- When information is missing, document the gap and its impact. Do not silently fill it with an invented decision.

### Critical platform alignment issue — must remain visible

The customer requires a **primarily web-based** product (NFR-001). The Constitution names **Java Swing** as the implementation direction and explicitly says Swing is not, by itself, evidence that the web requirement is met. The specification also defines a **Java Swing MVP subset** and explicitly says that a Swing-only implementation does not satisfy NFR-001 or the complete customer request.

Therefore:

1. Analyze the **full customer product** separately from the **proposed Swing MVP subset**.
2. Do not describe the Swing MVP as the complete customer solution or as web-based.
3. Do not unilaterally decide that the web requirement is waived.
4. Present the platform conflict as a material architecture decision requiring project-owner/course-stakeholder confirmation.
5. Explain at least two feasible paths, such as:
   - a Swing desktop MVP/prototype followed by a separately designed web product; or
   - a web-first product architecture, with Java/Swing retained only if the assignment specifically requires a desktop prototype.
6. For each path, state what requirements it satisfies, what it defers or fails to satisfy, major technical implications, and what decision/approval is needed.
7. Keep the recommendation conditional if the sources do not authorize a final choice.

### Business rules that architecture/design must preserve

At minimum, reflect these clarified rules accurately:

- The payer is distinct from the expense participants; the payer may also participate. The payer is reimbursed only for other participants' shares, not their own share.
- Payer and participants must be current group members when an expense is submitted; at least one participant is required.
- Amounts must be positive and respect the group's currency precision.
- Equal and percentage splits are supported in the full specification. Percentage shares are nonnegative and total exactly 100%.
- Allocation must reconcile exactly to the expense total. Fractional-minor-unit remainders use the largest-fractional-remainder method, with ties broken by ascending stable participant account identifier.
- Pending and rejected expenses do not change balances. An expense changes balances only after all required approvals, exactly once.
- Submitters cannot approve their own expenses. Approval levels, reviewer authorization, duplicate/late decisions, and rejection behavior must be respected.
- New-expense notifications go to current group members other than the submitter, without exposing group details to unauthorized or removed members.
- Pairwise balances derive from approved expenses and recorded payments.
- Partial payments are allowed; a payment greater than the current amount owed is rejected without changing history or balances.
- Recorded payments are not edited/deleted in place. Corrections are separate, authorized, reviewed compensating records; a reversal cannot exceed the original payment's unreversed amount.
- Only the owner or manager can add/remove group members. A removed member loses access to current and historical group-only information; remaining authorized members retain history and obligations.
- Expense/payment dates are calendar dates no later than today. Report date boundaries are inclusive and start date cannot be after end date.
- The initial model assumes one currency per group until multi-currency requirements are confirmed.

---

## 2. Prompt for SpecKit — architecture and design

### How to use

Run this prompt in the SpecKit workflow for feature `001-shared-expense-tracking`. Use the repository's installed SpecKit planning command (normally `/speckit.plan`) and follow the workflow's own template and validation conventions. If the command requires a short description, use:

> Create the architecture and detailed design for SplitSmart from the existing Constitution and clarified feature specification. Preserve customer requirement traceability, distinguish the full web-based product from the proposed Java Swing MVP, and document the unresolved platform decision.

If SpecKit generates its standard planning artifacts, retain them. Add the explicit architecture/design artifacts listed below if the standard workflow does not create them. Do not run implementation or task-generation commands as part of this activity.

### Full prompt

```text
You are acting as the software architect and design analyst for the CIS-285 SplitSmart term project. Produce a rigorous, reviewable architecture and design package for feature 001-shared-expense-tracking.

FIRST: inspect and read these repository files completely:
- UserRequirement.md
- .specify/memory/constitution.md
- specs/001-shared-expense-tracking/spec.md
- Lab_6_Requirement.docx, if readable in this environment
- relevant SpecKit templates and project conventions

Treat UserRequirement.md as the authoritative record of the original customer request. Treat the Constitution as binding project governance and constraints. Treat the clarified spec.md as the current detailed, but still Draft, functional/non-functional specification. Do not change any of these source files.

IMPORTANT PLATFORM CONFLICT:
The customer requires a primarily web-based product (NFR-001), while the Constitution establishes Java 21, Maven, Java Swing, JUnit 5, and PlantUML as implementation direction. The Constitution and spec explicitly state that a Swing-only application does not meet the web-based customer requirement. Do not hide, waive, or resolve this conflict by assumption. Architect the full customer product and the proposed Swing MVP as distinct scopes. Present at least two feasible platform/architecture paths, compare their conformance and trade-offs, and identify the project-owner/course-stakeholder decision required. A Swing MVP may be described as a limited prototype/subset only; never claim it is the full web product.

SCOPE:
Create architecture and design documentation only. Do not generate Java implementation code, database scripts, executable application files, or modify source requirements. Do not generate implementation tasks unless the SpecKit planning workflow requires a plan artifact; if it does, keep it at architecture/design planning level and do not turn it into coding tasks.

REQUIRED OUTPUTS:
Use the existing feature directory specs/001-shared-expense-tracking and the installed SpecKit conventions. Produce the applicable standard SpecKit planning artifacts (for example plan.md, research.md, data-model.md, contracts/, and quickstart.md, as supported by this repository's templates/workflow). In addition, ensure these explicit deliverables exist:

1. architecture.md
   - system context and scope boundaries
   - architecture drivers and quality attributes
   - proposed logical architecture and component responsibilities
   - presentation, application/use-case, domain, and infrastructure/persistence boundaries
   - deployment/runtime view for each platform path considered
   - external systems and integration boundaries (identity/email, notifications, receipt storage, etc.); mark unconfirmed integrations as proposals
   - security, privacy, authorization, auditability, reliability, maintainability, and performance considerations
   - architectural risks, trade-offs, assumptions, constraints, and unresolved decisions
   - explicit comparison of full web-based product versus Java Swing MVP
   - conditional recommendation and decision gate for the platform conflict

2. design.md
   - design principles and major design decisions (ADRs or an equivalent decision table)
   - module/package responsibilities and dependency direction
   - core domain model and relationships
   - key use-case flows: account registration/sign-in/password reset; group creation/membership/manager permissions; expense submission; review/approval/rejection; notifications; balance calculation; payment recording; correction/reversal; reports
   - validation and error-handling strategy
   - transaction boundaries and concurrency/idempotency protections, especially approval and balance updates
   - monetary representation, currency precision, rounding, and deterministic allocation algorithm
   - authorization rules and removed-member access behavior
   - testing strategy mapped to JUnit 5 and the requirement set
   - identify which design elements are full-product requirements versus Swing-MVP-only choices

3. data-model.md
   - entities, attributes, identifiers, relationships, cardinalities, lifecycle/statuses, and important constraints
   - include User, Group, Membership/Role, Expense, Participant/Allocation, Approval/Decision, Notification, Balance/Ledger or equivalent, Payment, Correction/Reversal, and Report concepts where justified
   - distinguish conceptual model from any proposed physical persistence model
   - explain how immutable financial history and compensating records preserve auditability
   - do not assume a database product unless the source documents require one

4. diagrams/ (PlantUML source files, at minimum)
   - system context diagram
   - container/component or layered architecture diagram
   - domain/class diagram
   - expense submission and approval sequence diagram
   - balance/payment sequence diagram
   - deployment diagram(s) for the platform alternatives
   Ensure every diagram is valid PlantUML source and consistent with the prose. Use separate diagrams when one diagram would mix the web product and Swing MVP in a misleading way.

5. research.md
   - record important technical investigations and the basis for recommendations
   - distinguish verified facts from assumptions
   - do not fabricate benchmark results or cite sources that were not actually consulted
   - if external research is unavailable, state that and list questions to investigate

6. contracts/ and quickstart.md, if supported by the project workflow
   - contracts should define proposed API/interface boundaries at a technology-neutral or appropriately qualified level; do not invent finalized endpoints as customer requirements
   - quickstart should describe the intended development/setup path only to the extent supported by the actual repository/toolchain; mark unverified steps

ARCHITECTURE AND DESIGN QUALITY:
- Trace each significant component, data entity, interface, and decision to relevant requirement IDs (FR-xxx, NFR-xxx, AC-xxx, SC-xxx) and/or constitutional principles.
- Include a traceability matrix mapping every FR and NFR to architecture components, design elements, and planned verification approach. Explicitly mark requirements deferred from the Swing MVP.
- Preserve the full customer feature set. Do not drop percentage splits, receipts, configurable/multi-level approval, custom/date-range reporting, web access, or non-functional targets merely because the Swing MVP defers them.
- Enforce BigDecimal for monetary values; specify currency scale and rounding as a configuration/decision point where not yet confirmed. Explain largest-remainder allocation and stable-ID tie-breaking. All allocations must sum exactly to the expense total.
- Explain how payer/participant separation affects ledger entries and balances.
- Define how approved expenses affect balances exactly once, and how concurrent or repeated approval decisions are prevented from double-posting.
- Define the authoritative financial record model. Avoid treating a mutable cached balance as the only source of truth; explain how balances can be derived/reconciled from approved expenses and payments.
- Address transaction atomicity, concurrent updates, audit trail, immutable finalized records, and compensating corrections.
- Define authorization at every relevant boundary, including group membership, owner/manager privileges, reviewer eligibility, submitter self-approval prohibition, and notification access.
- Separate UI concerns from domain logic. Swing listeners, if present in the MVP, must delegate to application services; domain calculations must be independently testable.
- Avoid overengineering. Justify each proposed technology and pattern; label any technology not specified by the source documents as a proposal.
- Include a risk register with probability/impact, mitigation, and owner/decision needed where possible.
- Include a decision log with status (proposed, accepted by source, or awaiting owner approval). Do not label a proposed decision as approved.
- Ensure diagrams, tables, requirements references, and prose agree.

VALIDATION BEFORE FINISHING:
1. Re-read the Constitution and spec and check for contradictions.
2. Check every original customer feature in the specification's Customer Requirements Inventory is represented in the full-product architecture.
3. Check every FR and NFR has an explicit architecture/design response or a clearly documented gap.
4. Check the Swing MVP subset is not confused with full product scope and is not claimed to satisfy NFR-001.
5. Check money uses BigDecimal and deterministic allocation; no float/double for money.
6. Check approval, notification, membership, payment correction, and removed-member rules.
7. Check diagrams against the text and each other.
8. List all unresolved decisions and their impact.
9. Report any SpecKit template/workflow limitation rather than silently omitting a deliverable.

At completion, summarize files created, key architecture decisions proposed, unresolved decisions, and validation findings. Do not modify the three source-of-truth documents.
```

### SpecKit expected result

SpecKit should produce its own planning artifacts in the feature directory, with explicit architecture/design documentation and PlantUML source. Record the exact command/workflow used and any template limitations in its summary. Do not treat a generated plan as approval of unresolved decisions.

---

## 3. Prompt for GitHub Copilot in VS Code — independent architecture and design

### How to use

Open the repository in VS Code on the same feature branch. Start a fresh Copilot Chat session. Do not paste or expose the SpecKit-generated architecture/design outputs to Copilot before it finishes. Copilot should use only the source-of-truth files listed above.

Have Copilot save its work under:

`specs/001-shared-expense-tracking/copilot/`

This keeps its artifacts separate from SpecKit's standard output and makes the comparison independent. If the folder does not exist, Copilot may create it. Copilot must not edit the source documents or SpecKit output.

### Full prompt

```text
Act as an independent senior software architect and software design reviewer for the CIS-285 SplitSmart term project. I need you to independently create an architecture and design package based on the repository's requirements. This is a separate analysis from any work generated by SpecKit.

SOURCE FILES — read these fully before designing:
1. UserRequirement.md
2. .specify/memory/constitution.md
3. specs/001-shared-expense-tracking/spec.md
4. Lab_6_Requirement.docx, if you can read it
5. Relevant repository documentation and existing conventions

SOURCE AUTHORITY:
- UserRequirement.md is the authoritative original customer request.
- .specify/memory/constitution.md defines binding project principles and implementation constraints.
- specs/001-shared-expense-tracking/spec.md is the clarified feature specification, currently Draft.
- If the sources conflict, do not choose silently. Identify the conflict, explain its effect, and mark the decision as unresolved unless a source explicitly resolves it.
- Do not use, inspect, copy, or rely on SpecKit-generated architecture/design outputs. Your analysis must be independent.

CRITICAL CONFLICT:
The customer requires a primarily web-based product (NFR-001). The Constitution names Java 21, Maven, Java Swing, JUnit 5, and PlantUML as the project's implementation direction, but explicitly warns that Swing alone does not satisfy the web requirement. The spec describes a limited Swing MVP subset and says it is not the complete customer solution. You MUST:
- distinguish the full customer product from the Swing MVP;
- compare at least two feasible platform/architecture paths;
- show the requirements each path satisfies, defers, or fails;
- identify technical, schedule, testing, and maintainability trade-offs;
- state the stakeholder decision required;
- never call a Swing-only design web-based or fully customer-compliant.

TASK:
Independently design the system architecture and detailed software design for SplitSmart. Produce documentation only. Do not implement the system, generate Java source code, create database scripts, change build files, or edit the source-of-truth documents.

OUTPUT LOCATION:
Create all your files under:
specs/001-shared-expense-tracking/copilot/

Create these deliverables:

1. architecture.md
   - architecture overview, scope, context, actors, and system boundaries
   - architecture drivers and quality attributes
   - logical layers/components and responsibilities
   - dependency rules and interface boundaries
   - full-product platform alternatives and separate Swing-MVP view
   - deployment/runtime and integration views
   - security, privacy, authorization, auditability, availability, performance, and maintainability
   - architectural risks, trade-offs, assumptions, and unresolved decisions
   - conditional recommendation; do not falsely resolve the web/Swing conflict

2. design.md
   - design principles and design decision record/table
   - module/package organization and dependency direction
   - domain model and key relationships
   - use-case workflows for accounts, groups, expenses, approvals, notifications, balances, payments, corrections, and reports
   - validation, exception/error handling, and transaction boundaries
   - concurrency, duplicate submission, idempotency, and exactly-once balance posting strategy
   - BigDecimal monetary design, currency precision, rounding, equal/percentage allocation, largest-remainder distribution, and stable-ID tie-breaking
   - authorization and privacy behavior
   - testing strategy using JUnit 5 where appropriate
   - clearly separate full-product design from Swing-MVP-only decisions

3. data-model.md
   - conceptual entities, fields, keys, relationships, cardinality, lifecycle, and constraints
   - cover User, Group, Membership/Role, Expense, Participant/Allocation, Approval/Decision, Notification, Balance/Ledger, Payment, Correction/Reversal, and Report as appropriate
   - distinguish conceptual model from a proposed persistence schema
   - describe audit history and compensating financial records
   - do not choose a database without justification and label it as a proposal

4. diagrams/
   Include editable PlantUML source for:
   - system context
   - logical/container/component architecture
   - domain/class model
   - expense submit/review/approval sequence
   - payment and balance sequence
   - deployment for the platform alternatives
   Diagrams must be consistent with the written documents. Do not use images in place of PlantUML source.

5. traceability-matrix.md
   - map every FR and NFR to components, design sections, and verification/test approach
   - identify full-product versus Swing-MVP coverage
   - identify gaps, deferrals, and unresolved decisions

6. risk-and-decision-log.md
   - architecture/design risks with impact, likelihood, mitigation, and owner/approval needed
   - decisions labeled proposed, source-constrained, or awaiting stakeholder approval
   - include the web-versus-Swing conflict as a major decision gate

7. research.md
   - record design research and rationale
   - distinguish verified information from assumptions
   - do not invent research, benchmarks, or citations

BUSINESS RULES — preserve exactly:
- Payer and participants are distinct; payer may participate; payer's own share is not owed back to payer.
- Payer and participants must be current group members at submission; at least one participant is required.
- Positive amounts only, with currency precision validation.
- Full product supports equal and percentage allocation. Percentages are nonnegative and total exactly 100%.
- Shares reconcile exactly. Use largest fractional remainder; ties by ascending stable participant account identifier.
- Pending/rejected expenses do not affect balances. All required approvals must complete; approval affects balances exactly once.
- Submitters cannot approve their own expenses. Reviewers and review levels must be authorized. Duplicate/late decisions must not change a finalized expense.
- Notify current group members other than submitter; notifications must not leak data to nonmembers or removed members.
- Pairwise balances reflect approved expenses and payments.
- Partial payments allowed; reject payment above current outstanding amount without modifying history/balance.
- Financial records are not edited/deleted in place. Corrections are separate, authorized, reviewed compensating entries. Reversals cannot exceed unreversed original amount.
- Only owner/manager can add/remove members. Removed members lose access to current and historical group-only information; remaining members retain history and obligations.
- Expense/payment dates cannot be in the future. Report date ranges are inclusive and start must not be after end.
- One currency per group is an initial assumption until confirmed.

CONSTITUTIONAL DESIGN CONSTRAINTS:
- Java 21, Maven, JUnit 5, PlantUML.
- Java BigDecimal for all money. Never float or double.
- Object-oriented design, cohesive responsibilities, encapsulated state.
- Separate GUI/presentation from domain/business rules. Swing UI events delegate to application/domain operations; business logic is not embedded in Swing components.
- Requirement traceability and human review of AI-generated artifacts are mandatory.
- Customer requirements and implementation decisions must remain distinct.

QUALITY EXPECTATIONS:
- Do not overengineer. Justify proposed patterns and technologies.
- Mark every technology not mandated by source documents as a proposal.
- Explain the source of truth for financial data and how balances are derived/reconciled.
- Address atomicity and concurrency around approvals, payment recording, and balance changes.
- Explain immutable/append-only financial history and compensating records.
- Define authorization checks at service/use-case boundaries, not only in the UI.
- Include failure cases, validation, and recovery behavior.
- Every major component and design decision must cite relevant FR/NFR/AC/SC IDs and/or Constitution principles.
- Preserve all original customer features, including web access, receipts, percentage splits, multi-level approvals, notifications, payments, balances, and custom/date-range reporting, even if some are deferred from the Swing MVP.
- Do not state a requirement is satisfied merely because a component is named in a diagram.

BEFORE FINISHING:
1. Verify every customer feature in the specification's Customer Requirements Inventory is represented in the full-product architecture.
2. Verify every FR and NFR is mapped or explicitly marked as a gap.
3. Verify the platform conflict is visible and no false compliance claim is made.
4. Verify monetary logic uses BigDecimal and deterministic allocation.
5. Verify approval and balance posting cannot double-apply.
6. Verify notification access, group removal, and correction rules.
7. Verify PlantUML source matches the documents.
8. List unresolved decisions and assumptions.
9. State any requested output that could not be completed and why.

Do not change UserRequirement.md, the Constitution, spec.md, or any SpecKit files. When finished, report the files created and a concise summary of the architecture, open decisions, and validation results.
```

### Copilot expected result

Copilot's artifacts must remain under `specs/001-shared-expense-tracking/copilot/`. Do not move them into the SpecKit output locations until the independent comparison is complete.

---

## 4. Prompt for ChatGPT — compare, report, and cross-check both outputs

### How to use

Run this prompt only after both generators have completed. Make sure both output sets are available in the repository. ChatGPT should inspect the source documents and both output sets directly. If the files are on different branches, provide the branch names or make both sets accessible.

### Full prompt

```text
Act as an independent principal software architect, requirements analyst, and design quality auditor for the CIS-285 SplitSmart term project.

OBJECTIVE:
Compare the architecture and design artifacts generated independently by SpecKit and GitHub Copilot. Report similarities, differences, strengths, weaknesses, omissions, contradictions, and risks. Then perform an independent cross-check against the original customer requirements, project Constitution, and clarified specification. Do not assume either generator is correct. Do not simply average or merge their proposals.

REPOSITORY:
mwalder52/CIS-285-Lab-6

SOURCE-OF-TRUTH FILES:
- UserRequirement.md
- .specify/memory/constitution.md
- specs/001-shared-expense-tracking/spec.md

SPEC KIT OUTPUT:
- The standard feature artifacts in specs/001-shared-expense-tracking/ (including plan.md, research.md, data-model.md, contracts/, quickstart.md, architecture.md, design.md, and diagrams/ where present).

COPILOT OUTPUT:
- specs/001-shared-expense-tracking/copilot/

Read the actual files. If a listed artifact is missing, record it as missing; do not infer its contents. If the two output sets are on different branches or inaccessible, ask for the branch/path or files instead of pretending to have reviewed them.

REVIEW RULES:
- UserRequirement.md is the authoritative original customer request.
- The Constitution establishes binding principles and project constraints.
- spec.md is the current clarified specification, but its status is Draft.
- Distinguish customer requirements from implementation decisions, assumptions, and proposals.
- Do not silently resolve source conflicts.
- Do not modify source documents or generated artifacts during the audit.
- Do not implement code.
- Cite exact file paths and headings/sections for every significant finding. Quote only short excerpts where needed.
- If evidence is missing, say "not demonstrated" rather than assuming compliance.

CRITICAL PLATFORM CROSS-CHECK:
The customer requires a primarily web-based product (NFR-001). The Constitution names Java 21, Maven, and Java Swing as implementation direction and warns that Swing alone does not satisfy the web requirement. The clarified spec describes a limited Swing MVP subset, not the complete customer solution. Evaluate whether each generator:
1. correctly distinguishes full customer product from Swing MVP;
2. identifies the platform conflict and its decision owner;
3. compares feasible alternatives and trade-offs;
4. avoids claiming that Swing-only satisfies NFR-001;
5. preserves all deferred features in the full-product architecture.
Treat a hidden or incorrectly resolved platform conflict as a major finding.

REQUIRED ANALYSIS:

A. ARTIFACT INVENTORY
- List every SpecKit and Copilot artifact found.
- Identify missing expected artifacts, incomplete diagrams, empty files, and mismatched versions.
- Confirm both generators used the same source baseline, to the extent repository evidence permits.
- Note any cross-contamination (one output appears to rely on the other's output) if evident.

B. EXECUTIVE COMPARISON
- Summarize the overall quality and readiness of each output.
- Identify the strongest aspects of each.
- Identify the most important omissions or errors.
- State whether either package is ready for human approval. Do not approve on the user's behalf.

C. SIDE-BY-SIDE COMPARISON
Compare both generators on:
1. requirement interpretation and traceability;
2. platform strategy and web/Swing conflict;
3. architecture style, layers, components, and dependency direction;
4. domain model and entity relationships;
5. monetary arithmetic and allocation design;
6. expense review/approval workflow;
7. notifications and authorization;
8. balances, ledger/source of truth, and payment processing;
9. correction/reversal and auditability;
10. reporting;
11. security, privacy, and access control;
12. reliability, performance, concurrency, and idempotency;
13. deployment, integration, and technology choices;
14. testing and verification;
15. PlantUML quality and consistency;
16. assumptions, open questions, risks, and decision records.

For each topic, state:
- SpecKit's approach and evidence;
- Copilot's approach and evidence;
- what agrees;
- what differs;
- which approach is better supported by source requirements and why;
- any unresolved question.

D. REQUIREMENTS CROSS-CHECK
Create a traceability audit covering:
- every FR-001 through FR-011;
- every NFR-001 through NFR-006;
- every original customer feature in the Customer Requirements Inventory;
- relevant acceptance criteria AC-001 through AC-016 and success criteria SC-001 through SC-008 where applicable.

For each item, report:
- required behavior/constraint in concise terms;
- SpecKit coverage (file/section and assessment);
- Copilot coverage (file/section and assessment);
- verdict: covered, partially covered, missing, contradicted, or not verifiable;
- recommended correction.

Do not mark coverage as complete merely because a requirement ID appears in a table. Verify that the proposed design actually implements the behavior and handles its important edge cases.

E. CONSTITUTION COMPLIANCE AUDIT
Check both outputs for:
- customer requirements remain distinct from implementation decisions;
- cohesive object-oriented design and encapsulated state;
- GUI/business logic separation;
- BigDecimal for all monetary values; no float/double for money;
- Java 21/Maven/JUnit 5/PlantUML alignment where applicable;
- traceability;
- human review of AI-generated output;
- governance and explicit handling of deviations.

F. BUSINESS-RULE AND EDGE-CASE AUDIT
Independently verify both designs address:
- payer separate from participants, including payer-as-participant and payer-not-participant;
- one participant allowed, zero participants rejected;
- current-member checks for payer and participants;
- positive amounts and currency precision;
- equal and percentage splits;
- largest-remainder rounding and stable-ID tie-breaking;
- all allocations reconcile exactly;
- pending/rejected expenses never post to balances;
- all required approval levels, no self-approval, no duplicate/late approval, and exactly-once posting;
- notification recipients and removed-member privacy;
- owner/manager membership permissions and retained obligations after removal;
- partial payment, overpayment rejection, and payment dates;
- immutable original records and compensating corrections/reversals;
- report inclusive date range and invalid range handling;
- account and group data access restrictions.

G. ARCHITECTURE RISK REVIEW
Identify risks such as:
- web/Swing platform mismatch;
- unclear deployment topology;
- technology choices unsupported by the assignment;
- weak domain/application/presentation separation;
- mutable balances without an authoritative ledger;
- race conditions or double posting;
- inadequate financial audit trail;
- access-control leakage through notifications or historical records;
- incomplete receipt storage/security design;
- unverified external integrations;
- non-functional requirements without a verification strategy.

Rank each risk by severity (Critical/High/Medium/Low), explain evidence, and propose a practical mitigation or decision.

H. RECOMMENDED CONSOLIDATED DIRECTION
Recommend the strongest elements from both outputs, but preserve source authority:
- state which design choices should be retained;
- state which should be revised or rejected;
- list decisions that require human/project-owner/course-stakeholder approval;
- identify any architecture gaps that must be closed before implementation;
- do not silently resolve the web/Swing conflict;
- distinguish a design for the Swing MVP from a design for the complete customer product.

I. ACTIONABLE CORRECTION PLAN
Provide a prioritized list:
- P0: blockers or contradictions that must be resolved before approval;
- P1: major design/traceability gaps;
- P2: quality improvements and documentation cleanup.
For each action, specify the target file, the problem, the proposed correction, and whether stakeholder approval is required.

J. FINAL VERDICT
Choose one:
- Neither package is ready;
- SpecKit is stronger but requires corrections;
- Copilot is stronger but requires corrections;
- Both are comparable but require consolidation;
- One package is ready for human review (not automatic approval).

Explain the verdict with evidence. Do not state that the system is ready to implement unless requirements, platform direction, critical architecture decisions, and traceability are sufficiently resolved.

OUTPUT FORMAT:
1. Executive summary.
2. Artifact inventory.
3. Comparison scorecard (0-5 per category, with short rationale; score evidence quality, not writing style).
4. Side-by-side topic comparison.
5. Requirements traceability audit table.
6. Constitution compliance audit.
7. Business-rule/edge-case audit.
8. Risk register.
9. Recommended consolidated architecture/design direction.
10. Prioritized correction plan.
11. Final verdict and outstanding stakeholder decisions.

Be precise, evidence-based, and candid. Do not invent file contents or decisions. A polished document with unsupported assumptions must score lower than a less polished document that is accurate and traceable.
```

---

## 5. Suggested execution sequence

1. Review and edit this prompt document before using it.
2. Run SpecKit first using the SpecKit prompt. Save its outputs in the feature directory using the installed workflow conventions.
3. Do not show SpecKit's outputs to Copilot.
4. Start a fresh Copilot Chat session and run the Copilot prompt. Keep all Copilot outputs in `specs/001-shared-expense-tracking/copilot/`.
5. Confirm both sets of files are saved and accessible.
6. Run the ChatGPT comparison prompt only after both generators are finished.
7. Review ChatGPT's findings yourself. Resolve stakeholder decisions, especially the web-versus-Swing platform direction, before treating the architecture as approved.
8. Update the chosen architecture/design artifacts only after the independent comparison and human review.

## 6. Review checklist

- [ ] Both generators used the same versions of UserRequirement.md, constitution.md, and spec.md.
- [ ] Neither generator edited the source-of-truth documents.
- [ ] SpecKit and Copilot worked independently.
- [ ] Full product scope is distinguished from the Swing MVP subset.
- [ ] Web-based customer requirement is not silently waived.
- [ ] Every FR and NFR is mapped to architecture/design and verification.
- [ ] Money uses BigDecimal and deterministic allocation.
- [ ] Approval, notification, membership, balance, payment, correction, and reporting rules are preserved.
- [ ] PlantUML source files agree with the written design.
- [ ] All assumptions and open decisions are visible.
- [ ] Human review is completed before accepting or implementing AI-generated design.

---

**Draft note:** This document contains prompts and review instructions only. It is not an approved architecture, a final technology decision, or authorization to waive any customer requirement.
