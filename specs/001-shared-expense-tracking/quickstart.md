# SplitSmart Architecture Validation Guide

**Status**: Planning guide only; the repository contains no runnable
application yet.

## Current repository state

At the time of this architecture pass, the repository contains requirement and
SpecKit documentation, but no `pom.xml`, Java application source, or test
source. Therefore there is no verified application setup, compile, run, or
JUnit command. Do not interpret the proposed scenarios below as executed tests.

## Prerequisites after implementation is authorized

1. Record platform and course-scope decisions in the feature artifacts.
2. Install/use the approved Java 21 JDK and Maven version.
3. Create and review the approved Maven build and client/service projects.
4. Configure test persistence, email/notification adapters, and receipt test
   storage without production credentials.
5. Define approved currency codes/scales and test data with stable account
   identifiers.

Exact setup commands, application launch steps, deployment, and integration
credentials remain unverified because no implementation or build manifest
exists.

## Required validation scenarios

| Scenario | Action | Expected outcome | Trace |
|---|---|---|---|
| Allocation precision | Split 0.01 equally between two stable IDs; repeat with reversed input order | One minor unit assigned to the lower stable ID; output is deterministic and sums to 0.01 | FR-005, AC-005, SC-002 |
| Approval atomicity | Submit expense, repeat final approval concurrently | One final approved state and one set of journal entries; pending/rejected states post none | FR-006, SC-003 |
| Payer as participant | Submit where payer is one of multiple participants | Payer's own share is excluded from reimbursement owed to them | FR-003, FR-008, AC-008 |
| Payment settlement | Record partial payment, then an overpayment | Partial payment reduces debt; overpayment is rejected with no record/balance mutation | FR-009, AC-009 |
| Duplicate payment details | Submit two intentional payments with same payer/payee/amount/date | Both are accepted as distinct submissions if each is within remaining debt | FR-009, AC-009 |
| Correction audit | Correct approved payment by authorized owner/manager, approve reversal | Original remains unchanged; compensating entry restores no more than unreversed amount | FR-009, AC-009a |
| Removed-member privacy | Remove member and access old report/receipt/notification link | Removed account receives no historical group-only details; remaining members retain obligations | FR-002, FR-007, NFR-006 |
| Date reports | Query dates at both endpoints and a reversed range | Endpoint records included; start-after-end rejected | FR-011, AC-011 |
| Service objectives | Load 100 active users for 15 minutes; measure report/balance p95; separately measure notification availability | Measured results can be compared with NFR-003/NFR-004; no claim until observed | NFR-003, NFR-004, SC-005, SC-006 |
| Usability | At least 10 representative users perform expense-to-approved-balance journey | At least 9 finish without assistance | NFR-005, SC-007 |

Once an approved Maven project exists, run the project-defined JUnit 5 suite
(normally through Maven's test lifecycle) and record actual results. Load,
browser/mobile, and visual Swing tests require separately chosen tools and
environments.
