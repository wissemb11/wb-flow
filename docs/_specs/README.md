# Technical Specifications —

Low-level technical specifications for the internal logic of the WB-Labs agentic framework. These documents define the "hard rules" that the command implementations follow.

## Index

| File | Coverage |
|---|---|
| [command_composition_spec_v1_part1.md](command_composition_spec_v1_part1.md) | Part 1: Input routing, output piping, and self-application rules |
| [command_composition_spec_v1_part2.md](command_composition_spec_v1_part2.md) | Part 2: Deterministic CLI-to-AI handoff and state machine behavior |

## Purpose

These specs are intended for:
- Developers building new commands for the ecosystem.
- Architects auditing the deterministic behavior of the AI models.

## What Are Specs?

Specifications (specs) define the canonical behavior of each `/wb*` command. They serve as the authoritative reference for what a command should do, how it should behave in edge cases, and what its output format should be.

## Related Resources

- **[Commands](../commands/README.md)** — Command catalog
- **[Concepts](../concepts/README.md)** — Architecture deep-dives
- **[Start Here](../start_here/README.md)** — Getting started guide

- Deep-dives into how the CLI-to-AI handoff is handled.


## How to Use Specs

1. **Implementing a command?** Start with the spec to understand expected behavior
2. **Debugging a command?** Compare actual output against the spec
3. **Writing tests?** Use the spec as a test oracle — if behavior differs, either the code or the spec needs updating

## Available Specs

Spec files use the `_ref.md` suffix and are located in each command's directory. For example, `wbValid/wbValid_ref.md` contains the full reference specification for `/wbValid`.


## Spec Format

Each spec file follows a consistent format:
1. **Command signature** — Full syntax with all options
2. **Option descriptions** — Each flag explained with type, default, and example
3. **Behavior rules** — Canonical behavior in normal and edge cases
4. **Exit codes** — What each exit code means
5. **Security model** — What the command can and cannot access

