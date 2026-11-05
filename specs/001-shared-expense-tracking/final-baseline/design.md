# Detailed design proposal

## Use case responsibilities

Use cases and their alternate/error flows are catalogued in [use-cases.md](use-cases.md). Service boundaries are authentication/authorization, group management, expense submission/allocation, policy review/posting, payment/correction, notification dispatch, and balance/report query. Each returns explicit validation, forbidden, stale-state, conflict, or success outcome; callers must not infer success from a UI state.

## Allocation

Validate a positive amount at configured currency scale, date, current payer, non-empty distinct current participants and method. Equal split divides total minor units evenly; percentage split validates nonnegative shares totaling exactly 100%. For either method compute exact quota per participant, assign floor minor units, then distribute remaining units by descending fractional remainder and ascending stable account ID for ties. Persist the resulting shares and input method/percentages. Assert sum == expense total. Payer's own allocation cancels against payer and does not create debt.

## Approval and posting

At submission capture a policy-version reference and required level identities as a proposed snapshot. The exact rule when policy changes for pending work remains D-04. A reviewer must be eligible at level and not submitter. Persist one decision per subject/reviewer/level. Any rejection finalizes rejected. All required approvals finalize approved and create journal entries atomically under unique posting key. Repeated, late, competing decisions receive explicit conflict and cannot post again.

## Payment and correction

Within a transaction, authorize current group access, re-read pairwise outstanding amount, validate positive amount/date/currency, reject overpayment, then append immutable Payment and offsetting journal entry together. Similar details are not duplicate evidence. Corrections reference exactly one source record. Owner/manager initiates; configured review authorizes compensating entries. A payment reversal cannot exceed remaining unreversed original. Expense correction links original and is reviewed like expense. No original financial fact is edited/deleted.

## Notifications, reports, and privacy

Submission identifies all then-current members except submitter. Persist notification intents with source event, preferably transactionally via OutboxMessage. Dispatcher retries safely; before delivery and on detail retrieval, check membership. Removed users cannot use stale links. Report queries apply inclusive dates and supported filters after authorization and calculate totals from authorized canonical records. Timestamp/timezone rules and filter catalog are open.

## Persistence and errors

Required constraints: unique decision key, unique source-posting key, foreign/reference integrity, positive monetary amounts, mutually exclusive correction origin, and atomic transactions for finalization/payment. Concurrency must reject stale writes without partial effects. Selected database/transaction isolation is pending; these are required outcomes, not proven properties. Cache/projection can be rebuilt and reconciled. See [contracts.md](contracts.md), [data-model.md](data-model.md), and [decisions.md](decisions.md).
