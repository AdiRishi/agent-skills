# Boundary discipline

Place validation, type narrowing, and error handling at system boundaries. Trust data after the boundary has converted it into an internal type. Keep the business logic pure and the outer shell mechanical.

Scattered validation repeats work and obscures which data the system trusts. Validate once where untrusted data enters. Do not leak a framework, storage, transport, or wire representation through a domain API.

## Apply the principle

At a CLI, configuration, network, database, or external API boundary:

- Validate and narrow untrusted input.
- Convert raw values into domain types.
- Return useful boundary errors.
- Keep provider-specific types inside the adapter.

Inside the system:

- Trust the internal types.
- Propagate errors instead of checking the same condition again.
- Pass domain concepts between modules.
- Keep parsing, scoring, prompt construction, and other transformations pure when their inputs and outputs permit it.

Ask two questions:

1. Is the data crossing a system boundary here? If not, another guard probably repeats an earlier guarantee.
2. Can a pure function own this decision while a thin adapter handles the framework? If so, separate them.
