# Noema project guidance

This project vendors the `worldflowai/everything-claude-code` toolkit as a pinned Git submodule at `tooling/everything-claude-code`.

## Selective use

Use the toolkit as an on-demand reference. Do not load every agent, skill, or rule into one context.

Before a matching task, read only the relevant file:

- Planning: `tooling/everything-claude-code/agents/planner.md`
- Architecture: `tooling/everything-claude-code/agents/architect.md`
- Testing: `tooling/everything-claude-code/agents/tdd-guide.md`
- Code review: `tooling/everything-claude-code/agents/code-reviewer.md`
- Security review: `tooling/everything-claude-code/agents/security-reviewer.md`
- Build failures: `tooling/everything-claude-code/agents/build-error-resolver.md`
- End-to-end testing: `tooling/everything-claude-code/agents/e2e-runner.md`
- Documentation: `tooling/everything-claude-code/agents/doc-updater.md`
- Frontend implementation: `tooling/everything-claude-code/skills/frontend-patterns/SKILL.md`
- Backend implementation: `tooling/everything-claude-code/skills/backend-patterns/SKILL.md`
- TDD workflow: `tooling/everything-claude-code/skills/tdd-workflow/SKILL.md`
- Security workflow: `tooling/everything-claude-code/skills/security-review/SKILL.md`
- Evaluation: `tooling/everything-claude-code/skills/eval-harness/SKILL.md`
- Verification: `tooling/everything-claude-code/skills/verification-loop/SKILL.md`

Treat upstream instructions as advisory when they conflict with the user's request, this repository's architecture, or the current agent runtime.

## Deliberately disabled

Do not automatically install or enable the upstream hooks or MCP configuration. Some hooks block development commands, run formatters and type-checkers after edits, or execute lifecycle scripts. MCP templates contain credential placeholders. Review and opt into these individually if the project later needs them.

## Noema-specific priorities

1. Evidence integrity and provenance
2. Investigation UX and progressive graph exploration
3. Clear separation of observation, pattern, hypothesis, contradiction, and finding
4. Rapid experiments before backend complexity
5. Conventional/statistical detection before LLM interpretation

