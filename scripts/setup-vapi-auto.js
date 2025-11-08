#!/usr/bin/env node

/**
 * Vapi Voice Agent Automated Setup Script
 * 
 * Fully automated workflow creation via Vapi REST API
 * Run: node scripts/setup-vapi-auto.js --convex-url YOUR_URL
 */

const https = require('https');
const { URL } = require('url');

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '2cd34963-f7ed-4794-9fbb-76549b614bd0';
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY || 'f90a42da-11c9-490e-a9ec-111c86ff45a7';
const VAPI_API_BASE = 'https://api.vapi.ai';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      parsed[key] = value;
      i++;
    }
  }
  return parsed;
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, VAPI_API_BASE);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function listWorkflows() {
  try {
    const response = await makeRequest('GET', '/workflow');
    // Handle different response formats
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.workflows && Array.isArray(response.workflows)) return response.workflows;
    return [];
  } catch (error) {
    console.error('⚠️  Error fetching workflows:', error.message);
    return [];
  }
}

async function getWorkflowById(id) {
  try {
    return await makeRequest('GET', `/workflow/${id}`);
  } catch (error) {
    return null;
  }
}

async function createWorkflow(convexUrl, options = {}) {
  // Vapi now uses node-based workflows
  const workflowData = {
    name: options.name || 'Derrimut Fitness Program Generator',
    nodes: [
      {
        type: 'start',
        name: 'start-node'
      },
      {
        type: 'conversation',
        name: 'conversation-node',
        model: {
          provider: 'openai',
          model: options.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a friendly and professional fitness coach for Derrimut Gym. Your goal is to collect fitness information from users through a natural conversation. 

Ask about:
1. Age
2. Height and weight
3. Any injuries or physical limitations
4. How many days per week they can work out
5. Their primary fitness goal (weight loss, muscle gain, endurance, general fitness, etc.)
6. Their current fitness level (beginner, intermediate, advanced)
7. Any dietary restrictions or preferences

Be conversational and encouraging. Once you have all the information, use the collect_fitness_data function to submit it.`
            },
            {
              role: 'user',
              content: options.firstMessage || "Hi! I'm your Derrimut AI fitness coach. I'm here to help create a personalized workout and nutrition plan just for you. Let's start by getting to know you better. What's your primary fitness goal?"
            }
          ]
        },
        voice: {
          provider: '11labs',
          voiceId: '21m00Tcm4TlvDq8ikWAM' // Default 11labs voice
        }
      },
      {
        type: 'tool',
        name: 'tool-node',
        tool: {
          type: 'function',
          function: {
            name: 'collect_fitness_data',
            description: 'Submit collected fitness information to generate personalized workout and diet plans',
            parameters: {
              type: 'object',
              properties: {
                age: { type: 'number', description: "User's age" },
                height: { type: 'string', description: "User's height" },
                weight: { type: 'string', description: "User's weight" },
                injuries: { type: 'string', description: 'Any injuries or limitations' },
                workout_days: { type: 'number', description: 'Days per week for workouts' },
                fitness_goal: { type: 'string', description: 'Primary fitness goal' },
                fitness_level: { type: 'string', description: 'Current fitness level' },
                dietary_restrictions: { type: 'string', description: 'Dietary restrictions' },
                user_id: { type: 'string', description: 'User ID' }
              },
              required: ['age', 'height', 'weight', 'workout_days', 'fitness_goal', 'fitness_level']
            },
            serverUrl: `${convexUrl}/vapi/generate-program`,
            serverUrlSecret: ''
          }
        }
      },
      {
        type: 'end',
        name: 'end-node'
      }
    ],
    edges: [
      {
        from: 'start-node',
        to: 'conversation-node'
      },
      {
        from: 'conversation-node',
        to: 'tool-node'
      },
      {
        from: 'tool-node',
        to: 'end-node'
      }
    ]
  };

  try {
    console.log('🚀 Creating workflow via Vapi API...');
    const response = await makeRequest('POST', '/workflow', workflowData);
    return response;
  } catch (error) {
    console.error('❌ Error creating workflow:', error.message);
    throw error;
  }
}

async function updateWorkflow(workflowId, convexUrl) {
  const updateData = {
    serverUrl: `${convexUrl}/vapi/generate-program`,
  };

  try {
    console.log(`🔄 Updating workflow ${workflowId}...`);
    const response = await makeRequest('PATCH', `/workflow/${workflowId}`, updateData);
    return response;
  } catch (error) {
    console.error('❌ Error updating workflow:', error.message);
    throw error;
  }
}

async function main() {
  const args = parseArgs();
  const convexUrl = args['convex-url'] || process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

  console.log('\n🎙️  Vapi Voice Agent Automated Setup\n');
  console.log('='.repeat(50));

  if (!convexUrl) {
    console.error('\n❌ Error: Convex URL is required');
    console.log('\nUsage:');
    console.log('  node scripts/setup-vapi-auto.js --convex-url https://your-deployment.convex.site');
    console.log('\nOr set environment variable:');
    console.log('  CONVEX_URL=https://your-deployment.convex.site node scripts/setup-vapi-auto.js');
    process.exit(1);
  }

  console.log(`\n📋 Convex URL: ${convexUrl}`);
  console.log(`🔑 Using API Key: ${VAPI_API_KEY.substring(0, 8)}...`);

  try {
    // Check existing workflows
    console.log('\n📋 Checking existing workflows...');
    const workflows = await listWorkflows();
    
    // Look for existing Derrimut workflow
    const existingWorkflow = workflows.find(wf => 
      wf.name && wf.name.includes('Derrimut') || 
      wf.name && wf.name.includes('Fitness Program')
    );

    if (existingWorkflow) {
      console.log(`\n✅ Found existing workflow: ${existingWorkflow.name} (ID: ${existingWorkflow.id})`);
      
      if (args['update'] === 'true' || args['update'] === 'yes') {
        await updateWorkflow(existingWorkflow.id, convexUrl);
        console.log('\n✅ Workflow updated successfully!');
        console.log(`\n📋 Workflow ID: ${existingWorkflow.id}`);
      } else {
        console.log('\n✅ Using existing workflow');
        console.log(`\n📋 Workflow ID: ${existingWorkflow.id}`);
      }
      
      console.log(`\n📝 Environment variables:`);
      console.log(`NEXT_PUBLIC_VAPI_API_KEY=${VAPI_PUBLIC_KEY}`);
      console.log(`NEXT_PUBLIC_VAPI_WORKFLOW_ID=${existingWorkflow.id}`);
      
      return;
    }

    // Create new workflow
    console.log('\n🚀 Creating new workflow...');
    const workflow = await createWorkflow(convexUrl);
    
    console.log('\n✅ Workflow created successfully!');
    console.log(`\n📋 Workflow Details:`);
    console.log(`   Name: ${workflow.name || 'Derrimut Fitness Program Generator'}`);
    console.log(`   ID: ${workflow.id}`);
    console.log(`   Server URL: ${workflow.serverUrl || `${convexUrl}/vapi/generate-program`}`);
    
    console.log(`\n📝 Add these to your .env.local file:`);
    console.log(`NEXT_PUBLIC_VAPI_API_KEY=${VAPI_PUBLIC_KEY}`);
    console.log(`NEXT_PUBLIC_VAPI_WORKFLOW_ID=${workflow.id}`);
    
    console.log(`\n✅ Setup complete!`);
    console.log(`\n🧪 Test your workflow:`);
    console.log(`   npm run dev`);
    console.log(`   Navigate to: http://localhost:3000/generate-program`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify your API key is correct');
    console.log('   2. Check your Convex URL is accessible');
    console.log('   3. Ensure the endpoint /vapi/generate-program exists');
    console.log('   4. Check Vapi API status: https://status.vapi.ai');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

