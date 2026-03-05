#!/usr/bin/env node

const { LinearClient } = require('@linear/sdk');

// Check for API key
if (!process.env.LINEAR_API_KEY) {
  console.error('❌ Error: LINEAR_API_KEY environment variable is not set');
  console.error('Set it with: export LINEAR_API_KEY="lin_api_..."');
  process.exit(1);
}

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];
const prettyPrint = args.includes('--pretty');

// Utility to output JSON
function output(data) {
  if (prettyPrint) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data));
  }
}

// Utility to parse flag arguments
function parseFlags(startIdx = 1) {
  const flags = {};
  for (let i = startIdx; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        if (flags[key]) {
          // Handle multiple values for same flag (e.g., --label)
          if (Array.isArray(flags[key])) {
            flags[key].push(value);
          } else {
            flags[key] = [flags[key], value];
          }
        } else {
          flags[key] = value;
        }
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

// Main command router
async function main() {
  try {
    switch (command) {
      case 'me':
        await cmdMe();
        break;
      case 'teams':
        await cmdTeams();
        break;
      case 'projects':
        await cmdProjects();
        break;
      case 'states':
        await cmdStates();
        break;
      case 'labels':
        await cmdLabels();
        break;
      case 'issues':
        await cmdIssues();
        break;
      case 'issue':
        await cmdIssue();
        break;
      case 'search':
        await cmdSearch();
        break;
      case 'create':
        await cmdCreate();
        break;
      case 'update':
        await cmdUpdate();
        break;
      case 'comment':
        await cmdComment();
        break;
      case 'label':
        await cmdLabel();
        break;
      case 'assign':
        await cmdAssign();
        break;
      case 'archive':
        await cmdArchive();
        break;
      case 'cycles':
        await cmdCycles();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Available commands: me, teams, projects, states, labels, issues, issue, search, create, update, comment, label, assign, archive, cycles');
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

// Commands

async function cmdMe() {
  const viewer = await client.viewer;
  output({
    id: viewer.id,
    name: viewer.name,
    email: viewer.email,
    displayName: viewer.displayName,
  });
}

async function cmdTeams() {
  const teams = await client.teams();
  const result = teams.nodes.map(team => ({
    id: team.id,
    name: team.name,
    key: team.key,
  }));
  output(result);
}

async function cmdProjects() {
  const projects = await client.projects();
  const result = projects.nodes.map(proj => ({
    id: proj.id,
    name: proj.name,
    key: proj.key,
    teamId: proj.teamId,
  }));
  output(result);
}

async function cmdStates() {
  const flags = parseFlags(1);
  let states;

  if (flags.team) {
    states = await client.workflowStates({ filter: { teamId: { eq: flags.team } } });
  } else {
    states = await client.workflowStates();
  }

  const result = states.nodes.map(state => ({
    id: state.id,
    name: state.name,
    type: state.type,
    teamId: state.teamId,
  }));
  output(result);
}

async function cmdLabels() {
  const labels = await client.issueLabels();
  const result = labels.nodes.map(label => ({
    id: label.id,
    name: label.name,
    color: label.color,
    teamId: label.teamId,
  }));
  output(result);
}

async function cmdIssues() {
  const flags = parseFlags(1);

  // Build filter
  let filter = {};

  if (flags.team) {
    filter.team = { id: { eq: flags.team } };
  }

  if (flags.status) {
    filter.state = { name: { eq: flags.status } };
  }

  if (flags.assignee === 'me') {
    filter.assignee = { isMe: {} };
  } else if (flags.assignee) {
    filter.assignee = { id: { eq: flags.assignee } };
  }

  if (flags.priority) {
    filter.priority = { eq: parseInt(flags.priority) };
  }

  if (flags.label) {
    const labels = Array.isArray(flags.label) ? flags.label : [flags.label];
    filter.labels = { some: { name: { in: labels } } };
  }

  const filterObj = Object.keys(filter).length > 0 ? { filter } : {};
  const issues = await client.issues(filterObj);

  const result = issues.nodes.map(issue => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state?.name,
    assignee: issue.assignee?.name,
    priority: issue.priority,
    labels: issue.labels?.nodes?.map(l => l.name) || [],
    createdAt: issue.createdAt,
  }));
  output(result);
}

async function cmdIssue() {
  const issueId = args[1];
  if (!issueId) {
    console.error('Usage: node linear.js issue <ISSUE_ID>');
    process.exit(1);
  }

  const issue = await client.issue(issueId);

  const comments = await issue.comments();
  const commentList = comments.nodes.map(comment => ({
    id: comment.id,
    body: comment.body,
    author: comment.user?.name,
    createdAt: comment.createdAt,
  }));

  output({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    state: issue.state?.name,
    status: issue.state?.type,
    priority: issue.priority,
    assignee: issue.assignee?.name,
    assigneeId: issue.assigneeId,
    labels: issue.labels?.nodes?.map(l => ({ id: l.id, name: l.name })) || [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    comments: commentList,
    url: issue.url,
  });
}

async function cmdSearch() {
  const flags = parseFlags(1);
  const query = flags.query;

  if (!query) {
    console.error('Usage: node linear.js search --query "text"');
    process.exit(1);
  }

  const results = await client.issueSearch({ query });

  const mapped = results.nodes.map(issue => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state?.name,
    assignee: issue.assignee?.name,
  }));
  output(mapped);
}

async function cmdCreate() {
  const flags = parseFlags(1);
  const teamId = flags.team;
  const title = flags.title;
  const desc = flags.desc;
  const priority = flags.priority ? parseInt(flags.priority) : undefined;

  if (!teamId || !title) {
    console.error('Usage: node linear.js create --team TEAM_ID --title "..." --desc "..." [--priority 2]');
    process.exit(1);
  }

  const input = {
    teamId,
    title,
    description: desc,
  };

  if (priority !== undefined) {
    input.priority = priority;
  }

  const payload = await client.createIssue(input);
  const issue = await payload.issue;
  if (!issue) {
    throw new Error('Issue creation succeeded but no issue was returned');
  }

  output({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state?.name,
    url: issue.url,
  });
}

async function cmdUpdate() {
  const flags = parseFlags(1);
  const issueId = args[1];

  if (!issueId) {
    console.error('Usage: node linear.js update ISSUE_ID --status "Done" --title "..." --priority 1');
    process.exit(1);
  }

  const input = {};

  if (flags.status) {
    // Get the state ID from the status name
    const states = await client.workflowStates();
    const state = states.nodes.find(s => s.name === flags.status);
    if (state) {
      input.stateId = state.id;
    } else {
      console.error(`State "${flags.status}" not found`);
      process.exit(1);
    }
  }

  if (flags.title) {
    input.title = flags.title;
  }

  if (flags.priority) {
    input.priority = parseInt(flags.priority);
  }

  const payload = await client.updateIssue(issueId, input);
  const issue = await payload.issue;
  if (!issue) {
    throw new Error('Issue update succeeded but no issue was returned');
  }

  output({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    state: issue.state?.name,
    priority: issue.priority,
  });
}

async function cmdComment() {
  const flags = parseFlags(1);
  const issueId = args[1];
  const body = flags.body;

  if (!issueId || !body) {
    console.error('Usage: node linear.js comment ISSUE_ID --body "text"');
    process.exit(1);
  }

  const payload = await client.createComment({
    issueId,
    body,
  });
  const comment = await payload.comment;
  if (!comment) {
    throw new Error('Comment creation succeeded but no comment was returned');
  }

  output({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
  });
}

async function cmdLabel() {
  const flags = parseFlags(1);
  const issueId = args[1];
  const labelsToAdd = Array.isArray(flags.add) ? flags.add : (flags.add ? [flags.add] : []);

  if (!issueId || labelsToAdd.length === 0) {
    console.error('Usage: node linear.js label ISSUE_ID --add "bug" --add "urgent"');
    process.exit(1);
  }

  const issue = await client.issue(issueId);
  const existingLabels = issue.labels?.nodes?.map(l => l.id) || [];

  // Get label IDs for the labels to add
  const allLabels = await client.issueLabels();
  const labelIds = [];
  for (const labelName of labelsToAdd) {
    const label = allLabels.nodes.find(l => l.name === labelName);
    if (label && !existingLabels.includes(label.id)) {
      labelIds.push(label.id);
    }
  }

  if (labelIds.length > 0) {
    const payload = await client.updateIssue(issueId, {
      labelIds: [...existingLabels, ...labelIds],
    });
    const updated = await payload.issue;
    if (!updated) {
      throw new Error('Label update succeeded but no issue was returned');
    }

    output({
      id: updated.id,
      identifier: updated.identifier,
      labels: updated.labels?.nodes?.map(l => l.name) || [],
    });
  } else {
    const current = await client.issue(issueId);
    output({
      id: current.id,
      identifier: current.identifier,
      labels: current.labels?.nodes?.map(l => l.name) || [],
      message: 'No new labels added (may already exist)',
    });
  }
}

async function cmdAssign() {
  const flags = parseFlags(1);
  const issueId = args[1];
  const userId = flags.user;

  if (!issueId || !userId) {
    console.error('Usage: node linear.js assign ISSUE_ID --user USER_ID');
    process.exit(1);
  }

  const payload = await client.updateIssue(issueId, {
    assigneeId: userId,
  });
  const issue = await payload.issue;
  if (!issue) {
    throw new Error('Issue assignment succeeded but no issue was returned');
  }

  output({
    id: issue.id,
    identifier: issue.identifier,
    assignee: issue.assignee?.name,
  });
}

async function cmdArchive() {
  const issueId = args[1];

  if (!issueId) {
    console.error('Usage: node linear.js archive ISSUE_ID');
    process.exit(1);
  }

  const payload = await client.archiveIssue(issueId);
  const issue = await payload.entity;
  if (!issue) {
    throw new Error('Issue archive succeeded but no issue was returned');
  }

  output({
    id: issue.id,
    identifier: issue.identifier,
    archived: true,
  });
}

async function cmdCycles() {
  const flags = parseFlags(1);

  let filter = {};
  if (flags.team) {
    filter = { team: { id: { eq: flags.team } } };
  }

  const filterObj = Object.keys(filter).length > 0 ? { filter } : {};
  const cycles = await client.cycles(filterObj);

  const result = cycles.nodes.map(cycle => ({
    id: cycle.id,
    number: cycle.number,
    name: cycle.name,
    startsAt: cycle.startsAt,
    endsAt: cycle.endsAt,
    status: cycle.status,
    teamId: cycle.teamId,
  }));
  output(result);
}

// Run
main().catch(error => {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
});
