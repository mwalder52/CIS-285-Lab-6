# Architecture and Design Traceability Matrix

**Status:** Proposed mapping for human review; Draft requirements remain authoritative.  
**Full-product column:** Intended coverage if implemented; it is not evidence that the requirement is already satisfied.  
**Swing MVP column:** Coverage only within the specification's expressly proposed subset.

| Requirement | Required behavior / design response | Full-product architecture/design | Swing MVP coverage / deferral | Planned verification |
|---|---|---|---|---|
| FR-001 | Verified-email account, sign-in, own expenses/balances, password reset | Identity application service and authenticated caller context; [design](design.md#5-use-case-workflows) | Account creation/sign-in included; exact reset and deployment environment require confirming MVP scope | AC-001; account ownership and reset tests |
| FR-002 | Owner-created group, owner/manager membership authority, removal revokes access but retains remaining members' history/obligations | Group/Membership model; service-boundary checks; [architecture](architecture.md#8-security-privacy-reliability-and-operations) | Group/member management included; test all role and removal restrictions | AC-002; membership/auth integration tests |
| FR-003 | Positive exact-precision expense, date/description, separate payer, optional receipt; payer current; >=1 participant; payer share not owed to self | Expense + Allocation + secure receipt boundary; [allocation and accounting](design.md#4-monetary-and-allocation-design) | Basic expense and equal split included; receipt deferred; validate payer/participant invariants | AC-003; amount/date/membership/payer tests |
| FR-004 | Identify participants; current members only; one valid, zero rejected | Participant allocations and submission membership checks | Included within equal-split expense flow | AC-004; one/zero/nonmember cases |
| FR-005 | Equal/percentage splits, nonnegative percentages totaling 100%, largest remainder and stable-ID tie, exact reconciliation | `BigDecimal` allocation domain policy; [algorithm](design.md#4-monetary-and-allocation-design) | Equal only; percentage deferred | AC-005, AC-013, SC-002; >=100 allocations, tie tests |
| FR-006 | Configurable one-or-more review levels; owner configures reviewers; no self-review; one decision/reviewer/level; any rejection rejects; all approve; only approval posts once | Versioned policy, immutable decisions, atomic finalization + unique postings | One authorized reviewer included; configurable/multiple levels deferred | AC-006, SC-003; concurrent/repeated/late decision tests |
| FR-007 | Notify all current group members except submitter at submission; no nonmember/removed-member detail access | Notification intent/delivery adapter, current-authorization check on detail reads | In-app notice subset; test authorization in each path | AC-007; recipient, removal, stale-link and retry tests |
| FR-008 | Pairwise owed amounts from approved expenses and recorded payments | Immutable financial postings; derived, reconcilable pair balances | Pairwise balance included; verify payer's own share exclusion | AC-008, SC-004; independent calculation |
| FR-009 | Partial/full payments, reject overpayment unchanged; dates; accept same-field distinct payments; immutable records; authorized reviewed corrections and capped reversal | Atomic outstanding check + payment posting; reviewed compensating records | Dated payments included; corrections/reversals not explicitly listed in MVP, therefore not presumed covered | AC-009, AC-009a; concurrent payment, overpayment, repeat-field, reversal cap, immutable-original tests |
| FR-010 | Authorized summaries of expenses, balances, payments; totals reconcile | Authorized reporting/read model over source records | Basic summaries included | AC-010; summary totals vs independent ledger |
| FR-011 | Date range and supported parameters, only authorized records, inclusive endpoints, start <= end | Authorized report service and explicit range validation | Custom/date-range reporting deferred | AC-011; boundary/inverted/no-result/auth tests |
| NFR-001 | Primary customer product experience web-based; desktop-only is not compliant | Web-first browser path is the only proposed fit; platform direction unresolved | **Not satisfied** by Swing-only MVP; deferred by spec | AC-012; supported-browser acceptance, not Swing test |
| NFR-002 | Accurate, repeatable currency-precision arithmetic with no value created/lost | `BigDecimal`, scale validation, exact largest-remainder allocation; postings reconcile | Equal split must still use exact rules; percentage deferred | AC-013, SC-002, SC-004; arithmetic and repeatability tests |
| NFR-003 | 100 active concurrent users; 95% balance/report-summary requests <=2s over 15 minutes | Report/query boundary; measurement and indexes only after baseline | Production-scale target expressly deferred | AC-014, SC-005; representative 15-minute load test |
| NFR-004 | 95% new-expense notices available within 60s in normal operation | Delivery port; durable retry/outbox is proposal | In-app notice subset; target expressly deferred | AC-015, SC-006; timestamped delivery test |
| NFR-005 | >=9/10 representative users complete equal-split submit and find approved balance unaided | Client flow usability target; test separately per approved client | Production target expressly deferred, despite equal-split flow inclusion | AC-016, SC-007; moderated usability test |
| NFR-006 | Account/group data only accessible to owner/authorized members; removal blocks future group access | Service-boundary authorization, current membership on all reads | Required behavior applies to included group features; verify removal | AC-001, AC-002, AC-007, SC-008; denial tests |

## Customer inventory and additional assignment scope

| Source feature | Full-product response | Swing MVP status |
|---|---|---|
| User accounts and own information | FR-001 identity and authorization | Included in subset |
| Group management | FR-002 role/membership services | Included in subset |
| Expenses; amount/date/description; equal or percentage split; optional receipt | FR-003–FR-005 and receipt boundary | Equal included; percentage and receipt deferred |
| Identify involved users | FR-004 allocations | Included |
| New-expense notifications | FR-007 authorized notification | In-app subset |
| Single/multi-level review | FR-006 configurable policy | Single reviewer only |
| Pairwise balances | FR-008 derived from postings | Included |
| Payments and corrections | FR-009 immutable payment/correction lifecycle | Payments included; corrections are not expressly included in MVP |
| Summaries and custom/date-range reports | FR-010–FR-011 | Basic summaries only; custom/range deferred |
| Primary web platform | NFR-001 | Deferred; Swing does not conform |
| Android/iOS apps in Lab 6 DOCX | The course document names these, but they are absent from authoritative `UserRequirement.md` and the specification inventory; confirm scope before committing a mobile client | Not listed in Swing subset |

## Acceptance criteria and success criteria

AC-001–AC-011 map respectively to FR-001–FR-011 and are verified by the corresponding tests above; AC-009a is covered with correction lineage and approval tests. AC-012–AC-016 map respectively to NFR-001–NFR-005 and require browser, arithmetic, load, delivery-latency, and usability evidence. The NFR-006 / SC-008 authorization tests are included above. SC-001 is checked by completeness of the customer inventory mapping; SC-002–SC-008 are verified by the associated test rows. A requirement ID in this table does not mean the design or a future implementation passes its test.

## Known gaps and evidence limits

- Platform conflict and Android/iOS source discrepancy are unresolved; no platform is declared conformant.
- Database, identity provider, receipt storage, notification channel, hosting, and report parameter catalog are not selected.
- Currency support/scale, service-objective approval, policy-change semantics, and operational availability/recovery targets need decisions.
- No implementation, PlantUML renderer, load test, notification service, or usability study was available/performed during this documentation task.
