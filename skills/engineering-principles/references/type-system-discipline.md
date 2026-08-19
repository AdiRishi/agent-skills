# Type system discipline

Use the type checker to reject invalid states, mismatched identifiers, and missing cases before runtime. Strengthen types where they remove a real partial operation or repeated check.

## Model valid values

- Use discriminated unions, enums with payloads, sealed classes, or algebraic data types instead of bags of optional fields.
- Construct valid values rather than creating loose values and restricting them later.
- Give semantically different primitives distinct types. A `UserId` and an `OrderId` must not be interchangeable because both use strings.
- Treat external data as untyped until a boundary parser returns the domain type.
- Derive types from an authoritative schema instead of maintaining a second handwritten shape.

## Keep the compiler honest

- Validate or narrow a fact that the compiler cannot prove. Do not bury the gap in a cast.
- Make matching exhaustive so a new variant identifies every caller that needs an update.
- Push a repeated runtime assertion toward the boundary or into the model that makes it unnecessary.
- Stop strengthening a type when the added precision no longer prevents a failure or removes a caller obligation.

Ask these questions during a review:

1. Can the current fields represent a meaningless combination?
2. Can two arguments with the same primitive type be swapped accidentally?
3. Where did each cast or assertion originate?
4. Will a new variant fail compilation at every incomplete match?
5. Does another schema already own this shape?

Use [boundary discipline](boundary-discipline.md) to place parsing and [structural enforcement](encode-lessons-in-structure.md) when a recurring mistake can become a compile-time rule.
