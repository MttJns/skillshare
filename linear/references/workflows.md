# Linear Workflows

Detailed step-by-step procedures for common use cases and advanced operations.

## Workflow: Execute on a Ticket

Complete end-to-end process for working on a Linear ticket: from start to completion, with status updates and comments.

### Prerequisites
- `LINEAR_API_KEY` environment variable set
- `linear.js` is executable or run with `node`
- Issue ID (e.g., "BE-42")

### Steps

#### 1. Fetch the Ticket

```bash
node linear.js issue BE-42 --pretty
```

**What to look for:**
- **Title & description** — Understand requirements and acceptance criteria
- **State** — Is it already "In Progress" or "Backlog"?
- **Assignee** — Is it already assigned? If not, plan to assign to yourself
- **Labels** — Are there "bug", "urgent", "documentation" labels? Do they match the scope?
- **Comments** — Any context or blockers from teammates?
- **URL** — Save for later reference or sharing

**Example output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-42",
  "title": "Implement password reset flow",
  "description": "Users need a way to reset forgotten passwords...",
  "state": "Backlog",
  "assignee": null,
  "labels": ["enhancement", "user-facing"],
  "comments": [],
  "url": "https://linear.app/..."
}
```

#### 2. Assign to Yourself (if needed)

If the issue is unassigned:

```bash
node linear.js assign BE-42 --user $(node linear.js me | jq -r '.id')
```

Or manually if you know your user ID:

```bash
node linear.js assign BE-42 --user user-1234
```

#### 3. Mark as "In Progress"

```bash
node linear.js update BE-42 --status "In Progress"
```

#### 4. Add a "Starting" Comment

Signal that you're beginning work (teammates see this in the Linear feed):

```bash
node linear.js comment BE-42 --body "🚀 Starting implementation. Will update with progress."
```

#### 5. Implement the Code

Use your normal development workflow:

```bash
# Examine related files
cat src/auth.ts

# Make changes
# (edit files as needed)

# Run tests
npm test

# Commit your work
git add .
git commit -m "feat: implement password reset flow (BE-42)"
```

#### 6. Mark as "Done"

Once implementation is complete and tests pass:

```bash
node linear.js update BE-42 --status "Done"
```

#### 7. Add a Completion Comment

Summarize what was implemented, any notes, and links:

```bash
node linear.js comment BE-42 --body "✅ Implementation complete.

**Changes:**
- Added \`resetPassword\` endpoint in src/auth.ts
- Added email verification in src/email.ts
- Added tests in tests/auth.test.ts

**Files changed:**
- src/auth.ts
- src/email.ts
- tests/auth.test.ts

All tests pass. Ready for review."
```

#### 8. Optional: Add Labels or Priority Adjustments

If the issue needs refinement:

```bash
# Add a "reviewed" or "ready-for-qa" label
node linear.js label BE-42 --add "ready-for-qa"
```

### Decision Tree

```
Start: Fetch ticket (node linear.js issue BE-42)
  ├─ Is it unassigned?
  │  └─ Yes → Assign to yourself
  ├─ Is the state not "In Progress"?
  │  └─ Yes → Update to "In Progress"
  ├─ Are there clarifications needed?
  │  └─ Yes → Add comment with questions
  └─ Ready to code?
     ├─ Yes → Implement as normal
     │  ├─ Tests pass?
     │  │  └─ Yes → Mark as "Done"
     │  │  └─ No → Fix and commit again
     │  └─ Add completion comment
     └─ No → Add comment and defer

End: Issue marked "Done" with summary comment
```

---

## Workflow: Bulk Update Issues

Update multiple issues at once (e.g., mark all "In Review" as "Done").

### Use Case
You've reviewed 5 tickets and need to mark them all as "Done" in one go.

### Steps

#### 1. List Issues Matching Criteria

```bash
node linear.js issues --status "In Review" --assignee me --pretty
```

**Output:**
```json
[
  { "identifier": "BE-40", "title": "..." },
  { "identifier": "BE-41", "title": "..." },
  { "identifier": "BE-42", "title": "..." }
]
```

#### 2. Update Each Issue (Manual Loop)

```bash
for issue_id in BE-40 BE-41 BE-42; do
  node linear.js update "$issue_id" --status "Done"
  echo "✅ Updated $issue_id"
done
```

#### 3. Add Comments (Optional)

```bash
for issue_id in BE-40 BE-41 BE-42; do
  node linear.js comment "$issue_id" --body "✅ Review complete and approved"
done
```

### Advanced: Custom Script

For complex bulk operations, create a Node.js script:

```javascript
const { LinearClient } = require('@linear/sdk');

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

async function bulkUpdate() {
  // Fetch issues in "In Review"
  const issues = await client.issues({
    filter: { state: { name: { eq: 'In Review' } } },
  });

  // Update each to "Done"
  for (const issue of issues.nodes) {
    const states = await client.workflowStates();
    const doneState = states.nodes.find(s => s.name === 'Done');

    await client.issueUpdate(issue.id, {
      stateId: doneState.id,
    });

    console.log(`✅ ${issue.identifier}: marked Done`);
  }
}

bulkUpdate().catch(console.error);
```

---

## Workflow: Find and Create TODO Issues

Scan your codebase for `// TODO` comments and create Linear tickets for uncovered items.

### Prerequisites
- Codebase with TODO comments
- Linear project to track them in
- Team ID for creating issues

### Steps

#### 1. Find All TODOs in Code

Use a Grep search to find all TODO comments:

```bash
# TypeScript/JavaScript example
grep -r "// TODO" src/

# Python example
grep -r "# TODO" .

# Output:
# src/auth.ts:42: // TODO: Add rate limiting
# src/auth.ts:105: // TODO: Support OAuth 2.0
# src/api.ts:18: // TODO: Handle null responses
```

#### 2. Fetch Existing Linear Issues

Get all open issues to avoid duplicates:

```bash
node linear.js issues --pretty > open-issues.json
```

Review and identify:
- Issues that already cover the TODOs
- Gaps where new issues are needed

#### 3. Create Issues for New TODOs

For each uncovered TODO, create a Linear issue:

```bash
node linear.js create \
  --team team-1 \
  --title "TODO: Add rate limiting" \
  --desc "File: src/auth.ts:42

\`\`\`
// TODO: Add rate limiting
\`\`\`

Need to prevent brute force attacks on login endpoint."
```

#### 4. Update Codebase (Optional)

Link the TODO comment to the Linear ticket:

```typescript
// TODO: Add rate limiting (see BE-50)
// OLD: // TODO: Add rate limiting
```

#### 5. Verify

```bash
node linear.js issues --label "todo" --pretty
```

Should show all newly created TODO issues.

### Advanced: Automated Todo Finder Script

Create a Node.js script to automate TODO detection:

```javascript
const fs = require('fs');
const path = require('path');
const { LinearClient } = require('@linear/sdk');

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

// Recursively find TODO comments
function findTodos(dir, filePattern = /\.(ts|js|py|go)$/) {
  const todos = [];

  function walk(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.startsWith('.')) continue;
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (filePattern.test(file)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const match = line.match(/TODO:\s*(.+)/);
          if (match) {
            todos.push({
              file: fullPath,
              line: idx + 1,
              text: match[1].trim(),
            });
          }
        });
      }
    }
  }

  walk(dir);
  return todos;
}

async function createIssuesForTodos() {
  const todos = findTodos('./src');
  const existingIssues = await client.issues();

  for (const todo of todos) {
    // Check if already tracked
    const existing = existingIssues.nodes.some(
      issue => issue.description && issue.description.includes(todo.file)
    );

    if (!existing) {
      console.log(`Creating issue for: ${todo.text}`);
      const issue = await client.issueCreate({
        teamId: 'team-1',
        title: `TODO: ${todo.text}`,
        description: `File: ${todo.file}:${todo.line}\n\n\`\`\`\n// TODO: ${todo.text}\n\`\`\``,
      });
      console.log(`✅ Created ${issue.identifier}`);
    }
  }
}

createIssuesForTodos().catch(console.error);
```

---

## Workflow: Generate Release Notes

Create a summary of completed work for a sprint or cycle.

### Use Case
Sprint is ending; you need to generate release notes from completed issues.

### Steps

#### 1. Get the Current or Target Cycle

```bash
node linear.js cycles --pretty
```

**Output:**
```json
[
  {
    "id": "cycle-1",
    "number": 5,
    "name": "Sprint 5",
    "status": "active",
    "endsAt": "2025-02-28T00:00:00Z"
  }
]
```

#### 2. Fetch All "Done" Issues (Manual Approach)

```bash
node linear.js issues --status "Done" --pretty > done-issues.json
```

#### 3. Format as Release Notes

```bash
echo "# Release Notes - Sprint 5" > RELEASE_NOTES.md
echo "" >> RELEASE_NOTES.md
echo "## Features" >> RELEASE_NOTES.md

# Parse and categorize issues
cat done-issues.json | jq -r '.[] | select(.labels[] | select(.name == "enhancement")) | "- \(.identifier): \(.title)"' >> RELEASE_NOTES.md

echo "" >> RELEASE_NOTES.md
echo "## Bug Fixes" >> RELEASE_NOTES.md
cat done-issues.json | jq -r '.[] | select(.labels[] | select(.name == "bug")) | "- \(.identifier): \(.title)"' >> RELEASE_NOTES.md
```

#### 4. Review and Polish

```bash
cat RELEASE_NOTES.md
```

Edit manually to improve clarity and organization.

#### 5. Post to Linear

Create a Linear issue summarizing the release:

```bash
node linear.js create \
  --team team-1 \
  --title "Release: Sprint 5" \
  --desc "$(cat RELEASE_NOTES.md)"
```

---

## Workflow: Priority Triage

Review all unassigned or low-priority issues and assign priorities.

### Steps

#### 1. Find Issues Without Priority

```bash
node linear.js issues --priority 0 --pretty
```

#### 2. Review Each Issue

For each issue without priority:
- Is it a bug? Priority 1 (urgent) or 2 (high)
- Is it a feature request? Priority 2 (high) or 3 (medium)
- Is it a nice-to-have? Priority 4 (low)

#### 3. Update Priorities

```bash
node linear.js update BE-42 --priority 1  # urgent
node linear.js update BE-43 --priority 2  # high
node linear.js update BE-44 --priority 4  # low
```

---

## Workflow: Blocked Issues

Mark and track issues that are blocked by other work.

### Steps

#### 1. Identify Blocker Relationship

If issue BE-50 is blocked by BE-40:

#### 2. Add Blockers as Comments

```bash
node linear.js comment BE-50 --body "🚫 Blocked by #BE-40 (waiting for auth implementation)"
```

#### 3. Update Status

Consider setting status to "Blocked" if your workspace has that state:

```bash
node linear.js update BE-50 --status "Blocked"
```

#### 4. When Blocker is Done

Update the blocked issue:

```bash
node linear.js comment BE-50 --body "✅ #BE-40 is now done. Unblocking this issue."
node linear.js update BE-50 --status "In Progress"
```

---

## Workflow: Cross-Team Coordination

Share and update issues across teams.

### Steps

#### 1. Find Issues for Another Team

```bash
node linear.js issues --team team-2 --status "In Review"
```

#### 2. Add Context Comment

```bash
node linear.js comment BE-100 --body "@jane we need this by Friday for the dashboard work. Let me know if you hit any blockers."
```

#### 3. Track Dependencies

If your work depends on another team's issue, track it:

```bash
node linear.js comment BE-42 --body "Depends on #BE-100 (Frontend team). Once merged, we can integrate."
```

---

## Tips for Efficient Workflows

1. **Save issue IDs** — When working on multiple tickets, save identifiers to a variable:
   ```bash
   ISSUES=(BE-40 BE-41 BE-42)
   ```

2. **Use filter combinations** — Combine flags to find exact issues:
   ```bash
   node linear.js issues --status "In Progress" --priority 1 --assignee me
   ```

3. **Batch operations** — Use shell loops for multiple updates:
   ```bash
   for id in "${ISSUES[@]}"; do
     node linear.js update "$id" --status "Done"
   done
   ```

4. **Add templates** — Create standard comment templates for common actions:
   ```bash
   COMMENT_TEMPLATE="✅ Implementation complete.\n**Files changed:**\n"
   node linear.js comment BE-42 --body "$COMMENT_TEMPLATE..."
   ```

5. **Check before updating** — Always fetch the latest state before updating:
   ```bash
   node linear.js issue BE-42 --pretty  # Check current state
   node linear.js update BE-42 --status "Done"  # Then update
   ```
