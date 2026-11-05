# SplitSmart Architecture

**Status**: Proposed; platform decision pending
**Scope**: Full customer product plus a separately bounded Swing MVP
**Sources**: [UserRequirement.md](../../UserRequirement.md),
the [Constitution](../../.specify/memory/constitution.md), and
[spec.md](./spec.md). The feature specification remains Draft.

## 1. Scope and authority

The customer requests a primarily web-based expense-sharing product. The
Constitution directs Java 21, Maven, Swing, JUnit 5, and PlantUML while
explicitly warning that Swing alone does not satisfy the web requirement. The
spec labels a Swing MVP subset as an implementation decision, not a complete
customer solution. The course handout additionally mentions Android and iOS;
this is a course-scope statement, not an expansion of the checked-in
`UserRequirement.md`. Project-owner/course-stakeholder confirmation is needed
before deciding whether mobile apps are delivery scope.

The design covers accounts, groups, expenses and receipts, equal/percentage
allocation, approval, notifications, pairwise balances, payments and
compensating corrections, summaries, and parameterized/date-range reports
(FR-001–FR-011; NFR-001–NFR-006). The Swing MVP's documented subset remains
limited and does not satisfy NFR-001.

## 2. Context and boundaries

Actors are individual users, group owners/managers, expense submitters,
reviewers, participants, and report viewers. Their duties and access are
enforced by application use cases, not by hiding or disabling UI controls.

**Inside the product boundary**: account lifecycle, membership and roles,
expense submission and review, allocation, financial journal, derived
balances, payment/correction history, reports, and notification orchestration.

**External or undecided boundaries**: email delivery for account
verification/password reset, notification delivery channel/provider, receipt
binary storage, hosting, persistent-storage product, browser/mobile client
technology, and operational monitoring. These are integration proposals, not
selected services.

See [system context](diagrams/system-context.puml).

## 3. Architecture drivers

| Driver | Design response | Trace |
|---|---|---|
| Customer's primary web platform | Keep full-product web client explicit; do not label Swing conformant | NFR-001, AC-012 |
| Shared and private data access | Authenticate at entry points; authorize each use case against current membership and role | FR-001–FR-004, FR-007, FR-011, NFR-006 |
| Exact, auditable financial results | `BigDecimal`; deterministic allocation; immutable journal entries; balances derived/reconciled | FR-003–FR-009, NFR-002, AC-005, AC-008–AC-009a, SC-002–SC-004 |
| Approval before posting | Explicit review state machine; transactional, one-time posting after required approvals | FR-006, AC-006, SC-003 |
| Notification timeliness without leakage | Durable event handoff and recipient authorization on delivery/read | FR-007, NFR-004, AC-007, SC-006 |
| Responsive user experience | Keep UI thin; offload remote/slow work from Swing EDT; verify web summaries against NFR-003 | NFR-003, NFR-005 |
| Framework/toolchain governance | Java 21/Maven/JUnit 5 for Java implementation, PlantUML diagrams | Constitution V, II, IV |

## 4. Logical architecture (proposal)

The design uses logical layers; they do not imply separate deployments.

1. **Presentation adapters**: Browser client for the full web path; Swing
   desktop client only for the proposed prototype; Android/iOS clients only
   if confirmed as course scope. Presentations format input/output and invoke
   application use cases. They contain no financial rules.
2. **Application/use-case layer**: Account registration/sign-in/reset,
   group/membership management, expense submission, approval, notification
   dispatch, balance queries, payment/correction submission, and reporting.
   It authenticates actors, authorizes operations, coordinates transactions,
   and returns explicit success/validation/authorization/conflict outcomes.
3. **Domain layer**: Account, Group, Membership, Expense, Allocation,
   ApprovalPolicy/Decision, JournalEntry, Payment, Correction, and Report
   query rules. Domain behavior is presentation-independent and uses
   `BigDecimal`.
4. **Infrastructure adapters**: Persistent repositories, transaction
   boundary, notification outbox/dispatcher, email/notification providers,
   receipt object storage, clock, and identity credential hashing. Provider
   and database choices are unselected.

Dependency direction is presentation → application → domain. Infrastructure
implements interfaces consumed by application/domain; domain does not depend
on Swing, web UI libraries, or provider-specific APIs. A boundary and sample
contracts are in [contracts/interface-boundaries.md](contracts/interface-boundaries.md).

## 5. Financial source of truth

**Proposal**: Accepted expense approvals, payments, and approved corrections
append immutable financial journal entries in the same transaction that
finalizes the originating record. The journal, linked to source-record IDs,
is authoritative. A pairwise balance is the net of journal entries between
two accounts. A materialized/cache balance may be introduced only as a
rebuildable projection and must reconcile to the journal.

For an expense, each participant's allocated share creates an obligation to
the payer, excluding the payer's own share (which nets to zero). For a
payment, a compensating journal direction reduces the existing obligation.
Payment/expense corrections append compensating entries; original records
are not edited or deleted. Posting uniqueness is keyed by source record and
posting kind, not by equal payment details, so distinct same-day/same-amount
payments remain valid.

The exact persistence technology, transaction isolation, journal retention,
and disaster-recovery strategy remain proposals or open decisions. Atomicity
and uniqueness semantics are requirements of the design regardless of the
eventual storage product.

## 6. Platform alternatives

| Path | Scope and conformance | Trade-offs | Decision needed |
|---|---|---|---|
| **A. Swing desktop MVP, then separately deliver web/mobile clients** | Can implement only the spec's Swing MVP subset. A desktop-only delivery fails NFR-001 and defers percentage splits, receipts, configurable/multiple approvals, custom/date-range reports, and production service objectives. Course handout's Android/iOS request also remains unmet until clients exist. | Honors the immediate Swing direction and may fit a desktop-prototype assignment; keeps first UI scope bounded. Requires a later web/mobile delivery and risks duplicated UI behavior unless service contracts/domain boundaries are shared from the start. A centralized service is still needed for multi-user group data and notifications. | Confirm whether Swing is a temporary prototype and which later clients/course deliverables are mandatory. Never waive web/mobile scope by implication. |
| **B. Web-first product with shared application service; add Android/iOS clients if confirmed** | Browser is the primary product and can cover full FR/NFR scope. Optional mobile clients can use the same application boundary if the course handout is confirmed as scope. Swing is omitted or kept only as an assignment-specific prototype. | Best direct alignment with the customer's primary-web requirement and shared multi-user use cases. Requires approval for a web presentation technology not specified by the Constitution, plus delivery/deployment choices. Native mobile adds separate client work; no frameworks are selected. | Confirm whether the Constitution's Swing direction applies only to a prototype or must also be delivered, and whether Android/iOS are required by the course. |

**Conditional recommendation**: If the customer requirement is controlling the
product release, prefer Path B because it directly addresses NFR-001. If the
course requires a Swing artifact, treat it as a bounded prototype/client, not
the full product. Do not implement either path as final until the
project-owner/course-stakeholder decision is recorded.

## 7. Deployment and integration view

No physical topology is selected. For either connected-client path, the
conceptual boundary is client → authenticated application service →
transactional persistent store. A background dispatcher can deliver committed
outbox notifications. Receipt content, if attached, belongs behind an
authorized storage adapter; the expense record stores metadata/reference,
not an unrestricted public URL. Email verification/password reset and
notification channels use interfaces until a provider is approved.

The Swing prototype may run as a desktop client, but a local-only file store
would not establish shared multi-user access across separate users. Whether
the prototype is connected to a shared service or uses controlled demo data
is an unresolved implementation decision.

See [deployment alternatives](diagrams/deployment-alternatives.puml) and
[logical architecture](diagrams/logical-architecture.puml).

## 8. Security, privacy, reliability, and operations

- Authenticate account operations and authorize every group/record query at
  the application boundary. Re-evaluate current membership when a former
  member follows a previously delivered notification (FR-001, FR-002,
  FR-007, NFR-006).
- Require owner/manager authority for membership changes and corrections;
  enforce reviewer authorization and prohibit submitter self-approval.
- Store credentials only as salted, adaptive one-way password hashes using a
  vetted implementation selected during implementation. Never log passwords,
  reset tokens, receipt content, or unnecessary expense details.
- Treat receipt access as private group data. Validate file type/size and
  authorize every retrieval; limits, scanning, retention, and storage provider
  remain decisions.
- Make approval finalization, journal posting, and payment recording atomic.
  Use conditional state transitions and uniqueness constraints (or equivalent
  storage guarantees) to reject late/duplicate review and prevent double
  posting.
- Use an outbox-style handoff for notifications if the selected persistence
  supports a transaction spanning the business record and outbox row. Delivery
  retries must be idempotent; notification links must re-check access.
- Reconcile derived balances against journal entries. Fail a transaction
  visibly on invalid state; never return a success-shaped fallback for failed
  posting.
- NFR-003 and NFR-004 are test targets, not verified claims. Availability,
  backup/recovery, audit retention, monitoring, and incident-response targets
  are not specified and need stakeholder/operations decisions.

## 9. Architecture risks and open decisions

See [risk-and-decision-log.md](./risk-and-decision-log.md). P0 decisions are
the web/Swing/mobile scope, chosen persistence/deployment boundary, and
currency precision. Open integration choices include notification channel,
receipt storage, email delivery, and operational recovery objectives.

## 10. Diagram inventory

- [System context](diagrams/system-context.puml)
- [Logical architecture](diagrams/logical-architecture.puml)
- [Domain model](diagrams/domain-model.puml)
- [Expense review sequence](diagrams/expense-approval-sequence.puml)
- [Payment/balance sequence](diagrams/payment-balance-sequence.puml)
- [Deployment alternatives](diagrams/deployment-alternatives.puml)

All diagrams are source, not screenshots. They are conceptual and show
proposals separately from selected requirements.
