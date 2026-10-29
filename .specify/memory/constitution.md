<!--
Sync Impact Report
Version change: unversioned scaffold -> 1.0.0 (initial constitution)
Modified principles: none (all principles are newly established)
Added sections: Implementation Baseline; Development Workflow
Removed sections: none
Follow-up items: Project owner confirmation of the original ratification date;
resolve how the customer's primary web-based requirement aligns with the Java
Swing implementation direction.
-->

# SplitSmart Constitution

## Core Principles

### I. Customer Requirements Remain Distinct from Implementation Decisions
`UserRequirement.md` is the record of the original customer request. Specifications
and implementation plans MUST identify which statements originate there and which
are implementation decisions. Decisions MUST NOT be presented as customer
requirements or silently override them. The customer requests a primarily
web-based product; Java Swing is an implementation direction and is not, by
itself, evidence that the web-based requirement is met. Any conflict MUST be
explicitly resolved and documented before claiming customer-requirement
conformance.

### II. Object-Oriented Design with Separated Responsibilities
Code MUST use cohesive object-oriented types with clear responsibilities and
encapsulated state. GUI code MUST be separated from business rules and domain
logic; user-interface events may invoke application or domain operations, but
business calculations and validation MUST NOT depend on Swing components. This
separation enables independent testing and allows presentation decisions to
change without rewriting expense and balance rules.

### III. Exact Decimal Arithmetic for Money
Amounts, allocations, payments, and balances MUST use `BigDecimal`; binary
floating-point types MUST NOT represent monetary values. Scale, rounding, and
allocation-remainder behavior MUST be explicit at relevant boundaries and
covered by tests. This prevents representation error from corrupting shared
expense calculations.

### IV. Requirements Traceability
Each implemented customer-facing behavior MUST trace to a customer requirement
or to a clearly labeled implementation decision. Specifications, design
artifacts, and tests MUST retain that relationship so reviewers can assess
coverage and identify unimplemented or changed expectations. PlantUML diagrams
MUST support, not replace, traceable written requirements and executable tests.

### V. Automated Verification on the Agreed Java Toolchain
The project MUST target Java 21 and use Maven for build and dependency
management. Automated tests MUST use JUnit 5. Changes to business behavior MUST
include or update tests, with particular coverage for money arithmetic,
allocation, and balance changes. A passing build or test suite is necessary
evidence, not a substitute for review of requirement coverage.

### VI. Human Review of AI-Generated Work
AI-generated or AI-assisted requirements, diagrams, code, and tests MUST be
reviewed by a human before acceptance. Reviewers MUST verify factual accuracy,
consistency with the customer request, arithmetic and business-rule correctness,
and test relevance. AI output MUST NOT be treated as authoritative or accepted
solely because it is plausible or passes automated checks.

## Implementation Baseline

Java 21, Maven, Java Swing, JUnit 5, and PlantUML are implementation choices
directed for this project. They guide implementation and supporting artifacts;
they do not alter the customer requirements in `UserRequirement.md`. In
particular, the primary-web requirement and Swing direction remain an explicit
architecture alignment item until their relationship is resolved in a
requirements or design artifact.

## Development Workflow

Specifications and plans MUST distinguish customer requirements from
implementation decisions and identify unresolved conflicts. PlantUML diagrams
MUST be kept consistent with the accepted design. Pull requests or equivalent
reviews MUST check requirement traceability, separation of GUI and business
logic, correct `BigDecimal` use, relevant JUnit 5 coverage, and human review of
AI-assisted contributions. Deviations from this constitution MUST be explained
and approved through the governance process.

## Governance

This constitution governs project specifications, design, implementation, and
review. Amendments MUST be proposed with their rationale, reviewed by the
project owner or designated human reviewer, and reflected in the version and
last-amended date. Versioning follows semantic versioning: MAJOR for
incompatible changes to principles or governance, MINOR for new principles or
materially expanded requirements, and PATCH for clarifications that do not
change obligations. Each change MUST include a compliance review of affected
requirements, plans, diagrams, code, and tests; conflicts and approved
exceptions MUST be documented. Human review remains mandatory for AI-assisted
changes.

**Version**: 1.0.0 | **Ratified**: Pending project owner confirmation | **Last Amended**: 2026-10-29
