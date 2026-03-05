# Common Tasks: Examples & Expected Behavior

Real-world examples of how Claude should use the Linear skill to handle common user requests.

---

## Example 1: "Show me my Linear issues"

**User request:**
> "Show me my Linear issues"

**What Claude should do:**

1. Run the command:
   ```bash
   node linear.js issues --assignee me --pretty
   ```

2. Parse the JSON response and present it to the user in a friendly format.

**Expected output:**
```
You have 3 assigned issues:

1. **BE-42** — Fix authentication bug
   Status: In Progress | Priority: Urgent
   Created: 2025-02-10

2. **FE-15** — Implement dark mode toggle
   Status: Backlog | Priority: High
   Labels: enhancement, user-facing

3. **BE-38** — Refactor database queries
   Status: In Progress | Priority: Medium
```

**Follow-up:** Claude should offer to:
- Show details of a specific issue
- Filter by status, priority, or label
- Work on one of the issues

---

## Example 2: "Work on ticket BE-42"

**User request:**
> "Work on ticket BE-42"

**What Claude should do:**

Follow the execute-on-ticket workflow:

1. **Fetch the ticket:**
   ```bash
   node linear.js issue BE-42 --pretty
   ```

2. **Present the details to the user:**
   ```
   Issue: BE-42 — Fix authentication bug
   Status: In Progress
   Assigned to: (unassigned)
   Priority: Urgent
   Labels: bug, critical

   Description:
   Users are unable to log in with OAuth providers. The error occurs
   when redirecting from the OAuth provider back to our app...

   [No existing comments]
   ```

3. **Assign to self if unassigned:**
   ```bash
   node linear.js assign BE-42 --user <current-user-id>
   ```

4. **Mark as "In Progress":**
   ```bash
   node linear.js update BE-42 --status "In Progress"
   ```

5. **Add starting comment:**
   ```bash
   node linear.js comment BE-42 --body "🚀 Starting implementation"
   ```

6. **Begin implementation:**
   - Ask the user for clarifications if needed
   - Examine relevant code files
   - Identify what needs to be changed
   - Write and test the code
   - Create commits

7. **Mark as "Done":**
   ```bash
   node linear.js update BE-42 --status "Done"
   ```

8. **Add completion comment:**
   ```bash
   node linear.js comment BE-42 --body "✅ Implementation complete.

   **Changes:**
   - Fixed OAuth redirect handler in src/auth.ts
   - Added error logging in src/middleware.ts
   - Added tests in tests/oauth.test.ts

   All tests pass. Ready for review."
   ```

**User should see:**
```
I'll work on BE-42 for you. Let me fetch the details...

✅ Ticket details loaded.
✅ Assigned to you.
✅ Status updated to "In Progress".
✅ Comment added.

Now analyzing the requirements:
- Users can't log in via OAuth
- Error during redirect from provider

Let me examine the relevant code...
[... implementation begins ...]
```

---

## Example 3: "Add the bug label to BE-7"

**User request:**
> "Add the bug label to BE-7"

**What Claude should do:**

1. Run the label command:
   ```bash
   node linear.js label BE-7 --add "bug"
   ```

2. Confirm the action to the user:
   ```
   ✅ Added label "bug" to BE-7
   Current labels: enhancement, bug
   ```

**If the label doesn't exist:**
- Offer to show available labels:
  ```bash
  node linear.js labels --pretty
  ```
- Ask the user which label they meant

---

## Example 4: "Find all my In Progress issues with high priority"

**User request:**
> "Find all my In Progress issues with high priority"

**What Claude should do:**

1. Run with combined filters:
   ```bash
   node linear.js issues --assignee me --status "In Progress" --priority 2 --pretty
   ```

2. Present results:
   ```
   Found 2 high-priority In Progress issues assigned to you:

   1. **BE-42** — Fix authentication bug
   2. **BE-45** — Add rate limiting to API
   ```

3. Offer follow-ups:
   - "Would you like to work on one of these?"
   - "Need more details on any of these issues?"
   - "Want to search for urgent (priority 1) issues instead?"

---

## Example 5: "Create a new issue: 'Fix broken password reset'"

**User request:**
> "Create a new issue: 'Fix broken password reset'"

**What Claude should do:**

1. **Ask for required info if not provided:**
   ```
   I can create that issue. Which team should it be in?
   Available teams: Backend, Frontend, DevOps
   ```

2. **Once team is selected, create the issue:**
   ```bash
   node linear.js create --team team-1 --title "Fix broken password reset" --desc "Password reset flow is broken. Needs investigation." --priority 1
   ```

3. **Confirm to the user:**
   ```
   ✅ Issue created: BE-100 — Fix broken password reset
   Priority: Urgent
   URL: https://linear.app/.../BE-100
   ```

4. **Offer follow-ups:**
   - "Would you like to start working on this?"
   - "Need to add more details or labels?"

---

## Example 6: "Search for 'authentication' issues"

**User request:**
> "Search for 'authentication' issues"

**What Claude should do:**

1. Run the search command:
   ```bash
   node linear.js search --query "authentication" --pretty
   ```

2. Present results:
   ```
   Found 4 issues matching "authentication":

   1. **BE-42** — Fix authentication bug
      Status: In Progress
   2. **BE-35** — Add multi-factor authentication
      Status: Backlog
   3. **BE-28** — OAuth 2.0 integration
      Status: Done
   4. **FE-8** — Update login UI for new auth flow
      Status: In Progress
   ```

3. Offer to show details or filter results.

---

## Example 7: "Archive all Done issues older than 30 days"

**User request:**
> "Archive all Done issues older than 30 days"

**What Claude should do:**

1. **Fetch all Done issues:**
   ```bash
   node linear.js issues --status "Done" --pretty
   ```

2. **Filter by date in code:**
   ```javascript
   const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
   const oldIssues = issues.filter(i => new Date(i.createdAt) < thirtyDaysAgo);
   ```

3. **Archive each:**
   ```bash
   node linear.js archive BE-10
   node linear.js archive BE-11
   # ... etc
   ```

4. **Report results:**
   ```
   ✅ Archived 5 issues:
   - BE-10 — Old feature
   - BE-11 — Completed fix
   - BE-12 — Done task
   - BE-13 — Finished improvement
   - BE-14 — Completed bug
   ```

---

## Example 8: "List all teams and projects"

**User request:**
> "List all teams and projects"

**What Claude should do:**

1. Run both commands:
   ```bash
   node linear.js teams --pretty
   node linear.js projects --pretty
   ```

2. Present in organized format:
   ```
   ## Teams
   - **Backend** (BE) — team-1
   - **Frontend** (FE) — team-2
   - **DevOps** (OPS) — team-3

   ## Projects
   - **Q1 Roadmap** (Q1) — Backend team
   - **Mobile App** (MOBILE) — Frontend team
   - **Infra 2025** (INFRA) — DevOps team
   ```

3. Offer to filter issues by team or project.

---

## Example 9: "Update BE-42 title to 'Urgent: Fix OAuth redirect bug'"

**User request:**
> "Update BE-42 title to 'Urgent: Fix OAuth redirect bug'"

**What Claude should do:**

1. Run the update:
   ```bash
   node linear.js update BE-42 --title "Urgent: Fix OAuth redirect bug"
   ```

2. Confirm:
   ```
   ✅ Updated BE-42
   New title: Urgent: Fix OAuth redirect bug
   ```

---

## Example 10: "Find TODOs in the codebase and create Linear tickets"

**User request:**
> "Find TODOs in the codebase and create Linear tickets"

**What Claude should do:**

1. **Search for TODO comments:**
   ```bash
   # Find all TODO comments
   # (use Grep tool or similar)
   ```

2. **Fetch existing issues to avoid duplicates:**
   ```bash
   node linear.js issues --pretty
   ```

3. **Create issues for new TODOs:**
   ```bash
   node linear.js create --team team-1 --title "TODO: Add rate limiting" \
     --desc "File: src/auth.ts:42

   // TODO: Add rate limiting"
   ```

4. **Report to user:**
   ```
   Found 3 TODO comments in code.

   Creating Linear issues:
   ✅ BE-101 — TODO: Add rate limiting
   ✅ BE-102 — TODO: Refactor database layer
   ✅ BE-103 — TODO: Add error tracking

   All 3 TODOs are now tracked in Linear!
   ```

---

## Example 11: "Show me the details of BE-42, including comments"

**User request:**
> "Show me the details of BE-42, including comments"

**What Claude should do:**

1. Fetch the issue:
   ```bash
   node linear.js issue BE-42 --pretty
   ```

2. Present in readable format:
   ```
   ## BE-42 — Fix authentication bug

   **Status:** In Progress
   **Priority:** Urgent
   **Assigned to:** Jane Doe
   **Labels:** bug, critical

   **Description:**
   Users are unable to log in with OAuth providers. The error occurs
   when redirecting from the OAuth provider back to our app. This is
   blocking multiple customers...

   **Comments:**
   1. Jane (2025-02-15 10:00)
      > Starting investigation

   2. Bob (2025-02-15 12:30)
      > Found the issue! It's in the redirect handler.
   ```

---

## Example 12: "Mark BE-40, BE-41, and BE-42 as Done"

**User request:**
> "Mark BE-40, BE-41, and BE-42 as Done"

**What Claude should do:**

1. Update each issue:
   ```bash
   node linear.js update BE-40 --status "Done"
   node linear.js update BE-41 --status "Done"
   node linear.js update BE-42 --status "Done"
   ```

2. Confirm:
   ```
   ✅ BE-40 — marked Done
   ✅ BE-41 — marked Done
   ✅ BE-42 — marked Done

   All 3 issues updated!
   ```

3. Offer follow-ups:
   - "Would you like to add summary comments to these?"
   - "Ready to release these changes?"

---

## Example 13: "What's the current status of my team?"

**User request:**
> "What's the current status of my team?"

**What Claude should do:**

1. **Fetch team issues:**
   ```bash
   node linear.js issues --team team-1 --pretty
   ```

2. **Analyze and report:**
   ```
   **Backend Team Status:**

   Total issues: 15
   - In Progress: 3
   - In Review: 2
   - Backlog: 10

   **Urgent Issues (Priority 1):**
   - BE-42 — Fix OAuth bug (In Progress)
   - BE-45 — API rate limiting (In Progress)

   **Blockers:**
   - BE-50 — Waiting on frontend (Blocked)

   **This Sprint:**
   Current cycle: Sprint 5 (ends 2025-02-28)
   Issues completed: 8 / 12
   On track for deadline? Yes
   ```

---

## Error Handling Examples

### When LINEAR_API_KEY is not set:
```
❌ Error: LINEAR_API_KEY environment variable is not set
Set it with: export LINEAR_API_KEY="lin_api_..."
Get your key from: https://linear.app/settings/api
```

### When ticket ID is invalid:
```
❌ Issue "INVALID-123" not found
Did you mean one of these?
- BE-123 (in Backend team)
- FE-123 (in Frontend team)
```

### When state name doesn't exist:
```
❌ Status "in progress" not found (check capitalization)
Available statuses: Backlog, In Progress, In Review, Done, Blocked
```

---

## Tips for Claude

1. **Always fetch before updating** — Check current state with `issue` command before making changes
2. **Use --pretty for readability** — Makes output easier to present to users
3. **Combine commands efficiently** — Batch operations when possible
4. **Provide context** — Show the user what you're doing at each step
5. **Offer follow-ups** — Ask users if they want to take further action
6. **Handle errors gracefully** — Show helpful error messages and suggestions
7. **Respect team structure** — Use team filters to stay organized
8. **Link related issues** — Add comments that reference related tickets (#BE-42)
