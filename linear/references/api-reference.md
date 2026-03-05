# Linear API Reference

Complete reference for all Linear commands, options, and underlying API details.

## Authentication

All commands require the `LINEAR_API_KEY` environment variable:

```bash
export LINEAR_API_KEY="lin_api_..."
```

Get your key from [https://linear.app/settings/api](https://linear.app/settings/api)

The `@linear/sdk` library handles authentication and rate limiting automatically.

## User & Team Commands

### me
Get current authenticated user.

```bash
node linear.js me [--pretty]
```

**Output:**
```json
{
  "id": "user-1234",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "displayName": "Jane"
}
```

---

### teams
List all teams in the workspace.

```bash
node linear.js teams [--pretty]
```

**Output:**
```json
[
  {
    "id": "team-1",
    "name": "Backend",
    "key": "BE"
  },
  {
    "id": "team-2",
    "name": "Frontend",
    "key": "FE"
  }
]
```

**Note:** Use team IDs for filtering and creating issues.

---

## Project & Metadata Commands

### projects
List all projects.

```bash
node linear.js projects [--pretty]
```

**Output:**
```json
[
  {
    "id": "proj-1",
    "name": "Q1 Roadmap",
    "key": "Q1",
    "teamId": "team-1"
  }
]
```

---

### states
List workflow states (statuses) for issues.

```bash
node linear.js states [--team TEAM_ID] [--pretty]
```

**Options:**
- `--team TEAM_ID` — Filter by team (optional)

**Output:**
```json
[
  {
    "id": "state-1",
    "name": "Backlog",
    "type": "backlog",
    "teamId": "team-1"
  },
  {
    "id": "state-2",
    "name": "In Progress",
    "type": "started",
    "teamId": "team-1"
  },
  {
    "id": "state-3",
    "name": "Done",
    "type": "completed",
    "teamId": "team-1"
  }
]
```

**Note:** Use state names (e.g., "Done", "In Progress") in `update` commands.

---

### labels
List all available labels.

```bash
node linear.js labels [--pretty]
```

**Output:**
```json
[
  {
    "id": "label-1",
    "name": "bug",
    "color": "#FF0000",
    "teamId": "team-1"
  },
  {
    "id": "label-2",
    "name": "enhancement",
    "color": "#00FF00",
    "teamId": "team-1"
  }
]
```

---

### cycles
List cycles (sprints) for a team.

```bash
node linear.js cycles [--team TEAM_ID] [--pretty]
```

**Options:**
- `--team TEAM_ID` — Filter by team (optional)

**Output:**
```json
[
  {
    "id": "cycle-1",
    "number": 1,
    "name": "Sprint 1",
    "startsAt": "2025-02-17T00:00:00Z",
    "endsAt": "2025-03-03T00:00:00Z",
    "status": "active",
    "teamId": "team-1"
  }
]
```

---

## Issue Commands

### issues
List and filter issues.

```bash
node linear.js issues \
  [--team TEAM_ID] \
  [--status "In Progress"] \
  [--assignee me|USER_ID] \
  [--priority 1-4] \
  [--label "bug"] \
  [--label "urgent"] \
  [--pretty]
```

**Options:**
- `--team TEAM_ID` — Filter by team
- `--status "In Progress"` — Filter by state name (e.g., "In Progress", "Done", "Backlog")
- `--assignee me` — Show issues assigned to current user
- `--assignee USER_ID` — Filter by assignee ID
- `--priority 1-4` — Filter by priority (1=urgent, 2=high, 3=medium, 4=low, 0=no priority)
- `--label "bug"` — Filter by label (can be repeated for multiple labels)
- `--pretty` — Human-readable output

**Output:**
```json
[
  {
    "id": "issue-1",
    "identifier": "BE-42",
    "title": "Fix authentication bug",
    "state": "In Progress",
    "assignee": "Jane Doe",
    "priority": 1,
    "labels": ["bug", "critical"],
    "createdAt": "2025-02-10T10:30:00Z"
  }
]
```

**Filtering Logic:**
- Multiple filters are AND'd together (all must match)
- Multiple `--label` flags are OR'd (any label match)
- `--assignee me` is a special case that gets the current user's ID

---

### issue
Get full details for a single issue.

```bash
node linear.js issue ISSUE_ID [--pretty]
```

**Arguments:**
- `ISSUE_ID` — Issue ID (e.g., "BE-42") or internal ID

**Output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-42",
  "title": "Fix authentication bug",
  "description": "Users are unable to log in with OAuth providers...",
  "state": "In Progress",
  "status": "started",
  "priority": 1,
  "assignee": "Jane Doe",
  "assigneeId": "user-1",
  "labels": [
    {
      "id": "label-1",
      "name": "bug"
    }
  ],
  "createdAt": "2025-02-10T10:30:00Z",
  "updatedAt": "2025-02-15T14:22:00Z",
  "comments": [
    {
      "id": "comment-1",
      "body": "Starting investigation",
      "author": "Jane Doe",
      "createdAt": "2025-02-15T10:00:00Z"
    }
  ],
  "url": "https://linear.app/team/issue/BE-42"
}
```

---

### search
Full-text search across issues.

```bash
node linear.js search --query "authentication" [--pretty]
```

**Options:**
- `--query "text"` — Search term (required)

**Output:**
```json
[
  {
    "id": "issue-1",
    "identifier": "BE-42",
    "title": "Fix authentication bug",
    "state": "In Progress",
    "assignee": "Jane Doe"
  },
  {
    "id": "issue-2",
    "identifier": "BE-35",
    "title": "Add multi-factor authentication",
    "state": "Backlog",
    "assignee": null
  }
]
```

**Note:** Search matches against title and description. Results are sorted by relevance.

---

## Issue Modification Commands

### create
Create a new issue.

```bash
node linear.js create \
  --team TEAM_ID \
  --title "Issue title" \
  --desc "Issue description" \
  [--priority 1-4] \
  [--pretty]
```

**Options:**
- `--team TEAM_ID` — Team ID (required)
- `--title "..."` — Issue title (required)
- `--desc "..."` — Description/body (optional)
- `--priority 1-4` — Priority level (optional, 1=urgent, 2=high, 3=medium, 4=low)

**Output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-100",
  "title": "Issue title",
  "state": "Backlog",
  "url": "https://linear.app/team/issue/BE-100"
}
```

**Note:** New issues are created in the team's default backlog state.

---

### update
Update issue fields.

```bash
node linear.js update ISSUE_ID \
  [--status "Done"] \
  [--title "New title"] \
  [--priority 1] \
  [--pretty]
```

**Options:**
- `--status "NAME"` — State name (e.g., "In Progress", "Done") (optional)
- `--title "..."` — New title (optional)
- `--priority 1-4` — Priority level (optional)

**Output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-42",
  "title": "New title",
  "state": "Done",
  "priority": 1
}
```

**Note:** Only provided fields are updated. Missing fields are left unchanged.

---

### comment
Add a comment to an issue.

```bash
node linear.js comment ISSUE_ID --body "Comment text" [--pretty]
```

**Options:**
- `--body "..."` — Comment text (required, markdown supported)

**Output:**
```json
{
  "id": "comment-1",
  "body": "Comment text",
  "createdAt": "2025-02-15T14:30:00Z"
}
```

**Note:** Markdown formatting is supported. @mentions and #issue-references work.

---

### label
Add labels to an issue (preserves existing labels).

```bash
node linear.js label ISSUE_ID \
  --add "bug" \
  --add "urgent" \
  [--pretty]
```

**Options:**
- `--add "LABEL_NAME"` — Label to add (required, can be repeated)

**Output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-42",
  "labels": ["bug", "urgent", "existing-label"]
}
```

**Note:** Labels are case-sensitive. Use `node linear.js labels` to see available labels.

---

### assign
Assign an issue to a user.

```bash
node linear.js assign ISSUE_ID --user USER_ID [--pretty]
```

**Options:**
- `--user USER_ID` — User ID to assign (required)

**Output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-42",
  "assignee": "Jane Doe"
}
```

**Note:** Get user IDs from the workspace. Use `node linear.js issues --assignee me` to work with the current user.

---

### archive
Archive an issue.

```bash
node linear.js archive ISSUE_ID [--pretty]
```

**Output:**
```json
{
  "id": "issue-1",
  "identifier": "BE-42",
  "archived": true
}
```

**Note:** Archived issues are removed from views but remain searchable.

---

## Advanced: Direct @linear/sdk Usage

For cases requiring custom queries beyond the CLI commands, use the `@linear/sdk` library directly:

```javascript
const { LinearClient } = require('@linear/sdk');

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

// Fetch issues for a specific cycle
const cycles = await client.cycles();
const activeCycle = cycles.nodes.find(c => c.status === 'active');
const issues = await client.issues({ filter: { cycle: { id: { eq: activeCycle.id } } } });

issues.nodes.forEach(issue => {
  console.log(`${issue.identifier}: ${issue.title} (${issue.state.name})`);
});
```

---

## Rate Limits

Linear API has the following rate limits:

- **Standard plan:** 60 requests/minute
- **Pro plan:** 120 requests/minute
- **Enterprise:** Custom limits

The `@linear/sdk` automatically handles rate limiting with exponential backoff. If you exceed limits, requests will be retried.

---

## Pagination

For large result sets, the SDK handles pagination automatically. The CLI returns all results by default.

To limit results in custom scripts:

```javascript
const issues = await client.issues({ first: 50 }); // Fetch first 50
```

---

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|---|---|---|
| `LINEAR_API_KEY not set` | Missing environment variable | `export LINEAR_API_KEY="lin_api_..."` |
| `Invalid API key` | Wrong or expired key | Verify key at https://linear.app/settings/api |
| `State not found` | Invalid state name | Use exact state name (e.g., "In Progress", not "in progress") |
| `Team not found` | Invalid team ID | Run `node linear.js teams` to see valid IDs |
| `Rate limit exceeded` | Too many requests | Wait and retry; SDK will auto-retry |

---

## GraphQL Schema

For advanced queries, the Linear API is GraphQL-based. The `@linear/sdk` provides typed access to the schema.

Common queries:

```graphql
query {
  viewer {
    id
    name
    email
  }
  issues(first: 10) {
    nodes {
      id
      identifier
      title
      state { name }
      assignee { name }
      priority
    }
  }
}
```

The CLI commands above are wrappers around these queries. For custom needs, use the JavaScript SDK or craft raw GraphQL queries.
