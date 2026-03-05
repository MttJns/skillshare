---
description: >
  This skill should be used when the user asks to "show my Linear issues",
  "work on a Linear ticket", "implement a Linear issue", "update a ticket status",
  "comment on an issue", "add a label to a ticket", "archive a ticket",
  "find my todos in Linear", "create a Linear issue", "search Linear",
  "show projects in Linear", "mark issue as done", "list teams", or any time the user
  mentions Linear tickets, issues, projects, or tasks. Use this skill
  proactively whenever the user references Linear or a ticket ID like "BLA-123".
---

# Linear Skill

This skill connects Claude directly to your Linear workspace, enabling you to read issues, find todos, implement code from ticket descriptions, update ticket status, comment, add labels, and archive issues.

## Overview

The Linear skill provides a bridge between Claude and your Linear project management workspace. It allows you to:

- **View issues** — List, filter, and inspect issues by status, assignee, priority, label, or team
- **Execute on tickets** — Fetch ticket descriptions, mark as "In Progress", implement the requested changes, and mark as "Done"
- **Manage tickets** — Create, update, comment, label, assign, and archive issues
- **Find TODOs** — Scan your codebase for `// TODO` comments and create Linear tickets for uncovered items
- **Search** — Full-text search across your Linear workspace
- **Organize** — View teams, projects, workflow states, labels, and cycles/sprints

## Authentication & Setup

**One-time setup:**

1. Get your Linear API key from [https://linear.app/settings/api](https://linear.app/settings/api)
2. Set it in your environment:
   ```bash
   export LINEAR_API_KEY="lin_api_..."
   ```
3. Run the setup script to validate your connection:
   ```bash
   bash skills/linear/scripts/setup.sh
   ```

The setup script checks that Node.js is installed, installs the `@linear/sdk`, and verifies your API key works.

## Quick Start

All Linear operations are performed via `linear.js`. Examples:

```bash
# Show your current user
node linear.js me

# List all your assigned issues
node linear.js issues --assignee me

# Get the full details of an issue
node linear.js issue BLA-42

# Create a new issue
node linear.js create --team TEAM_ID --title "Fix login bug" --desc "Users can't log in..."

# Update an issue status
node linear.js update BLA-42 --status "Done"

# Add a comment
node linear.js comment BLA-42 --body "Implementation complete, all tests pass"

# Add labels (preserves existing)
node linear.js label BLA-42 --add "bug" --add "urgent"

# Archive an issue
node linear.js archive BLA-42
```

Use `--pretty` flag for human-readable output:
```bash
node linear.js issues --assignee me --pretty
```

## Core Operations

| Operation | Command | Purpose |
|---|---|---|
| **View Issues** | `issues [--team ID] [--status "In Progress"] [--assignee me] [--priority 1] [--label "bug"]` | List and filter issues |
| **Get Issue** | `issue ISSUE_ID` | Fetch full issue details (title, description, status, labels, comments) |
| **Create Issue** | `create --team TEAM_ID --title "..." --desc "..." [--priority 2]` | Create a new issue |
| **Update Issue** | `update ISSUE_ID --status "Done" --title "..." --priority 1` | Update issue fields |
| **Search** | `search --query "text"` | Full-text search across issues |
| **Comment** | `comment ISSUE_ID --body "text"` | Add a comment to an issue |
| **Add Labels** | `label ISSUE_ID --add "bug" --add "urgent"` | Add labels (preserves existing) |
| **Assign** | `assign ISSUE_ID --user USER_ID` | Assign issue to a user |
| **Archive** | `archive ISSUE_ID` | Archive an issue |
| **Metadata** | `me`, `teams`, `projects`, `states`, `labels`, `cycles` | View users, teams, projects, workflow states, labels, or cycles |

## Execute-on-Ticket Workflow

The flagship use case: work on a ticket from start to finish.

### Step 1: Fetch the ticket
```bash
node linear.js issue BLA-42
```
Parse the response to understand:
- Title and description (acceptance criteria)
- Current status and assignee
- Existing comments and labels

### Step 2: Mark as "In Progress"
```bash
node linear.js update BLA-42 --status "In Progress"
```
Then add a comment to signal you're starting:
```bash
node linear.js comment BLA-42 --body "Starting implementation 🚀"
```

### Step 3: Implement the Code
Use your normal development workflow:
- Read the ticket description for requirements
- Examine related code files
- Make the necessary changes
- Run tests to verify correctness
- Create commits as needed

### Step 4: Mark as "Done"
Once implementation is complete:
```bash
node linear.js update BLA-42 --status "Done"
```

### Step 5: Add a Summary Comment
Summarize what you did and any side effects:
```bash
node linear.js comment BLA-42 --body "✅ Implementation complete.
- Updated authentication flow in src/auth.ts
- Added test coverage in tests/auth.test.ts
- All tests pass
- Ready for review"
```

## Finding and Creating TODOs

Use this workflow to scan your codebase for `// TODO` comments, cross-reference with existing Linear issues, and create tickets for uncovered items.

### Step 1: Search Codebase for TODOs
Use Grep to find all TODO comments:
```bash
# Find all TODO comments in your codebase
# (example for TypeScript, adjust pattern for your languages)
```

### Step 2: Get Existing Issues
Fetch all open issues to see what's already tracked:
```bash
node linear.js issues
```

### Step 3: Identify Gaps
Compare the TODO list with existing issues. For each TODO without a corresponding ticket:
- Note the file path and line number
- Create a Linear issue:
  ```bash
  node linear.js create --team TEAM_ID --title "TODO: Brief description" \
    --desc "File: src/utils.ts:42

  TODO comment: ... "
  ```

### Step 4: Update Codebase (Optional)
Link the TODO comment to the Linear ticket:
```typescript
// TODO: Remove deprecated API (see BLA-123)
// OLD: // TODO: Remove deprecated API
```

## Filtering and Searching

### Filter by Status
```bash
node linear.js issues --status "In Progress"
node linear.js issues --status "Done"
```

### Filter by Assignee
```bash
node linear.js issues --assignee me
node linear.js issues --assignee USER_ID
```

### Filter by Priority
Priority is numeric: 0 (no priority), 1 (urgent), 2 (high), 3 (medium), 4 (low)
```bash
node linear.js issues --priority 1  # Urgent only
node linear.js issues --priority 3  # Medium priority
```

### Filter by Label(s)
Multiple `--label` flags supported:
```bash
node linear.js issues --label "bug" --label "urgent"
```

### Filter by Team
```bash
node linear.js issues --team TEAM_ID
```

### Combine Filters
```bash
node linear.js issues --status "In Progress" --assignee me --label "bug" --priority 1
```

### Search
Full-text search across all issues:
```bash
node linear.js search --query "authentication bug"
```

## Before You Start

1. **Set LINEAR_API_KEY** in your shell or `.env`:
   ```bash
   export LINEAR_API_KEY="lin_api_..."
   ```
2. **Run setup once:**
   ```bash
   bash skills/linear/scripts/setup.sh
   ```
3. **Verify connection:**
   ```bash
   node linear.js me
   ```

## Tips

- **Always fetch the ticket first** before starting work, to get the latest state and any updates from teammates
- **Use `--pretty` flag** to inspect responses during development, switch to JSON for production
- **Preserve team context** — use `node linear.js teams` to find team IDs, then filter issues by team
- **Chain operations** — after updating status, immediately add a comment to keep the conversation in Linear
- **Respect assignees** — before assigning an issue to yourself or others, check if it's already assigned
- **Bulk operations** — for multiple updates, fetch all issues with one call, then loop through updates

## More Resources

- **API Reference** — See `references/api-reference.md` for full GraphQL and command reference
- **Detailed Workflows** — See `references/workflows.md` for step-by-step procedures including bulk updates, release notes, and advanced queries
- **Examples** — See `examples/common-tasks.md` for real-world conversation examples and expected outputs
