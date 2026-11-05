# SplitSmart Detailed Design

**Status:** Independent proposal for human review; not approved  
**Specification status:** Draft  
**Scope:** Full product and Swing MVP choices are distinguished throughout. See [architecture.md](architecture.md) and [the feature specification](../spec.md).

## 1. Design principles

1. Domain state and invariants are encapsulated in cohesive types; UI components are adapters only (Constitution II).
2. Customer requirements and implementation choices remain distinguishable (Constitution I).
3. `BigDecimal` is used for every monetary amount/calculation; no `float` or `double` (Constitution III).
4. Financial source records are immutable after finalization; corrections add reviewed compensating records.
5. Authorization is enforced by use cases on every request, not trusted to a client.
6. A report, balance view, or cache is a projection of authoritative records, not a replacement for them.
7. Java 21, Maven, JUnit 5, and PlantUML are source-constrained; every other technology named below is a proposal (Constitution V).

## 2. Modules and dependency direction

Package names below are proposed organization, not repository files or a settled physical layout.

| Proposed module/package | Responsibility | Must not do | Trace |
|---|---|---|---|
| `presentation.web` | Full-product browser-facing screens and request mapping | Own domain rules or trust client-supplied identity/roles | NFR-001, NFR-005 |
| `presentation.swing` | MVP views and event handlers that invoke application use cases | Calculate shares, approve directly, or update balances | Constitution II; MVP subset |
| `application.identity` | Register, verify, authenticate, reset password; caller context | Expose credentials to logs or domain objects | FR-001, AC-001 |
| `application.groups` | Create group, membership, roles, membership removal and access guards | Permit client-only authorization | FR-002, NFR-006 |
| `application.expenses` | Validate/submit expense; snapshot allocation and review policy | Post pending/rejected expenses | FR-003–FR-006 |
| `application.reviews` | Validate reviewer/level, record decisions, finalize atomically | Allow submitter approval or repeat/late decision | FR-006 |
| `domain.money` | Currency amount/precision rules, equal/percentage allocations | Use binary floating point or implicit rounding | FR-003, FR-005, NFR-002 |
| `domain.ledger` | Immutable postings and pairwise balance derivation | Treat mutable balance as financial truth | FR-003, FR-008–FR-009 |
| `application.payments` | Record payment, validate current obligation, authorize correction | Edit/delete a recorded payment | FR-009 |
| `application.notifications` | Enqueue authorized recipient notices | Leak detail to removed/nonmembers | FR-007 |
| `application.reporting` | Authorized summaries and inclusive date-range reports | Return records beyond caller's scope | FR-010–FR-011 |
| `infrastructure.*` | Implement persistence, identity, clock, notification, receipt ports | Change domain semantics | All, Constitution II |

Dependency: presentation → application → domain. Infrastructure implements ports consumed by application services. `domain` has no dependency on frameworks, Swing, persistence, or network APIs.

## 3. Domain model

The conceptual entities and lifecycle constraints are in [data-model.md](data-model.md); [domain-model.puml](diagrams/domain-model.puml) is a corresponding view.

Important relationships:

- `Expense.payerId` is independent of its non-empty `Allocation` collection; payer may occur in that collection.
- An allocation records a participant and the final exact share. Allocation rows sum to the original total at group currency scale.
- A group approval policy defines one or more levels and reviewer eligibility; each decision is unique per expense, reviewer, and level.
- An approved expense or correction creates one immutable set of financial postings. Payments and approved reversals are separately identifiable records/postings.
- `Balance` is computed by netting postings for a pair of accounts. It is not authoritative mutable state.
- `Notification` records recipient and expense reference; retrieval revalidates current authorization.

## 4. Monetary and allocation design

### Currency and values

- Represent amount, share, payment, posting, and balance as Java `BigDecimal` values with explicit currency code and scale.
- Reject nonpositive input and any amount whose fractional digits exceed the confirmed group currency scale; do not silently round input.
- Supported currencies and their scale are open decisions. Initially assume one currency per group, as the spec does. A currency change for a group with history must be disallowed unless a migration rule is approved.
- Keep allocation arithmetic exact until converting to the currency scale. Do not use `MathContext` approximations or binary floating point in allocation.

### Deterministic largest-remainder method

1. Validate amount is positive and exactly representable at group scale; validate a non-empty, duplicate-free participant set of current members.
2. Equal split: divide the exact amount in minor-unit scale into a base share and a remainder count. Give each participant the base; distribute remaining minor units in ascending stable account-ID order. Equal weights have equal fractional remainders, so this is the largest-remainder tie rule.
3. Percentage split: validate every percentage is nonnegative and the numeric `BigDecimal` sum compares equal to 100. For each participant, compute the exact unrounded quota `total × percentage / 100`, then truncate toward zero at currency scale. Record the discarded fractional-minor remainder exactly.
4. Compute the unallocated minor-unit count as total minus truncated shares. Assign one minor unit per remaining unit in descending remainder order; break equal remainders by ascending stable participant account ID.
5. Persist the final shares and allocation method/input snapshot with the expense. Verify final shares sum exactly to total; fail explicitly if any invariant does not hold.

Because amounts and percentages are finite decimal inputs and division by 100 terminates, percentage quotas can be represented exactly with `BigDecimal`. Equal splits use integer-scale quotient/remainder semantics. For example, 0.01 split equally between IDs `A` and `B` assigns 0.01 to `A` and 0.00 to `B`. This is deterministic and value-conserving (FR-005, NFR-002; AC-005, AC-013; SC-002).

### Payer and participant accounting

For each participant other than the payer, post a claim from that participant (debtor) to the payer (creditor) equal to the participant's share. If payer is also a participant, their own share creates no payable claim; if payer is not a participant, all participant shares are claims to the payer. Then net reciprocal claims for display without losing underlying posting history (FR-003, FR-008; AC-003, AC-008).

## 5. Use-case workflows

### Account registration, sign-in, and reset

1. Validate registration fields and create an unverified account.
2. Send verification through an identity/email port; only verified email may sign in.
3. Authenticate credentials through an identity boundary and create a server-verified caller context.
4. Password reset is initiated and completed through the verified email flow; tokens are scoped, single-use, time-limited, and not logged (token specifics are proposals).
5. Each protected use case receives trusted caller identity; it never accepts an asserted account ID as authorization.

### Group creation and membership

1. Authenticated user creates group; same account becomes owner.
2. Owner may grant/revoke manager permissions. Only owner/manager can add/remove members; owner cannot be removed while group exists.
3. At expense submission, payer and every participant are rechecked as current members.
4. Removal revokes subsequent access to current and historical group-only data, including reports, receipts, and notification details. Existing financial records and unsettled obligations remain for current authorized members.
5. Membership updates and permission checks are atomic with the membership change. Invitation acceptance behavior remains unspecified.

### Expense submission

1. Authenticate submitter and authorize current membership.
2. Validate date is a calendar date no later than today, positive amount at currency precision, group currency, description, payer current membership, and at least one current participant.
3. Compute and validate deterministic allocation; store payer separately, split inputs, final allocations, and policy version.
4. Create `PENDING` expense and required review-level instances. No ledger postings or balance changes occur.
5. Create notification intents for every current group member except submitter at submission time. Delivery may be asynchronous; before showing details, re-check present authorization.
6. Commit expense, review requirements, and notification intents atomically where supported; failures are explicit and retryable.

### Review / approval / rejection

1. Application service loads pending expense and its captured policy version.
2. Verify reviewer is currently authorized for the level, is not submitter, has not decided at that level, and the expense is not finalized.
3. Record one immutable decision per reviewer/level. A rejection transitions the expense to `REJECTED`; it never posts shares. If all required levels approve, transition once to `APPROVED`.
4. In one transaction, commit final transition, final decision, and all expense postings with unique key `(sourceExpenseId, postingKind)`. Concurrent attempts must recheck state/version and only one may finalize. A losing/repeated/late request returns a conflict/rejection and has no financial effect.
5. If transaction fails, roll back both finalization and posting. Do not report success until commit is confirmed.

Policy changes after submission use the policy version captured at submission as a proposal; exact policy-change behavior is an open decision.

### Balance calculation and payment

1. For a balance request, authorize current membership and query relevant approved postings and accepted payment/correction postings.
2. Net reciprocal pair claims deterministically; return debtor, creditor, exact amount, and currency. Any cache is rebuildable and reconciled against source records.
3. For payment, authorize payer and payee in relevant group context, validate positive amount and date no later than today, then within one transaction re-read/lock or version-check current outstanding amount.
4. Reject if payment exceeds current amount owed; no payment/posting is written. Otherwise create a new immutable payment record and a single payment posting. Similar values/date do not imply a duplicate; each accepted submission is one record.
5. Concurrent payments serialize or use compare-and-swap/retry with a fresh outstanding calculation; if no longer valid, reject without partial effects (FR-008–FR-009; AC-008–AC-009).

### Correction and reversal

1. Only group owner/manager may submit a correction referencing an existing finalized record. The correction must pass the configured review process; its submitter cannot approve their own correction.
2. Preserve original record. Validate correction amount and reference; for payment reversal enforce cumulative approved reversals do not exceed original unreversed amount.
3. Route through the configured review process. Pending/rejected correction has no financial posting.
4. On approval, atomically store decision and a compensating posting. Approved expense correction references the original expense and passes expense review. Never edit/delete the original or post the same correction twice (FR-009; AC-009–AC-009a).

### Notifications

Resolve recipients at submission time as all current members other than submitter. Store per-recipient notification intent and delivery state. Retries may repeat transport but must not duplicate user-visible event. Notification details are fetched only after current group authorization; removed members cannot read through stale links. Channel and behavior on unavailable addresses require a decision (FR-007; AC-007; NFR-004).

### Reports and summaries

Authorize requested group/account scope before querying. Validate start <= end; dates are calendar dates and both endpoints inclusive. Apply supported filters to authorized records, reconcile totals from source financial activity, and return no-match results as empty reports rather than fabricated values. Unsupported parameters are reported explicitly. Parameter catalog/export formats remain open (FR-010–FR-011; AC-010–AC-011).

## 6. Validation, errors, and transaction boundaries

Validation failures must be explicit, field/action-specific, and leave persistent state unchanged. Do not silently clamp money, infer duplicate payments from matching fields, fall back to a public report, or pretend asynchronous delivery succeeded. Authorization failures must not disclose whether unauthorized group-only records exist.

| Operation | Atomic unit / invariants |
|---|---|
| Submit expense | Expense + allocation snapshot + required review records + notification intents; no posting |
| Review final approval | Decision + status transition + unique financial postings |
| Review rejection | Decision + rejected status; no posting |
| Record payment | Current-outstanding validation + immutable payment + posting |
| Approve correction | Decision + immutable correction + compensating posting |
| Remove member | Membership revocation before subsequent protected read; financial history unchanged |
| Report | Authorization and bounded, consistent query; no side effects |

Expected outcomes include validation error, unauthorized/forbidden (without data leakage), not found in authorized scope, conflict for stale/repeated decisions, payment-over-amount rejection, and infrastructure failure. Retry only operations with an explicit idempotency key and documented semantics; payment submissions must not be deduplicated by matching field values.

## 7. Authorization matrix

Checks occur on the application/use-case boundary, and all group reads check current membership.

| Action | Required authorization | Restrictions |
|---|---|---|
| Read personal account area | Authenticated account owner | No other account's private data |
| Read group data/history/report/receipt | Current group member | Removed member denied, including history and old notification links |
| Add/remove member; submit correction | Current owner or manager | Owner cannot be removed |
| Grant/revoke manager; configure review levels | Owner | Reviewer assignments must remain valid |
| Submit expense | Current group member | Payer and participants current members |
| Decide expense/correction | Assigned eligible reviewer at required level | Submitter cannot decide own expense; one decision per reviewer/level; no finalized late decision |
| Record payment | Authorized group user in the relevant obligation context | Cannot exceed current outstanding amount |
| Receive/read notification | Recipient eligible at submission and still authorized at read | No data exposure to nonmembers or removed members |

The exact rights of ordinary members for recording payments and viewing account-wide cross-group balances should be confirmed if ambiguous; implementation must not broaden access by default (FR-001–FR-011; NFR-006).

## 8. Full product versus Swing MVP

| Design element | Full product | Proposed Swing MVP |
|---|---|---|
| Primary presentation | Web browser required by NFR-001; framework open | Java Swing per implementation direction; desktop only |
| Allocation | Equal and percentage, exact deterministic method | Equal only; percentage deferred |
| Receipts | Optional image; secured storage boundary | Deferred |
| Review | Owner-configured one or more levels | One authorized reviewer |
| Reports | Custom supported parameters and inclusive date range | Basic summaries only |
| Notifications | Every other current member, secured access; channel TBD | In-app notice subset |
| Nonfunctional targets | Must verify NFR-002–NFR-006 | Production-scale NFRs deferred; desktop is not web conformance |
| Architecture core | Shared domain/application behavior across clients | Same separation; no logic in Swing listeners |

The Swing subset is not the full product and does not satisfy NFR-001. Android/iOS clients appear in the lab DOCX but are not committed by `UserRequirement.md` or the specification inventory; decide scope before adding them.

## 9. Design decision record

| ID | Decision | Status | Basis / impact |
|---|---|---|---|
| D-01 | Keep customer web requirement and Swing direction distinct; compare web-first and Swing-first paths | Awaiting stakeholder approval | Constitution I and NFR-001 conflict; neither is waived |
| D-02 | Use `BigDecimal` and explicit group currency scale for all money | Source-constrained | Constitution III; currency list/scale still open |
| D-03 | Use exact largest-remainder allocation with stable-ID tie-break | Clarified specification requirement | FR-005, AC-005, AC-013 |
| D-04 | Derive balances from immutable approved financial postings; cache only as rebuildable projection | Proposed | Protects auditability and reconciliation; choose persistence implementation later |
| D-05 | Commit final decision/status and unique postings atomically | Proposed | Prevents partial and duplicate financial effects; requires transaction/uniqueness support |
| D-06 | Snapshot approval policy version for each expense | Proposed | Makes review requirements stable; policy-change behavior needs owner confirmation |
| D-07 | Enforce current membership at protected read and notification-detail retrieval | Clarified specification requirement | FR-002, FR-007, NFR-006 |
| D-08 | Use idempotent outbox/retry for notifications | Proposed | Supports NFR-004 without making delivery part of expense transaction outcome |
| D-09 | Treat Android/iOS apps as unresolved lab-assignment scope | Awaiting stakeholder approval | DOCX mentions them; authoritative UserRequirement/spec inventory do not |

## 10. Testing strategy

Use Java 21/Maven/JUnit 5 for Java implementation tests. Tests are planned verification, not executed implementation tests.

- **Domain unit tests:** currency scale/precision; positive amount; equal and percentage split; percentages sum numerically to 100; negative percentages rejected; largest-remainder and stable-ID tie; payer as/non-participant; shares exactly reconcile.
- **State-transition tests:** pending/rejected no balance effect; approval requires every level; submitter cannot approve; duplicates, late decisions, races, and policy-version changes; only one posting.
- **Ledger/payment tests:** independently derive pairwise balances; partial and exact payment; overpayment no history/state change; same payment fields accepted as distinct submissions; reversal cap; immutable originals and approved compensations.
- **Authorization tests:** owner/manager rights; reviewer level access; cross-account denial; removal denies current and historical group data, receipt, report, and old notification detail while remaining members retain obligations.
- **Application integration tests:** transaction rollback and retry; notification intent/delivery retries; persistence uniqueness/atomicity using the selected adapter.
- **Acceptance tests:** map to all AC-001–AC-016 and SC-001–SC-008, with full-product platform and web behavior kept distinct from Swing-only tests.
- **Performance:** representative 100 concurrent active users for 15 minutes; at least 95% summary/report requests within 2 seconds. Report actual environment and measured p95; no benchmark is available now.
- **Notification service target:** demonstrate 95% availability to intended recipients within 60 seconds under normal service operation.
- **Usability:** at least 9 of 10 representative participants complete equal-split submission and find resulting approved balance without assistance.

## 11. Unresolved questions

1. Is Swing a temporary prototype followed by web delivery, or the expected final deliverable? How does Java 21/Swing apply to the web product?
2. Are Android and iOS apps required by the lab, and if so, native apps or responsive web?
3. Supported currencies, precision, and currency-change rules?
4. Notification channels, unreachable-recipient behavior, and required delivery semantics?
5. Report parameters, exports, and date/time-zone interpretation?
6. Are the proposed load, latency, notification, and usability targets accepted?
7. What persistence, hosting, identity, receipt storage, backup, retention, and recovery choices are permitted?
8. How do approval-policy changes affect already submitted expenses?
9. Which users may initiate payment entry, and what is the exact authorization scope for personal cross-group balances?
