# SplitSmart Risk Register and Decision Log

**Status:** Independent proposal; no decisions below imply stakeholder approval.  
**Scales:** Likelihood and impact are qualitative (Low / Medium / High); severity reflects both.

## 1. Risk register

| ID | Severity | Likelihood / impact | Risk and evidence | Mitigation / verification | Owner / decision needed |
|---|---|---|---|---|---|
| R-01 | **Critical** | High / Critical | Customer requires primary web (NFR-001), while Constitution directs Java Swing and says Swing alone is insufficient. Swing-only delivery would fail customer platform scope. | Choose and document web-first full product or time-boxed Swing prototype with explicit web follow-up. Keep separate conformance claims; verify browser acceptance (AC-012). | Project owner and course stakeholder: platform direction, acceptance gate |
| R-02 | **High** | Medium / High | Lab DOCX mentions Android and iOS, absent from `UserRequirement.md` and spec customer inventory. Could change scope, architecture, testing, schedule. | Confirm whether native apps are required, whether responsive web counts, and which delivery phase. Do not silently add mobile clients. | Course stakeholder / project owner |
| R-03 | **High** | Medium / High | Currency set and scale are open. Wrong precision or rounding rules can reject valid input or create monetary discrepancies. | Select currencies/scales before implementation; test positive, overprecision, equal/percentage split and reconciliation (FR-003, FR-005, NFR-002). | Product owner |
| R-04 | **High** | Medium / High | Double posting or concurrent overpayment if decision/posting and payment checks are not atomic. | Transactional state transition, unique source-posting key, version/locking, retry conflict handling; test concurrent approvals and payments (AC-006, AC-009). | Architecture/implementation owner |
| R-05 | **High** | Medium / High | Removed-member records or stale notification/receipt links could expose historical group data. | Current membership check on every read/download, revoke sessions/cache access as required, minimize notification payload; test removal and stale links (NFR-006, AC-007, SC-008). | Security/privacy owner |
| R-06 | **High** | Medium / High | Mutable cached balances without auditable source could drift or obscure corrections. | Immutable approved source records and postings; rebuild/reconcile any projection; independent balance tests (SC-004). | Domain/data owner |
| R-07 | **High** | Medium / High | Receipt images can leak sensitive data or introduce unsafe files; storage/access/retention are unspecified. | Decide limits, allowed types, scanning, encryption, access checks, retention, and deletion policy before enabling; receipt security test. | Security/privacy and product owner |
| R-08 | **Medium** | Medium / Medium | Notification channel, unreachable-recipient behavior, and delivery target are unresolved; target may not be operationally measurable. | Select channel and operational definition; durable retry/observable status is proposal; measure 95% within 60 seconds (NFR-004). | Product and operations owner |
| R-09 | **Medium** | Medium / High | Report filters, exports, timezone, and query semantics are not fully specified; unauthorized data or boundary errors possible. | Confirm parameter catalog and date interpretation; enforce authorization and inclusive dates; test endpoints and denied scopes (FR-011). | Product owner |
| R-10 | **Medium** | Medium / High | Required 100-user performance target lacks production topology/data volume definition. | Agree representative dataset/environment; measure p95 against NFR-003; optimize only after evidence. | Product and operations owner |
| R-11 | **Medium** | Medium / Medium | Approval policy changes while expense awaits review could change required reviewers or allow stale decisions. | Snapshot policy version at submission as proposal; decide whether pending items use old or new policy and test transition. | Group-policy/product owner |
| R-12 | **Medium** | Medium / Medium | Assignment's Java/Swing constraints may be interpreted as mandating an implementation path incompatible with web clients. | Clarify how Java 21 and Swing apply if web-first; avoid selecting unapproved framework/stack. | Course stakeholder |
| R-13 | **Low** | Medium / Medium | Lack of availability, backup, recovery, and audit retention objectives may undermine operational readiness. | Define RTO/RPO, retention, monitoring, and recovery ownership before deployment; not specified in current requirements. | Product/operations owner |

## 2. Decision log

Statuses mean: **Source-constrained** = required by an inspected source; **Proposed** = design choice not approved; **Awaiting stakeholder approval** = material ambiguity/conflict blocks a final choice.

| ID | Decision | Status | Source / rationale | Confirmation needed |
|---|---|---|---|---|
| D-01 | Treat primary web as a customer requirement and Swing as a separate limited MVP direction; no Swing-only compliance claim | **Awaiting stakeholder approval** | UserRequirement, NFR-001, Constitution I and Implementation Baseline | Is Swing prototype an interim deliverable or final course product? How is web delivery handled? |
| D-02 | Compare Swing-first then web with web-first architecture | **Proposed** | Preserves explicit conflict without waiver | Approve intended path and acceptance scope |
| D-03 | Android/iOS apps are not assumed as customer scope because only lab DOCX adds them | **Awaiting stakeholder approval** | DOCX says “also comes with app…Android and IOS”; authoritative customer file/spec inventory do not | Confirm required native apps, responsive web, or no mobile requirement |
| D-04 | Use Java `BigDecimal` for monetary values and calculations, no `float`/`double` | **Source-constrained** | Constitution Principle III | Currency scale remains open |
| D-05 | Use Java 21, Maven, JUnit 5, PlantUML where Java project/tooling applies | **Source-constrained** | Constitution V and Implementation Baseline; Lab 6 assignment | How the Java/Swing direction applies to web path |
| D-06 | Allocate exact shares with largest remainder and stable account-ID tie-break | **Source-constrained** | Clarified spec FR-005/AC-005 | Confirm stable-ID canonical ordering in implementation |
| D-07 | Derive balances from approved activity and immutable payment/correction records; projection is rebuildable | **Proposed** | Auditability and reconciliation requirement | Select persistence and transactional mechanism |
| D-08 | Atomically finalize approvals with unique financial postings; atomically validate and record payments | **Proposed** | Prevents double-posting and overpayment races | Validate feasibility against chosen storage |
| D-09 | Snapshot approval policy version at expense submission | **Proposed** | Avoids changing pending requirements silently | Stakeholder decides behavior on policy change |
| D-10 | Add durable notification outbox/retries and current-access check at read | **Proposed** | Addresses delivery and privacy requirements | Select channels and delivery operations |
| D-11 | One currency per group initially | **Source-constrained assumption** | Spec assumptions | Confirm supported currencies, precision, change policy |
| D-12 | Database, web framework, identity/email provider, receipt store, hosting are unselected | **Awaiting stakeholder approval** | No source mandates these | Select after platform and operational needs are confirmed |

## 3. Approval gate

Before architecture approval or implementation, resolve D-01/D-03, decide currency scale and operational requirements, and review transaction/authentication/receipt choices. This package is AI-assisted design and requires human verification under Constitution VI.
