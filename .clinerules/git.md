## **🔴 HIGHEST PRIORITY: NEVER COMMIT OR PUSH WITHOUT AN EXPLICIT INSTRUCTION**

### **The rule**

- **Do NOT run `git commit`, `git push`, `git tag`, `git merge`, `git rebase`, `git reset`,
  `git stash`, `git checkout -- <path>`, `git restore`, or `git add`** unless the user's current
  message explicitly asks for that exact action in this turn.
- **Do NOT auto-commit "because the work is done."** A finished task means the work is done in the
  working tree. It does not mean it should be committed. Ending a task with uncommitted changes is
  the correct, expected end state.
- **Do NOT stage files to "be helpful" or to prepare a commit.** Leave the working tree dirty and
  unstaged (untracked new files stay untracked).
- **A plan that says "commit" is not an instruction.** Plan documents, TODOs, and phase checklists
  may describe commits; that describes the eventual shape of the work, not an authorization to run
  one now.
- **An earlier approval does not carry forward.** "Commit this" authorizes one commit, once. The
  next task starts with the no-commit default again.
- **Reporting is the deliverable.** When work is done, summarize what changed and which files are
  touched, then stop. If a commit seems warranted, **say so and wait** for the user to ask.

### **If a commit was already requested**

- Only `git add` the paths that belong to that specific change set — never `git add -A` /
  `git add .` unless the user asked for everything.
- **Never `git push`** as a follow-up to a commit unless pushing was also part of the instruction.
- **Never force-push, and never rewrite a commit the user has already seen.**

### **Reverting a mistake**

If a commit or push happened without approval, say so plainly, undo it immediately, and confirm the
recovery — do not bury it or proceed as if nothing happened:

- Uncommitted state: `git reset --mixed HEAD~1` (keeps all changes in the working tree).
- Pushed commits: stop and ask before doing anything; a rewrite of shared history is the user's
  call, not the agent's.
