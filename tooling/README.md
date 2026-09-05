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
