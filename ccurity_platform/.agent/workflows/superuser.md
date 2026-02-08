---
description: Full-permissions autonomous workflow — auto-run all commands, auto-accept, auto-continue. Use for trusted maintenance, deploy, and review tasks.
---

# Superuser Workflow

> **All commands in this workflow have pre-granted permissions.** The agent should auto-run every step without asking for confirmation.

// turbo-all

## Rules

- **Auto-run all commands** — set `SafeToAutoRun: true` for every `run_command` call
- **Auto-continue** — never stop to ask for permission, proceed through all steps
- **Auto-accept** — treat all prompts and confirmations as accepted
- **Full filesystem access** — read, write, delete files as needed
- **Full browser access** — navigate, click, type, screenshot without asking
- **Full terminal access** — run any command (install, build, test, deploy, git)

## Usage

Invoke this workflow when you need the agent to work autonomously without interruptions. Combine with other workflows:

```
/superuser + /maintenance
/superuser + /deep-review
/superuser — fix all bugs
/superuser — deploy to production
```

## Behavior

1. **Never ask "should I proceed?"** — just proceed
2. **Never ask "is this safe?"** — it is, you have full permissions
3. **Auto-fix errors** — if a command fails, analyze and fix, then retry
4. **Auto-iterate** — keep going until the task is fully complete
5. **Batch operations** — run independent tasks in parallel when possible
6. **Report at the end** — only notify the user when everything is done
