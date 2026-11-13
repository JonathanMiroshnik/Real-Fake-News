# Contracts — human-only, agent-read-only

This directory is the **source of truth for what this repo is**, written only by a human.

- Every file here is `0444` (read-only, owner included).
- The directory itself is `0555` (no create, rename, or delete).
- Agents read these files. Agents never write them. See [`../AGENTS.md`](../AGENTS.md).

## Why it is locked

Instructions that live in the same editable tree as the code get "helpfully" adjusted by whatever
agent is editing last. A contract that an agent can rewrite is not a constraint — it is a
suggestion. `chmod` makes it a constraint: the write fails, the agent reports the failure and asks,
and the human stays the only author.

## Index

| File              | Owns                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `design.md`       | What the site is, what it must feel like, pages, navigation, tone, visual system         |
| `architecture.md` | The shape of the system: process boundaries, data ownership, invariants that must hold   |
| `environment.md`  | Hard facts about the box this repo runs on: OS, sandbox limits, what cannot be installed |

## Rules for agents

1. **Read the relevant file before acting.** Check the request against the contract first.
2. **Never modify anything here** — no `chmod`, no `sudo`, no `cp` over the top, no `git checkout`
   tricks. Read-only means read-only.
3. **Conflicts are reported, not resolved.** Quote the contract line, explain the conflict, and
   leave the decision to the owner.
4. **Do not copy a contract into a plan or a code comment and then treat the copy as editable.**
   Point at the contract instead; a copy drifts and the drift is invisible.
