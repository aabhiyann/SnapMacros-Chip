# Agent Instructions — SnapMacros-Chip

## Commits

- **Never** add `Co-Authored-By` trailers or any AI agent attribution to commit messages. The user is the sole author of every commit. Do not include any AI tool name (Claude, Cursor, Codex, Copilot, etc.) in commit messages in any form.

## Git Branching Strategy

- All work happens on a **feature branch** cut from `main`, named by scope (e.g. `feat/completion`, `feat/push-notifications`, `fix/streak-bug`).
- Never commit directly to `main`.
- When work is done, push the feature branch and open a PR into `main`.

## Commit Granularity

Commits must be **as granular as possible** — one logical change per commit. The user tracks every step through git history, so more commits is always better than fewer.

Examples of the right granularity:
- Adding a single import → its own commit
- Adding a single function → its own commit
- Adding a single state variable → its own commit
- Adding a single UI section → its own commit
- Removing a single unused function → its own commit

Do **not** batch multiple changes into one commit just because they are related. Each discrete change gets its own commit with a descriptive message.

## Commit Message Format

Use conventional commit prefixes:

```
feat(<scope>): short description
fix(<scope>): short description
refactor(<scope>): short description
chore(<scope>): short description
docs(<scope>): short description
```

Scope should reflect the file or feature area (e.g. `push`, `profile`, `log/api`, `snap/result`, `ios/plist`, `healthkit`, `settings`).

Keep the subject line short and specific. No period at the end.

## Workflow for Making Changes

1. Make one small change at a time
2. Run `npx tsc --noEmit` to verify TypeScript is clean
3. Stage only that specific file: `git add <file>`
4. Commit with a descriptive conventional commit message (no AI attribution)
5. Repeat for the next change

Never use `git add .` or `git add -A` — always stage files individually to ensure each commit contains exactly one change.
