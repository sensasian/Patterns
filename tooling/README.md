# Development toolkits

`everything-claude-code` is a pinned submodule sourced from:

https://github.com/worldflowai/everything-claude-code

It supplies optional Claude Code agents, skills, rules, commands, hooks, and examples. Noema currently consumes its agents and skills as selective references through the project-level `CLAUDE.md`. Hooks and MCP configurations are not enabled.

Clone this repository with submodules:

```sh
git clone --recurse-submodules https://github.com/sensasian/Patterns.git
```

For an existing clone:

```sh
git submodule update --init --recursive
```

To update the pinned toolkit deliberately:

```sh
git submodule update --remote tooling/everything-claude-code
```

Review upstream changes before committing the new submodule pointer.

## Insight Weaver

`insight-weaver` is a pinned architecture reference sourced from:

https://github.com/Venkat-023/Insight-Weaver

It is not included as Noema runtime code. Its ingestion, retrieval and reasoning modules are being evaluated behind Noema-owned evidence interfaces. See `OPEN_SOURCE_REUSE.md` for the audit and reuse boundary.

## Truth Seeker

`truth-seeker` is a pinned UX reference sourced from:

https://github.com/aniketDash7/truth-seeker

Its select-and-expand React Flow interaction informs Noema's `Investigate This` flow. It is not runtime code, and its upstream licensing artifact must be clarified before any source is copied.

## LightRAG

`lightrag` is a pinned backend-engine candidate sourced from:

https://github.com/HKUDS/LightRAG

Its ingestion, chunking, graph extraction and retrieval capabilities are evaluated behind `lib/noema/engine-contracts.ts`. It must not write directly to Noema's canonical evidence graph.

To inspect exact pinned revisions:

```sh
git submodule status
```
