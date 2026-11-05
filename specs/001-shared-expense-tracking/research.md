# Architecture Research: SplitSmart

**Date**: 2026-11-05
**Scope**: Architecture and design evidence for the feature; no platform or
vendor decisions are approved by this document.

## Verified references

- Java 21 `BigDecimal` is immutable and represents decimal values using an
  arbitrary-precision integer and a scale. Exact arithmetic is available when
  representable; exact division with a non-terminating decimal result throws
  `ArithmeticException`. The `BigDecimal(double)` constructor can preserve a
  binary floating-point approximation rather than the intended decimal
  literal.
  [Java 21 BigDecimal API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html)
- Swing components are generally not thread-safe; most Swing interaction
  belongs on the event dispatch thread, and long-running work on that thread
  can   make the interface unresponsive.
  [Oracle Swing concurrency tutorial](https://docs.oracle.com/javase/tutorial/uiswing/concurrency/dispatch.html)
  [Java 21 SwingUtilities API](https://docs.oracle.com/en/java/javase/21/docs/api/java.desktop/javax/swing/SwingUtilities.html)
- Display-dependent AWT operations can fail in a headless environment.
  Domain logic can therefore be tested separately from GUI behavior, while
  display-dependent tests need an appropriate environment.
  [Java 21 GraphicsEnvironment API](https://docs.oracle.com/en/java/javase/21/docs/api/java.desktop/java/awt/GraphicsEnvironment.html)
- Maven's conventional layout separates `src/main/java`, `src/test/java`,
  and their resources; projects may override the defaults.
  [Maven standard directory layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- JUnit 5 comprises the Platform, Jupiter, and Vintage; Jupiter supplies the
  programming and extension model.
  [JUnit 5.11.4 User Guide](https://docs.junit.org/5.11.4/user-guide/index.html)
- PlantUML diagrams use textual definitions bounded by `@startuml` and
  `@enduml`.
  [PlantUML Quick Start](https://plantuml.com/starting)
- Layering separates responsibilities and dependencies, but logical layers
  need not map one-to-one to physical   deployment tiers.
  [Microsoft Azure Architecture Center: N-tier](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier)
- The transactional outbox pattern writes a business change and an outgoing
  message record in one transaction, then publishes asynchronously. Consumers
  must account for possible duplicate delivery and should be idempotent.
  AWS's guidance also discusses ordering and avoiding messages for rolled-back
  business transactions. Its examples do not require AWS for the generic
  pattern.
  [AWS Prescriptive Guidance: Transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

## Design decisions informed by research

### Exact monetary arithmetic

Use `BigDecimal` created from decimal text or exact integer minor units, never
from `float` or `double`. Keep scale and rounding explicit at currency
boundaries. The spec already selects largest-fractional-remainder allocation
and stable account-ID tie-breaking; the exact supported currency/scale mapping
remains open. Equality checks must intentionally choose numeric comparison
versus scale-sensitive `equals`.

### Swing responsiveness and test boundaries

For the Swing MVP only, UI event handlers delegate to application use cases.
Long-running calls must not block the Swing event dispatch thread; UI updates
must respect Swing threading requirements. Domain and application rules should
be testable without constructing Swing components. The project has no code or
test framework configuration yet; headless test details require validation
once implementation begins.

### Layered boundaries

Use presentation, application, domain, and infrastructure boundaries as a
logical dependency design. Do not equate layers with separate servers or
processes without a deployment decision. This preserves reuse across a Swing
prototype and any later web/mobile client without selecting a client framework.

### Atomic notifications

If notifications are committed alongside an expense submission, use an
outbox-like durable handoff so the saved expense and pending notification
cannot diverge through a failed dual write. Delivery can be repeated, so
notification processing must tolerate duplicates and re-check recipient
authorization when details are fetched. The notification channel and service
remain unselected.

## Unresolved research and stakeholder questions

- Confirm whether the authoritative delivery scope is web-only, web plus
  Android/iOS (as mentioned in the course handout), or a Swing MVP followed by
  those clients.
- Select currency set and currency precision rules before defining production
  amount storage/serialization.
- Select a persistent transactional storage technology and deployment only
  after platform, course, and operational constraints are confirmed.
- Select notification channels and verify their privacy, delivery, retry,
  and availability behavior against NFR-004.
- Confirm availability, backup, recovery, data-retention, privacy, and
  jurisdiction requirements; the current sources give no targets.
- Validate the current Maven/JUnit toolchain when a build manifest exists.

## Assumptions and limitations

- The references above were consulted for documented behavior, not to
  benchmark SplitSmart or prove a service-level target.
- The architecture patterns are recommendations, not customer requirements.
- No production database, web framework, mobile framework, identity provider,
  receipt-storage vendor, notification service, or benchmark has been selected
  or validated.
