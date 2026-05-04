# Plans

This directory contains planning documents for future features, architectural changes, and improvements to Real Fake News.

## Purpose

Each markdown file in this directory describes a planned feature or change in detail — including the problem, proposed solution, implementation details, files to modify, DevOps impact, and testing strategy.

These documents serve as a reference for:
- Understanding what changes are planned and why
- Onboarding new developers to upcoming work
- Tracking design decisions and alternatives considered
- Coordinating with DevOps on infrastructure changes

## Convention

- Each file is named `kebab-case-description.md`
- Each begins with a status badge (`Planned`, `In Progress`, `Completed`, `Deprecated`)
- Each covers: Problem → Goal → Architecture → Implementation → DevOps Impact → Testing → Security → Edge Cases → Alternatives

## Current Plans

| File | Status | Priority | Description |
|---|---|---|---|
| `testing-suite.md` | Completed | High | Full testing suite: Vitest (unit/integration) + Playwright (E2E) across all workspaces |
| `admin-server-side-auth-gate.md` | Planned | High | Prevent admin frontend from being served without valid password |
