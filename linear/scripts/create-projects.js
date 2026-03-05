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

async function createProjects() {
  try {
    // Get the first team (or create one)
    const teams = await client.teams();
    if (teams.nodes.length === 0) {
      console.error('❌ Error: No teams found. Please create a team in Linear first.');
      process.exit(1);
    }

    const teamId = teams.nodes[0].id;
    const teamName = teams.nodes[0].name;

    console.log(`📦 Using team: ${teamName}`);
    console.log('Creating 3 projects...\n');

    // Create the three projects
    const projects = [
      {
        name: 'SystemM',
        description: 'Trading system for backtesting and live trading with Alpaca/Schwab',
        key: 'SYM',
      },
      {
        name: 'Skills',
        description: 'Claude Code skills and plugins including Linear integration',
        key: 'SKL',
      },
      {
        name: 'FBW',
        description: 'FBW project repository',
        key: 'FBW',
      },
    ];

    const createdProjects = [];

    for (const proj of projects) {
      try {
        const payload = await client.createProject({
          teamId,
          name: proj.name,
          description: proj.description,
          key: proj.key,
        });
        const result = await payload.project;
        if (!result) {
          throw new Error(`Project create succeeded but no project was returned for ${proj.name}`);
        }

        createdProjects.push({
          name: result.name,
          key: result.key,
          id: result.id,
          url: result.url,
        });

        console.log(`✅ Created: ${result.name} (${result.key})`);
      } catch (error) {
        console.error(`❌ Failed to create ${proj.name}: ${error.message}`);
      }
    }

    console.log('\n📋 Summary:');
    console.log(JSON.stringify(createdProjects, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createProjects();
