# Linear Skill for Claude Code

## Problem Statement

**Challenge:** Claude AI has no native integration with Linear project management—it can't read tickets, update issue status, comment on tasks, or implement code directly from ticket descriptions. Teams using Linear for issue tracking must manually context-switch between Linear and Claude, copy-pasting requirements and manually updating status when work is complete.

**Solution:** The Linear skill bridges this gap by connecting Claude directly to your Linear workspace through a GraphQL API client. It enables Claude to autonomously read issues, understand requirements, implement code, and manage ticket lifecycle—keeping your project management system in sync with actual work progress.

### Key Capabilities
- **View & filter issues** — List issues by status, assignee, priority, label, or team
- **Execute on tickets** — Fetch requirements, implement changes, update status, comment
- **Manage tickets** — Create, update, comment, label, assign, and archive issues
- **Search & organize** — Full-text search, view teams/projects/states/cycles

---

## Design Tradeoffs

### 1. **GraphQL API vs REST Endpoints**

**Choice:** GraphQL API (via `@linear/sdk`)

**Tradeoff:**
- ✅ **Wins:** Efficient querying (fetch only needed fields), single round-trip for complex data (issue + comments + labels), strongly typed responses enable better validation
- ❌ **Cost:** Requires understanding of GraphQL schema, steeper learning curve, debugging queries is harder than REST endpoints

**Why:** Linear's GraphQL API is the canonical integration path with proper pagination and type safety. REST would require multiple calls per operation and loose typing.

---

### 2. **Stateless CLI Scripts vs Persistent Session / Interactive Shell**

**Choice:** Stateless Node.js CLI scripts that execute per-command

**Tradeoff:**
- ✅ **Wins:** Simple to invoke from Claude (just shell commands), no daemon to manage, each script is independent and testable, environment setup is explicit
- ❌ **Cost:** Re-authenticate on every command (via `LINEAR_API_KEY`), higher latency per operation, can't maintain conversation context across commands

**Why:** Claude operates in command-based workflows (Bash tool). A stateless design avoids managing long-lived processes and keeps each operation atomic and reproducible.

---

### 3. **Linear SDK (`@linear/sdk`) vs Custom GraphQL Client**

**Choice:** Official `@linear/sdk` library

**Tradeoff:**
- ✅ **Wins:** Type-safe query builders, built-in pagination, maintained by Linear team, error handling out-of-box
- ❌ **Cost:** Larger dependency, less control over exact queries, breaking changes in SDK updates affect all commands

**Why:** The SDK abstracts away GraphQL complexity and ensures compatibility with Linear's API as it evolves. Building a custom client would duplicate maintenance burden.

---

## Installation

1. **Clone this repo** and copy the `linear/` folder to your Claude Code skills directory
2. **Set your Linear API key:**
   ```bash
   export LINEAR_API_KEY="lin_api_..."  # From https://linear.app/settings/api
   ```
3. **Run setup to install dependencies:**
   ```bash
   bash linear/scripts/setup.sh
   ```
4. **Verify connection:**
   ```bash
   node linear/scripts/linear.js me
   ```

## Usage

See `SKILL.md` for full documentation on:
- All commands and their flags
- Execute-on-ticket workflow (fetch → implement → update)
- Filtering and search patterns
- TODO discovery and ticket creation

### Quick Examples
```bash
# List my assigned issues
node linear.js issues --assignee me --pretty

# Fetch a specific issue
node linear.js issue BLA-42

# Update status to "Done"
node linear.js update BLA-42 --status "Done"

# Add a comment
node linear.js comment BLA-42 --body "Implementation complete"
```

## Files

- **`SKILL.md`** — Complete skill documentation
- **`scripts/linear.js`** — Main CLI entry point (handles all operations)
- **`scripts/setup.sh`** — Dependency installation and validation
- **`examples/common-tasks.md`** — Real-world usage examples
- **`references/api-reference.md`** — GraphQL schema reference
- **`references/workflows.md`** — Step-by-step procedures

## Architecture Overview

```
linear.js (CLI entry point)
├── Parse command + flags
├── Initialize Linear SDK client
├── Execute GraphQL query
└── Format and return results
```

The skill is a thin wrapper around Linear's GraphQL API. Each command translates user intent into a GraphQL query, executes it, and formats the response for readability.

## Author

Created by mjones for OpenClaw / Claude Code integration
