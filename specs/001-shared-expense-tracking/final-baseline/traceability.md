# Bidirectional traceability

Requirement meaning and acceptance measures are specified in [requirements.md](requirements.md). Source IDs and original wording are in `specs/001-shared-expense-tracking/spec.md`; the customer feature source is `UserRequirement.md`. Coverage here means design allocation exists, not implementation or proof.

| ID | Source feature | Baseline location | Verification target | State |
|---|---|---|---|---|
| FR-001 / AC-001 | Account and private access | Architecture, UC-01, IdentityPort | Account/privacy test | Proposed |
| FR-002 / AC-002 | Group management | Model Membership, UC-02, AuthorizationPolicy | Role/removal test | Proposed |
| FR-003 / AC-003 | Expense fields, payer, receipt | Requirements invariants, UC-03, ReceiptReference | Validation and payer cases | Proposed |
| FR-004 / AC-004 | Participants | Allocation, UC-03 | Membership/cardinality test | Proposed |
| FR-005 / AC-005 | Equal/percentage allocation | Requirements, design allocation | Determinism and exact sum | Proposed |
| FR-006 / AC-006 | Review before posting | Design approval, UC-04, ApprovalUseCase | Race/late/one-time tests | Proposed |
| FR-007 / AC-007 | Notifications | Model Outbox, UC-07, NotificationPort | Membership privacy/delivery test | Proposed |
| FR-008 / AC-008 | Pairwise balances | Journal/Projection, UC-08 | Independent arithmetic reconciliation | Proposed |
| FR-009 / AC-009, AC-009a | Payments/corrections | Model, design, UC-05/06 | Partial/overpayment/reversal tests | Proposed |
| FR-010 / AC-010 | Summaries | UC-08, ReportQuery | Authorized totals reconciliation | Proposed |
| FR-011 / AC-011 | Reports | ReportRequest, UC-08 | Date boundaries/access test | Proposed |
| NFR-001 / AC-012 | Primary web | Architecture alternatives; web deployment | Browser acceptance | Blocked by D-01 |
| NFR-002 / AC-013 | Monetary correctness | Requirements invariants, allocation/journal | Exact arithmetic scenarios | Proposed |
| NFR-003 / AC-014 | Performance | Architecture evidence section | 100-user/15-minute load test | Not run; topology TBD |
| NFR-004 / AC-015 | Notification latency | Outbox design | Timed delivery test | Not run; channel TBD |
| NFR-005 / AC-016 | Usability | Presentation path | ≥10-user study | Not run |
| NFR-006 / SC-008 | Privacy/authorization | Architecture, UC-01/02/07/08/09 | Access-control test | Not run |
| SC-001 | Customer feature coverage | Requirements matrix | Compare inventory to FR/NFR | Proposed; all features mapped |
| SC-002 | Allocation set | Allocation algorithm | ≥100 allocations | Not run |
| SC-003 | Approval/post exactly once | Approval workflow | End-to-end transition test | Not run |
| SC-004 | Balance correctness | Journal model | Independent balance calculation | Not run |
| SC-005 | Performance | NFR-003 | Load test | Not run |
| SC-006 | Notification timeliness | NFR-004 | Delivery measurement | Not run |
| SC-007 | Usability | NFR-005 | User study | Not run |
| SC-008 | Access isolation | NFR-006 | Negative access tests | Not run |

All source IDs FR-001–011, NFR-001–006, AC-001–016 and SC-001–008 are accounted for. Reverse direction: every baseline capability traces to these IDs or is labeled a proposed enabling design (OutboxMessage, JournalEntry, ReceiptReference); no additional customer feature is asserted. Original request feature map: accounts→FR-001; groups→FR-002; expenses/receipt→FR-003/005; participant selection→FR-004; notification→FR-007; approval→FR-006; balances→FR-008; payment→FR-009; reports→FR-010/011; primary web→NFR-001; mobile is a source discrepancy tracked D-02.
