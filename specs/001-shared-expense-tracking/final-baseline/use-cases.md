# Use case catalogue

Shared precondition for group cases: authenticated actor and current group membership unless the operation is membership administration. All results are scoped to currently authorized data. Alternate/error outcomes never disclose another group's records.

| ID / primary actor | Preconditions and main flow | Alternate/error flow | Postcondition |
|---|---|---|---|
| UC-01 Register/sign in — Individual | Provide verified-email credentials; authenticate; open own area. | Invalid/unverified credentials or reset failure returns safe error without account enumeration. | Authenticated session; only own private data. |
| UC-02 Manage group — Owner/Manager | Owner creates group and membership; owner grants roles; authorized manager manages membership. | Non-owner cannot grant/revoke; non-manager cannot add/remove; owner removal denied. | Membership/role history updated. |
| UC-03 Submit expense — Member | Validate current payer/participants, amount/currency/date, method; calculate shares; save PENDING and notification intents. | Invalid/empty/removed participant, precision/date/method error; no partial expense. | Pending expense and deterministic allocations; no financial posting. |
| UC-04 Review expense — Eligible reviewer | Load current pending subject and policy version; record unique level decision. | Self-review, ineligible reviewer, duplicate/late decision rejected; rejection finalizes with no posting. | Approved only after all levels, with one atomic posting; otherwise remains pending. |
| UC-05 Record payment — Debtor | Authorize group/pair; reread outstanding; validate positive amount/date; append payment and journal offset. | Overpayment/stale concurrent balance rejected without write. Similar details remain separately acceptable. | Immutable payment and decreased obligation once. |
| UC-06 Correct expense/payment — Owner/Manager then reviewers | Reference original; submit proposed compensating change; configured reviewers decide. | Wrong role/origin/amount or duplicate/late review rejected; reversal above unreversed amount rejected. | Original unchanged; approved compensation posted once; pending correction has no effect. |
| UC-07 Dispatch notification — System | Read committed outbox work and recipient. | Retry transient failure; suppress inaccessible recipient; avoid duplicate effects. | Delivery state recorded; details remain authorization-gated. |
| UC-08 View balance/report — Member/Report viewer | Authorize current scope; query pairwise ledger/report with inclusive range. | Removed/non-member denied; reversed date range rejected; empty result valid. | Authorized summary whose totals reconcile to canonical records. |
| UC-09 Retrieve receipt — Current member | Resolve private receipt reference and authorize current group membership. | Removed/non-member, invalid reference, unavailable object denied safely. | Private binary returned only to authorized member. |

The original request does not define invitations, account deactivation, receipt limits, notification channel, or exports. Those are not silently included as required use cases.
