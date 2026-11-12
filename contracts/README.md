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

## Rules for humans

- Edit one file: `chmod u+w contracts contracts/design.md`, edit, then re-lock with
  `scripts/lock-contracts.sh` (see below).
- Keep each contract short and blunt. A contract is a list of facts and non-negotiables, not a
  narrative. If it grows past ~150 lines, split it.
- If a contract is wrong, **change the contract** — then the code. Never the reverse.

## Editing a locked contract

```bash
chmod u+w contracts contracts/design.md     # unlock just what you touch
$EDITOR contracts/design.md
scripts/lock-contracts.sh                   # re-lock everything, then verify
```

`scripts/lock-contracts.sh` unlocks the directory, sets every `*.md` to `0444`, and sets the
directory itself to `0555` last.

## If your editor refuses to save

Some editors (and `prettier --write`, and `sed -i`) save by writing a temp file and renaming it over
the original. Your own `0444` file will not stop that — only the `0555` directory does — so if you
unlocked the directory to get in, re-lock it as soon as you are done. `git status` is the backstop:
a modified `contracts/*.md` that you did not mean to touch shows up there immediately.
