# AGENTS.md — read this first

This is the entry point for any AI coding agent working in this repo (Cline, Copilot, Cursor,
Codex, Claude Code, or anything else that understands `AGENTS.md`).

## 1. Before you answer anything: read the contracts

Everything inside `contracts/` is a **human-authored contract** — a statement of what this repo
_is_, written only by the repo owner. You read it; you never write it. See
[`contracts/README.md`](contracts/README.md) for the full index and the rules around it.

| If the request mentions…                        | Read first                  |
| ----------------------------------------------- | --------------------------- |
| how the site looks, flows, pages, copy, wording | `contracts/design.md`       |
| why something is built this way, architecture   | `contracts/architecture.md` |
| "you can't do that", limits of this environment | `contracts/environment.md`  |

**Read the relevant contract before you read any source file, edit anything, or propose a plan.**
Skipping this step is how an agent produces a beautiful change that violates the one rule the owner
actually cared about.

## 2. Then explain the situation back

Open your first reply on any non-trivial request with a short **`Situation`** block — three
bullets, in your own words, no code:

```markdown
**Situation**

- What the request asks for: …
- Which contracts constrain it: `contracts/design.md` §… says …
- Where that leaves us: the work is X, provided we do not Y.
```

Then, and only then, propose or perform the work. If a request **conflicts** with a contract, say
so in the `Situation` block and stop — do not implement it. Contracts are absolute facts; when the
request and a contract disagree, the contract wins and the owner gets asked.

## 3. The contracts are locked with `chmod`

`contracts/` is `0555` and every file inside it is `0444` (read-only, owner included). Do not
`chmod`, `sudo`, copy-then-move, or otherwise "work around" that. A write attempt will fail, and
that failure is the intended answer — it means: _ask the human_.

If you believe a contract is wrong:

- do **not** edit it, and do not edit code to match your belief;
- say so in your reply, quoting the line you think is wrong;
- propose the exact wording change, in a fenced block, for the owner to apply by hand.

## 4. Everything else in this repo that you should know

- `.clinerules/` — Cline-specific rules: coding style (`basic_styling.md`) and the
  never-commit-without-instruction rule (`git.md`). These are instructions _to you_; `contracts/`
  is instructions _about the repo_.
- `README.md` — how to run the stack (`npm run setup`, `docker compose up --build -d`, doctor
  scripts).
- `TESTING.md` — Vitest / Playwright, and how to run them.
- `docs/configuration.md` — configuration precedence, which `.env` to edit, and the gotchas.
- `plans/README.md` — the working roadmap and the current session's agreed commit order.

## 5. Never delete a human-written `TODO`

`TODO` comments in this repo are written by the owner. They are a backlog, not litter — a "tidied"
`TODO` is a lost instruction nobody can recover, because the agent that removed it is usually the
only one who knew why it was there.

- **Leave every `TODO` in place.** Do not delete one, do not shrink one to fit a rewrite of the
  surrounding code, and do not "fold it into" a roadmap entry and call the comment redundant.
- **Implemented it?** Add a tick at the very start of the line and leave the original wording
  untouched:

  ```ts
  // [x] TODO: choose random assortment of writers?
  ```

- **Only partly implemented, or implemented differently?** Add the tick if the `TODO`'s ask is
  satisfied, then put the qualification on the line directly after it:

  ```ts
  // [x] TODO: this entire for loop looks like a hack
  // Satisfied by the shared `pickUnusedNews()` helper; the loop itself still exists, now over a
  // pre-filtered list.
  ```

  If it was **not** implemented at all, leave the `TODO` exactly as it is — no tick, no note.

- The exception is text an agent wrote itself in an earlier turn. Removing your own comment is
  fine; removing someone else's is not.

This applies to `TODO` in any file — source, docs, plans — and to `FIXME`/`HACK`/`XXX` by the same
logic.

## 6. If a contract is missing

The owner may add new contracts (e.g. `contracts/content-pipeline.md`). List the directory before
assuming the index above is complete:

```bash
ls -l contracts/
```
