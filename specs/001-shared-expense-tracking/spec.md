# Feature Specification: SplitSmart Shared Expense Tracking

**Feature Branch**: `001-shared-expense-tracking`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Read UserRequirement.md in this workspace as the authoritative customer requirements. Write a testable SplitSmart feature specification: actors, user scenarios, functional and non-functional requirements, acceptance criteria, requirement IDs (FR-001, etc.), and open questions. Preserve all original customer features in the requirements inventory; label the Java Swing MVP subset separately. Do not write Java code. Do not edit UserRequirement.md."

## Clarifications

### Session 2026-10-29

- Q: Can the person who pays for an expense be separate from the people whose shares are allocated, including cases where the payer is also a participant? → A: Payer and participants are separate roles; the payer may also participate, shares apply only to listed participants, and the payer's own share is netted from what they are owed.
- Q: Who may change group membership, and what should a removed member be able to see afterward? → A: The owner grants or revokes manager permissions; only the owner or a manager may add or remove members. Removal ends the former member's access to current and historical group-only information, while current members retain the group history and obligations.
- Q: How should SplitSmart validate expense amounts and percentage shares, and distribute rounding differences? (FR-003, FR-005) → A: Reject zero/negative and over-precision amounts; require at least one current group member as a participant and require the payer to be a current group member; require nonnegative percentage shares totaling exactly 100%; distribute fractional-minor-unit remainders by largest fractional remainder, breaking ties by ascending stable participant account identifier.
- Q: How should users sign in and regain access if they forget their credentials? (FR-001) → A: Users sign in with a verified email address and password and can reset the password through that verified email address.
- Q: What should happen when a member records a payment that is larger than the amount they owe? (FR-009) → A: Partial payments are allowed, but a payment greater than the payer's current outstanding amount to the payee is rejected.

### Decisions Applied After Clarification

- The group creator is the owner; the owner grants and revokes manager
  permissions. The payer and every participant must be current group members
  when an expense is submitted. One participant is valid; zero participants
  are rejected.
- Fractional-minor-unit ties are resolved by ascending stable participant
  account identifier.
- Expense and payment dates are calendar dates no later than the current date.
  Report date-range endpoints are inclusive, and the start date cannot follow
  the end date.
- Only an owner or manager may submit a correction to a recorded payment or
  approved expense. A correction references the original and passes the group's
  configured review process; approval adds a compensating entry without
  changing the original record. A payment reversal cannot exceed the original
  payment's unreversed amount.

## Actors

- **Individual user**: Creates an account, signs in, views personal expenses and
  balances, and records payments.
- **Group owner or manager**: Creates and manages a group and its membership.
- **Expense submitter**: A group member who enters an expense and identifies
  its payer and participants.
- **Expense reviewer/approver**: A member authorized by the group to review,
  approve, or reject a submitted expense.
- **Expense participant**: A member included in an expense who may owe or be
  owed money and receive expense notifications.
- **Report viewer**: An authorized user who reviews expense, payment, and
  balance summaries for their own account and groups.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an account and group (Priority: P1)

A person creates an account, signs in, creates a group for a shared activity,
and adds the people who will share expenses. This establishes a private place
to record and review the group's spending.

**Why this priority**: Expense tracking requires identifiable users and a group
whose membership defines who can participate and see shared information.

**Independent Test**: Create two accounts and a group, add the second account,
and verify both authorized members can see the group while an unrelated account
cannot.

**Acceptance Scenarios**:

1. **Given** a person has no account, **When** they create an account with
   valid information and sign in, **Then** they can access their own expense
   and balance area.
2. **Given** a signed-in user, **When** they create a group and add another
   account, **Then** both accounts are listed as group members.
3. **Given** an account that is not a group member, **When** it tries to view
   that group's expenses or balances, **Then** access is denied and no group
   information is disclosed.

---

### User Story 2 - Submit and review a shared expense (Priority: P1)

A group member records an expense with its amount, date, description, payer,
participants, and split method. The expense is reviewed under the group's
approval process before it changes balances.

**Why this priority**: Recording shared expenses and applying the group's
approval decision is the central source of balance changes.

**Independent Test**: Submit an expense for a group, verify it is pending and
does not affect balances, then approve it and verify its participant shares
are reflected in the balances.

**Acceptance Scenarios**:

1. **Given** an authorized group member and a group with at least two members,
   **When** the member submits an expense with a valid amount, date,
   description, payer, participants, and split, **Then** the expense is saved
   with a pending-review status.
2. **Given** an expense awaiting review, **When** an authorized reviewer
   approves it, **Then** the expense becomes approved and its shares are
   included in balances exactly once.
3. **Given** an expense awaiting review, **When** an authorized reviewer
   rejects it, **Then** it is marked rejected and does not change balances.
4. **Given** a submitted expense involving group members, **When** it is
   created, **Then** the other group members receive a notification that
   identifies the new expense without exposing it to non-members.

---

### User Story 3 - Review balances and record a payment (Priority: P1)

A member checks how much each person owes another and records a payment made
to settle an amount. The group can then see the updated outstanding balances
and payment history.

**Why this priority**: Accurate balances and recorded settlements are necessary
for users to resolve shared expenses.

**Independent Test**: Approve an expense paid by one member for several
participants, verify pairwise amounts owed, record a payment, and verify that
the corresponding outstanding balance decreases by the payment amount.

**Acceptance Scenarios**:

1. **Given** approved expenses, **When** a group member views balances,
   **Then** the system shows the net amount owed between each pair of users
   and identifies who owes whom.
2. **Given** an outstanding amount between two members, **When** the payer
   records a payment to the payee with an amount and date, **Then** the
   payment is added to the history and the outstanding amount is reduced by
   that payment.
3. **Given** a payment amount greater than the outstanding amount, **When**
   the payer attempts to record it, **Then** the system rejects the payment
   and leaves the payment history and balance unchanged.

---

### User Story 4 - Review expense and payment reports (Priority: P2)

A user reviews summaries of their expenses, balances, and payments, and
requests a report for a selected date range and other supported criteria.

**Why this priority**: Summaries help users understand shared spending and
verify that expenses and settlements have been recorded.

**Independent Test**: Create approved expenses and payments on dates inside
and outside a selected period, then verify the report includes only matching
records and totals.

**Acceptance Scenarios**:

1. **Given** a user with expense, balance, or payment history, **When** they
   open a summary, **Then** the summary shows the relevant records and
   corresponding totals.
2. **Given** a user specifies a date range and supported report parameters,
   **When** they generate a report, **Then** only authorized records matching
   those parameters are included.

---

### User Story 5 - Manage group membership and activity (Priority: P2)

A group owner or authorized manager updates group details and membership.
Members receive notice of new group expenses and can review the expense
information available to their group.

**Why this priority**: Group management keeps shared records scoped to the
right participants as a trip, household, or other activity changes.

**Independent Test**: Create a group, update its details, add and remove a
member, and verify the resulting membership and access to group information.

**Acceptance Scenarios**:

1. **Given** a group owner, **When** they update permitted group details or
   membership, **Then** the group reflects the change and access follows the
   resulting membership.
2. **Given** a member is removed from a group, **When** they later request
   group information, **Then** they cannot view information restricted to
   current members.

### Edge Cases

- An expense has one participant, no participants, a payer or participant who
  is not a current group member, a non-positive amount, or an invalid date.
- Percentage shares do not total 100%, contain negative values, or produce a
  fractional remainder when expressed in the applicable currency.
- Equal shares cannot divide the total evenly at the applicable currency
  precision.
- Two reviewers act on the same pending expense, or a review decision is
  repeated.
- A pending expense is edited before review, or an approved expense needs
  correction; finalized expenses cannot be changed in place and corrections
  are represented by a separately reviewed adjustment.
- A payment is zero, negative, exceeds the outstanding amount, or is entered
  more than once.
- A member is removed while they have approved expenses or unsettled balances;
  balances remain visible to current members, while the removed member loses
  access to group records.
- A notification recipient is no longer a group member or cannot be reached.
- A report has an empty or reversed date range, no matching records, or records
  on either selected boundary date.
- A user attempts to access another user's account data or a non-member
  group's records.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow each person to create and use an individual
  account with a verified email address and password to sign in and access
  that account's own expenses and balances. The system MUST provide password
  reset through the verified email address.
- **FR-002**: The system MUST allow an authorized user to create a group.
  The creator MUST become the group owner. The owner MAY grant or revoke
  manager permissions; only the owner or a manager MAY add or remove members.
  The owner cannot be removed while the group exists. Removing a member MUST
  end that member's access to group-only information, including historical
  records and reports; group history and obligations MUST remain available to
  remaining authorized members. Any unsettled obligations remain in group
  balances and MUST be visible to the remaining authorized members.
- **FR-003**: The system MUST allow an authorized group member to submit an
  expense with a positive amount at the group's currency precision, date,
  description, payer, split method, and an optional receipt image. Amounts
  that are zero, negative, or exceed the currency's allowed precision MUST be
  rejected. The payer MUST be recorded separately from participants, may
  also be a participant, and MUST be a current member of the group when the
  expense is submitted. At least one participant is required; zero participants
  MUST be rejected. The payer MUST be reimbursed only for participant shares
  other than their own. Expense dates MUST be calendar dates no later than the
  current date.
- **FR-004**: The system MUST allow the submitter to identify which group
  members participated in an expense and MUST reject participants who are not
  current members of that group when the expense is submitted. One participant
  is valid, including when that participant is also the payer.
- **FR-005**: The system MUST support equal and percentage-based expense
  allocation. Percentage allocations MUST be nonnegative and total exactly
  100 percent. Participant shares MUST be allocated at the group's currency
  precision; any fractional-minor-unit remainder MUST be distributed by
  largest fractional remainder. When fractional remainders are equal, the
  remaining minor units MUST be assigned in ascending order of the
  participants' stable account identifiers. Resulting shares MUST reconcile
  exactly to the expense total.
- **FR-006**: The system MUST hold submitted expenses for review and MUST
  support an approval process with one or more review levels as configured
  for the group. The group owner configures reviewers and review levels;
  submitters MUST NOT review their own expenses. Every required level MUST
  approve an expense before it is approved, and any rejection MUST reject it.
  A review decision MUST be recorded at most once per reviewer and level.
  Decisions on an already finalized expense MUST be rejected without changing
  its status or balances. Only an approved expense may affect balances; a
  rejected or pending expense MUST NOT affect balances.
- **FR-007**: The system MUST notify relevant group members when another
  member submits a group expense. Relevant recipients are all current group
  members other than the submitter at the time of submission. Notifications
  MUST restrict expense details to authorized recipients, and a removed member
  MUST NOT regain access through an earlier notification.
- **FR-008**: The system MUST track the amount owed by each user to every
  other user from approved expenses and recorded payments, and MUST show who
  owes whom.
- **FR-009**: The system MUST allow a user to record a partial or full payment
  settling an amount owed, including the payer, payee, amount, and date, and
  MUST update the corresponding outstanding balance and payment history.
  The system MUST reject a payment greater than the payer's current
  outstanding amount to the payee without changing the balance or history.
  Payment dates MUST be calendar dates no later than the current date.
  Each accepted submission MUST create one payment record. Similar payment
  details alone MUST NOT cause rejection, because separate payments may share
  payer, payee, amount, and date. A recorded payment MUST NOT be edited or
  deleted; a correction MUST be recorded as a separately authorized reversal
  or adjustment that preserves the audit history. Only a group owner or
  manager MAY submit a correction referencing the original record. A correction
  MUST pass the group's configured review process and MUST affect balances only
  when approved. A payment reversal MUST reference one payment and MUST NOT
  exceed that payment's unreversed amount; its approval restores the reversed
  amount to the outstanding balance. Expense corrections MUST be represented by
  a compensating adjustment record that refers to the approved expense and
  passes expense review before affecting balances.
- **FR-010**: The system MUST provide authorized users with summaries of
  expenses, balances, and payments.
- **FR-011**: The system MUST allow a user to request a report using a
  specified date range and other supported parameters, and MUST limit report
  contents to records that user is authorized to view. The start and end dates
  MUST be inclusive, and the start date MUST be on or before the end date.

### Customer Requirements Inventory

The following inventory preserves the original feature set in
`UserRequirement.md`. These are customer requirements, not claims about what
the Java Swing MVP includes.

| Customer feature from `UserRequirement.md` | Specification coverage |
|---|---|
| User accounts and access to personal expense and balance information | FR-001 |
| Create and manage groups of people | FR-002 |
| Create expenses with amount, date, description, equal or percentage split, and optional receipt image | FR-003, FR-005 |
| Identify other users involved in an expense | FR-004 |
| Notify users when other group members create an expense | FR-007 |
| Review and approve expenses before balance adjustment; single or multiple review levels | FR-006 |
| Track how much each user owes every other user | FR-008 |
| Record payments to settle balances | FR-009 |
| Summaries and custom reports, including date ranges and other parameters | FR-010, FR-011 |
| Primary platform is web-based | NFR-001 |

### Acceptance Criteria

- **AC-001 (FR-001)**: A newly created account verifies its email address,
  signs in with its email and password, and can reset its password through
  that verified address. It can view its own expense and balance area; a
  different account cannot access that private area.
- **AC-002 (FR-002)**: The group creator is its owner. The owner can grant and
  revoke manager permissions, and only the owner or a manager can add or remove
  members. The owner cannot be removed. After removal, the former member
  cannot access current or historical group-only information, while remaining
  authorized members retain group history and unsettled obligations.
- **AC-003 (FR-003)**: A valid expense containing amount, date, description,
  payer, and split method is saved. The payer may be a participant or not; the
  payer's own share is not counted as an amount owed to them. Zero, negative,
  or over-precision amounts are rejected. The payer must be a current group
  member and at least one current group member must participate. A receipt
  image may be attached or omitted. Future expense dates are rejected.
- **AC-004 (FR-004)**: An expense can be associated with eligible group
  participants; one participant is allowed, zero participants are rejected,
  and the system rejects a participant who is not a current group member.
- **AC-005 (FR-005)**: Equal and valid percentage splits produce participant
  shares whose total equals the expense amount at the group's currency
  precision. Percentage shares must be nonnegative and total exactly 100
  percent. Fractional-minor-unit remainders are distributed by largest
  fractional remainder; ties are resolved by ascending stable participant
  account identifier. For example, splitting 0.01 across two equal shares
  assigns the minor unit to the participant whose account identifier sorts
  first. Repeated calculations produce the same shares.
- **AC-006 (FR-006)**: A pending or rejected expense does not change any
  balance. A submitter cannot review their own expense. Each configured level
  must approve, and any rejection rejects the expense. A reviewer can decide
  only once at each required level; repeated or late decisions are rejected
  without a status or balance change. An approved expense changes balances
  once.
- **AC-007 (FR-007)**: On submission, every other current group member is
  notified. A non-member or removed member cannot retrieve restricted expense
  details through a notification.
- **AC-008 (FR-008)**: For a known set of approved expenses and payments, the
  system's pairwise balances match the calculated net amounts, exclude a
  payer's own participant share from reimbursement owed to them, and identify
  the debtor and creditor.
- **AC-009 (FR-009)**: Recording a valid payment adds a dated payment record
  and decreases the payer's outstanding amount to the payee by the payment
  amount. Partial payments are allowed; a payment greater than the current
  amount owed is rejected without changing the balance or history. Invalid
  or duplicate submissions do not silently alter balances. Each accepted
  submission creates one payment record; matching payer, payee, amount, and
  date alone do not identify a duplicate. Recorded payments cannot be edited
  or deleted. Only an owner or manager can submit a correction referencing the
  original; it must pass the configured review process and affects the balance
  only when approved. An approved payment reversal restores the amount reversed
  and cannot exceed the original payment's unreversed amount. Future payment
  dates are rejected.
- **AC-009a (FR-009)**: A payment correction leaves the original payment
  unchanged and adds a compensating record. An approved expense correction
  references the original expense and changes balances only through its
  separately approved adjustment.
- **AC-010 (FR-010)**: An authorized user can view expense, balance, and
  payment summaries whose totals reconcile with the underlying authorized
  records.
- **AC-011 (FR-011)**: A report for a specified date range and supported
  parameters contains only matching, authorized records and reports totals
  that reconcile with those records. Both endpoints are included, and a start
  date after the end date is rejected.
- **AC-012 (NFR-001)**: A user can access the primary SplitSmart experience
  through a supported web browser; a desktop-only experience does not satisfy
  this customer requirement.
- **AC-013 (NFR-002)**: For every valid expense allocation, participant
  shares reconcile exactly to the recorded expense total at the declared
  currency precision; repeated calculations produce the same result.
- **AC-014 (NFR-003)**: At the stated baseline load of 100 concurrent active
  users, at least 95 percent of balance and report-summary requests complete
  within 2 seconds, measured over a 15-minute test.
- **AC-015 (NFR-004)**: Under normal service operation, at least 95 percent
  of new-expense notifications are available to recipients within 60 seconds
  of submission.
- **AC-016 (NFR-005)**: In a usability test with at least 10 representative
  users, at least 9 can submit a valid equal-split expense and find the
  resulting approved balance without assistance.

### Non-Functional Requirements

- **NFR-001**: The primary product experience MUST be web-based, as stated by
  the customer. A desktop Swing application alone is not full product
  conformance.
- **NFR-002**: Monetary calculations MUST be accurate and repeatable at the
  declared currency precision; allocation and settlement totals MUST
  reconcile without loss or creation of value.
- **NFR-003**: At a baseline of 100 concurrent active users, at least 95
  percent of balance and report-summary requests MUST complete within 2
  seconds during a 15-minute representative load test.
- **NFR-004**: Under normal service operation, at least 95 percent of
  notifications for submitted expenses MUST be available to intended
  recipients within 60 seconds.
- **NFR-005**: In a usability test with at least 10 representative users, at
  least 90 percent MUST complete the equal-split expense submission and find
  its resulting approved balance without assistance.
- **NFR-006**: Account, expense, balance, payment, and report information
  MUST only be accessible to the account owner and authorized members of the
  relevant group. Removing group membership MUST prevent subsequent access
  to member-restricted group information.

### Java Swing MVP Subset (Implementation Decision)

This subsection is a proposed implementation subset, not a replacement for
the customer requirements above. Java Swing is the specified MVP presentation
technology. This subset is not, on its own, a web-based product and MUST NOT
be represented as satisfying NFR-001 or the full customer request.

**Included in the proposed MVP**:

- Account creation and sign-in for the MVP's supported environment.
- Create groups and manage group members.
- Submit an expense with amount, date, description, payer, and participants;
  support equal splits.
- A single authorized reviewer approves or rejects each expense.
- Approved expenses update pairwise balances; pending and rejected expenses
  do not.
- In-app notices for new group expenses.
- Record dated payments and display updated balances.
- View basic expense, balance, and payment summaries.

**Deferred from this MVP subset**:

- Primary web-based access.
- Percentage-based expense allocation.
- Receipt image attachment.
- Configurable or multiple approval levels.
- Custom report parameters and date-range reports.
- Production-scale availability, concurrency, and notification delivery
  targets.

All deferred items remain part of the customer requirements inventory and
require follow-up before the complete product can be declared conformant.

### Open Questions

1. Is the Java Swing MVP a temporary desktop prototype preceding a
   web-based product, or is the expected delivered product intended to
   replace the customer's web-based platform requirement?
2. Which currencies are supported, and what precision applies to each?
3. Which notification channels are required (in-app, email, or another
   channel)? The recipient rule is all current group members other than the
   submitter.
4. Which report parameters and export formats, if any, are required beyond
   date range?
5. Are the proposed load, response-time, notification, and usability targets
   acceptable as product service objectives?

### Key Entities

- **User account**: An individual identity with sign-in credentials and
  access to that user's own information.
- **Group**: A named shared-expense context with members, management
  permissions, and an approval policy.
- **Group membership**: The relationship between a user and a group, including
  the user's status and permissions.
- **Expense**: A submitted or reviewed record with amount, date, description,
  payer, participants, allocation method and shares, optional receipt image,
  and review status.
- **Expense allocation**: Each participant's share of an expense and its
  relationship to the payer.
- **Approval decision**: A reviewer's decision, associated expense, outcome,
  and decision time.
- **Notification**: A notice of a new group expense delivered to an eligible
  recipient.
- **Balance**: The net amount one user owes another based on approved
  expenses and recorded payments.
- **Payment**: A dated amount recorded from a payer to a payee to settle a
  balance.
- **Report**: A user-requested summary of authorized expenses, balances,
  and payments filtered by supported parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100 percent of the original customer
  features in the Customer Requirements Inventory map to at least one
  functional or non-functional requirement.
- **SC-002**: In a test set of at least 100 valid equal and percentage-based
  expense allocations, each set of participant shares sums to the expense
  total at the declared currency precision.
- **SC-003**: In an end-to-end test, pending and rejected expenses produce no
  balance change, and each approved expense changes balances exactly once.
- **SC-004**: For a test set of approved expenses and payments, all displayed
  pairwise balances match independently calculated net amounts.
- **SC-005**: At least 95 percent of balance and report-summary requests meet
  the 2-second response target at 100 concurrent active users.
- **SC-006**: At least 95 percent of new-expense notifications are available
  to intended recipients within 60 seconds under normal service operation.
- **SC-007**: At least 90 percent of 10 or more representative usability-test
  participants complete the defined expense-and-balance task without
  assistance.
- **SC-008**: No account outside a group can retrieve that group's
  member-restricted expenses, balances, payments, or reports in access
  control testing.

## Assumptions

- The full product scope retains all features in the customer requirements
  inventory even when they are deferred from the Swing MVP subset.
- An expense does not change balances until its required approval process is
  complete.
- The group owner grants manager permissions. Invitations are outside the
  defined behavior until their acceptance flow is specified. Removed members
  lose access to historical group records; current members retain history and
  unsettled obligations.
- The initial functional model uses one currency per group until multi-currency
  requirements are confirmed.
- Currency-specific monetary precision must be selected before implementation.
  Percentage allocation ties are deterministically resolved by ascending
  stable participant account identifier.
- Notification recipients are all current group members other than the
  submitter; the delivery channel remains to be selected.
- Performance, notification, and usability thresholds in this draft are
  proposed service objectives because the customer request does not specify
  numeric targets.
- The Java Swing MVP is a limited project implementation choice; it does not
  modify the original web-based customer requirement.
