# SplitSmart Architecture

**Status:** Independent design proposal; not approved  
**Specification status:** Draft  
**Scope:** Full customer product and proposed Java Swing MVP are separate scopes.  
**Authority:** [UserRequirement.md](../../../UserRequirement.md), [Constitution](../../../.specify/memory/constitution.md), [feature specification](../spec.md), and [Lab 6 assignment](../../../Lab_6_Requirement.docx). This package was prepared without consulting SpecKit-generated outputs.

## 1. Executive architecture summary

SplitSmart needs a shared domain core for identity, group membership, expenses, approval, allocations, financial postings, payments, and reporting, with access controls applied at application-service boundaries. Presentation and infrastructure adapt that core; neither may own financial rules. Java 21, Maven, JUnit 5, PlantUML, `BigDecimal`, and separation of GUI from domain logic are source-constrained (Constitution, Principles II–V; FR-003–FR-011).

The customer asks for a **primarily web-based** product (NFR-001). The Constitution also directs Java Swing for this project and explicitly warns that Swing alone is not web conformance. The lab DOCX additionally names Android and iOS apps, which are absent from `UserRequirement.md` and the feature specification's customer inventory. Therefore:

- A Swing desktop MVP can be a limited prototype, not the complete or web-compliant product.
- A web-first full-product path is the strongest fit to the customer requirement; web-client technology and how the Java/Swing course constraint applies remain undecided.
- Native mobile scope is an assignment-source discrepancy requiring confirmation before it is treated as committed product scope.

No platform path is approved here. See [risk-and-decision-log.md](risk-and-decision-log.md).

## 2. Scope, actors, and context

### Full customer product

The full product covers individual accounts, groups and member roles, equal and percentage expense splits, optional receipts, configurable one-or-more-level reviews, notifications, pairwise balances, payment recording and reviewed corrections, summaries, custom/date-range reports, and primary web access (FR-001–FR-011; NFR-001–NFR-006; Customer Requirements Inventory). The lab DOCX also names Android and iOS apps; whether those are additional required clients is open.

### Swing MVP subset

The proposed subset uses a Swing presentation for account/group workflows, equal splits, one reviewer, in-app notices, payments, and basic summaries. It defers web access, percentage splits, receipts, configurable/multiple review levels, custom date-range reporting, and production-scale targets (specification, “Java Swing MVP Subset”). It must not be represented as satisfying NFR-001 or the full customer request.

### Actors and external boundaries

| Actor/system | Responsibility and boundary | Trace |
|---|---|---|
| Individual / group member | Own account, group-scoped activities, expenses, payments, summaries | FR-001–FR-011 |
| Owner / manager | Membership and correction authority; owner configures review policy | FR-002, FR-006, FR-009 |
| Reviewer | Authorized decisions at configured levels; cannot review own submission | FR-006 |
| Browser client | Full-product presentation; client is unselected proposal | NFR-001, NFR-005 |
| Swing desktop client | MVP presentation only; listeners delegate to application services | Constitution II; MVP subset |
| Identity/email provider | Email verification, sign-in support, password reset delivery; provider is unselected proposal | FR-001 |
| Notification delivery | In-app and/or external channel; channel/provider undecided | FR-007, NFR-004 |
| Receipt object store | Optional image storage; technology, retention, and limits undecided | FR-003 |
| Persistence adapter | Durable account, group, workflow, and financial history; database is unselected | FR-001–FR-011 |

System context and logical boundaries are shown in [system-context.puml](diagrams/system-context.puml) and [logical-architecture.puml](diagrams/logical-architecture.puml).

## 3. Architecture drivers and quality attributes

| Driver | Architecture response | Verification |
|---|---|---|
| Primary web access | Full-product browser client is a distinct presentation over authenticated application interfaces. Swing is only an MVP option. | Browser acceptance test (AC-012); platform decision |
| Exact and repeatable money | `BigDecimal`, explicit currency scale, deterministic largest-remainder allocation; no binary floating point. | Allocation/property tests and reconciliation (NFR-002, AC-013, SC-002) |
| Financial correctness and audit | Immutable source records and append-only financial postings; derive/reconcile balances from approved activity. | Independent ledger reconciliation, correction and exactly-once tests (AC-006, AC-008–AC-009a, SC-003–SC-004) |
| Privacy and group authorization | Authenticate and authorize each use case; evaluate current membership on every protected read, including notification-link access. | Negative access tests after removal (NFR-006, AC-001–AC-002, AC-007, SC-008) |
| Configurable review | Versioned group policy and explicit level decisions; atomic finalization and posting. | Concurrent/repeated reviewer tests (FR-006, AC-006) |
| Responsiveness and notification timeliness | Measure against the specified workload; use indexes/caching only after measurement. Durable asynchronous delivery is a proposal, not a confirmed channel. | 100 concurrent users, 15 minutes; notification latency test (NFR-003–NFR-004, AC-014–AC-015) |
| Usability | Keep expense entry, review state, and resulting balance discoverable in each approved client. | Representative usability test (NFR-005, AC-016) |
| Maintainability / course alignment | Cohesive Java object model, narrow interfaces, independent domain tests, Maven and JUnit 5 (where Java implementation applies). | Design review and automated tests (Constitution II, V) |

Availability objectives are not specified. Do not promise uptime or recovery objectives without stakeholder agreement.

## 4. Logical architecture and responsibilities

1. **Presentation adapters (proposal per platform):** Browser, Swing MVP, and any later mobile client render state and collect input. They perform presentation-only validation and call application interfaces; they contain no allocation, authorization, review, or balance rules.
2. **Application/use-case services:** Authenticate caller context; authorize current group role; validate request invariants; orchestrate account, membership, expense, review, payment, correction, and report use cases; define transaction boundaries. No framework is mandated.
3. **Domain:** Cohesive entities/value objects and policies for membership, review transitions, allocation, financial postings, payment limits, reversal limits, and report-range rules. Domain behavior is independent of Swing, browser frameworks, storage, and delivery providers.
4. **Ports/interfaces:** Explicit repository, identity, clock, notification, and receipt-storage boundaries. These are proposed boundaries, not finalized API endpoints or customer requirements.
5. **Infrastructure adapters:** Persist immutable records; implement transactions/uniqueness; integrate selected identity, email, notification, and receipt services. No database or vendor is selected.
6. **Reporting/read model:** Query authorized underlying records and provide summaries. A derived/cached balance may accelerate reads but is never the sole financial source of truth.

Dependency direction is presentation → application → domain; infrastructure implements application/domain-facing ports. Domain must not depend on UI, database, network, or vendor types. Each significant boundary supports FR-001–FR-011 and Constitution II/IV; see [design.md](design.md).

## 5. Financial source of truth

The authoritative record is the immutable set of submitted expenses, review decisions, approved corrections, payment records, approved reversals/adjustments, plus their immutable financial postings. Pending/rejected source records create no balance postings. A finalized approval and its unique postings commit atomically. Pairwise balances are derived by netting postings and payments; a materialized balance is only a rebuildable projection. Reconciliation compares the projection with the authoritative records (FR-006, FR-008–FR-009; AC-006, AC-008–AC-009a; SC-003–SC-004).

When payer is a participant, that participant's own allocated share creates no debt back to the payer. Each other participant's share creates a debtor-to-payer obligation. This prevents reimbursement of the payer's own share (FR-003, AC-003, AC-008).

## 6. Platform alternatives

Technologies not named in source documents are proposals. Neither option resolves the conflict by itself.

| Path | Scope and conformance | Trade-offs / implications | Decision required |
|---|---|---|---|
| **A. Swing prototype first, web product later** | Swing covers only the expressly listed MVP subset. It does **not** satisfy NFR-001, percentage splits, receipts, multi-level review, custom/date-range reporting, or production-scale targets. | Lowest immediate deviation from the Swing course direction; the domain core can be reused, but the desktop UI does not become a web product. A later web client, deployment, identity/session boundary, and web-specific verification remain additional work. Mobile apps in the lab DOCX are also not delivered. | Owner/course stakeholder must confirm the prototype is acceptable as an intermediate deliverable and identify web/mobile follow-on scope, ownership, and acceptance gate. |
| **B. Web-first full-product architecture** | Browser is the primary client and is the only path directly aligned with NFR-001. Design covers the full customer features; conformance remains unproven until implemented and tested. | Requires a web presentation, server/runtime/deployment, secure session/API boundaries, and delivery/operations choices. The Java 21 direction can inform the server/domain, but Java Swing cannot implement a browser UI. A Swing prototype may be retained only if the assignment separately requires it. Native mobile clients from the DOCX add scope and need confirmation. | Owner/course stakeholder must decide how Java/Swing constraints apply to a web product and whether Android/iOS clients are required. Select web stack and deployment only after that decision. |

**Conditional recommendation:** Prefer Path B for the complete customer product because only a browser-primary experience can target NFR-001. Use Path A only as an explicitly limited course prototype with an agreed web follow-up; do not call it customer-complete. This is a recommendation, not approval (NFR-001; Constitution I; AC-012).

## 7. Runtime, deployment, and integration

- **Web-first proposal:** browser → authenticated application boundary → Java 21 application runtime (technology/framework unselected) → persistence adapter and optional receipt store. Identity/email and notification delivery are external ports. A deployment diagram is in [deployment-web-first.puml](diagrams/deployment-web-first.puml). This is a conceptual view, not a selected topology.
- **Swing-first proposal:** Java 21 desktop client → application/domain layer, with durable persistence and any shared identity/notification service requiring a topology decision. A single-user local store would not satisfy shared cross-user behavior without a synchronization service; do not assume one. Diagram: [deployment-swing-mvp.puml](diagrams/deployment-swing-mvp.puml).
- **Mobile:** if confirmed by the course/customer, mobile clients should call the same authorized application boundary rather than duplicate financial rules. Native framework, offline behavior, and synchronization are unselected proposals/open questions.
- **Receipts:** store image bytes behind an access-controlled object-storage port; keep only a reference/metadata in the expense record. Encryption, file type/size limits, malware scanning, retention, and deletion policy require security/product decisions. This is a proposal, not a finalized integration.
- **Notifications:** recipient set is current group members except submitter at submission. A delivery event may be queued durably and retried; delivery is idempotent per expense/recipient. Every click/read rechecks current authorization, so old messages cannot restore removed-member access. Channel/provider remains open (FR-007, AC-007, NFR-004).

## 8. Security, privacy, reliability, and operations

- **Authentication:** verified email and password with reset through verified email are required; credential hashing, session/token scheme, verification expiry, rate limits, and identity provider are implementation choices to confirm (FR-001, AC-001).
- **Authorization:** enforce account ownership and current group membership at each service boundary, not just in clients. Owner/manager permissions, reviewer level eligibility, submitter self-review prohibition, and correction authority are separate checks. Removing membership immediately invalidates subsequent group reads, including history, report, receipt, and notification detail access. Keep outstanding obligations visible to remaining members (FR-002, FR-006–FR-007, FR-009, NFR-006).
- **Privacy:** minimize notification payloads; do not put protected expense details in publicly accessible links. Receipt downloads use authorization checks. Logs must not expose credentials or receipt contents. Log security/audit identifiers and outcomes, with retention and privacy policy to be approved.
- **Auditability:** preserve actor, timestamp, record reference, policy/version context, decision and correction lineage. Do not edit/delete finalized financial records in place; corrections are reviewed compensating records.
- **Atomicity / concurrency:** serialize or conditionally update the expense state transition; accept a reviewer decision only if the expected pending state, policy version, reviewer, and level remain valid. In one transaction, store final decision and all postings under a unique source-posting key. Payment validation and payment insertion/posting must be atomic against the same current outstanding balance. Conflict/duplicate outcomes are explicit, with no partial state. Database-specific locking/isolation is not chosen.
- **Reliability:** durable notification outbox/retry and idempotent consumers are proposals for NFR-004. A failed delivery is observable/retryable and must not roll back an already committed expense; expose delivery status to operations, not a false success signal. Backups, recovery objectives, and operational ownership are unresolved.
- **Performance:** measure the exact 100-user/15-minute threshold for summary and report requests; verify p95 <= 2 seconds. Avoid premature caching. Derived balances must be invalidatable/rebuildable and reconciliation monitored. Performance evidence is not available at design time (NFR-003, AC-014, SC-005).
- **Maintainability:** keep allocation, authorization, and state transitions in independently testable domain/application code; test the same rules through every client. Human review remains mandatory (Constitution II, IV, VI).

## 9. Risks and open decisions

See the ranked [risk register and decision log](risk-and-decision-log.md). Highest-impact items are:

1. Unresolved web/Swing direction and unconfirmed Android/iOS course scope.
2. Currency set/precision and group currency-change policy.
3. Persistence, deployment, identity, notification channel, and receipt security choices.
4. Approval policy changes while expenses are pending; define policy snapshot/effective-date behavior.
5. Report parameters, time/date interpretation, and acceptable service objectives.

No production architecture is approved until platform direction and material product decisions are confirmed.
