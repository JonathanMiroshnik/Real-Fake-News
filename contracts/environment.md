# Contract: Environment

> Human-authored. Read-only to agents. Facts here override anything an agent infers by trying
> something and watching it fail.

## The box

- Linux, x86_64, SELinux-enabled (`unconfined_u:unconfined_r:unconfined_t` context).
- The working user is `boo` (uid 1000) and is in the `docker` group. `sudo` exists but is **not**
  available to agents — a command that needs it is a command for the human.
- Root of the repo: `/home/boo/Real-Fake-News`. Tested against Node 26 / npm 11, but `package.json`
  sets no `engines` floor — treat anything below Node 20 as unsupported. Docker and Compose v2 are
  the supported way to run the stack (`npm run doctor` diagnoses them).
- `media/` is a symlink to an external drive (`/mnt/620EE85D0EE82BAB/Media`). It is **not part of
  the build** — never read, write, or scan inside it, and never copy it into the repo.

## Hard limits agents must design around

1. **Native modules do not build here.** `better-sqlite3` cannot be compiled in this sandbox. Tests
   that need a real SQLite file will fail to load; stub the DB module instead, and say so in the
   reply. Do not "fix" this by swapping the driver.
2. **No real API calls.** `DEEPSEEK_API_KEY`, `NEWSDATA_API_KEY`, `RUNWARE_API_KEY` are placeholders
   in `.env` while working here. Anything that needs live content must be run with
   `CONTENT_SOURCE=mock`.
3. **No network assumptions.** The agent has no reliable general internet access; do not add a
   dependency that fetches at install or build time, and do not plan work that requires pinging a
   third-party service to verify.
4. **Long-running processes must be backgrounded.** `docker compose up`, `npm run build`, and
   Playwright all exceed a single tool call's patience. Redirect to a temp file and poll it.
5. **Playwright browsers may be absent.** `~/.cache/ms-playwright` is empty on this box, so
   `npm run test:e2e` (configured with `webServer`) is not part of the routine loop here; run it
   only when the task is specifically about E2E, and expect it to need browsers installed first.
6. **`chmod` is not a suggestion.** `contracts/` is `0555` and its files `0444`. Writes fail by
   design. Agents do not `sudo`, do not `chmod`, and do not move files into place over a contract.

## What "done" looks like here

Work is done when, and only when:

```bash
npm run format:check     # prettier
npm run lint             # client + server + admin eslint
npm run typecheck        # client + server tsc
npm test                 # vitest, both workspaces
```

all pass locally, the changed files are listed in the reply, and **nothing is committed**. Commits
happen only on an explicit instruction — see `.clinerules/git.md`.

## Secrets

`.env`, `server/.env`, `*.local` are never committed and never printed into a reply, a log line, or
a test fixture. If a key is needed to explain something, refer to it by name only.
