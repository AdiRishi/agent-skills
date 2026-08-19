# Experience first

Judge a product or API decision from the consumer's point of view. Implementation convenience does not justify a worse user, caller, or maintainer experience.

Judge the result for each consumer:

- For a product, the consumer is the end user.
- For a library or API, the consumer is the engineer who calls it.
- For internal code, the consumer is the engineer who must understand and change it later.

Prefer a smaller, coherent result over a larger rough one. Every feature, option, and control must justify the complexity it adds. Keep the central workflow clear. Include feedback and error states in the design rather than treating them as cleanup.

Use a cheap prototype when direct observation will settle a product or API choice. Do not turn routine decisions into design exercises.

Foundations determine how to build the work. This principle determines what result is worth building.
