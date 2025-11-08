#!/usr/bin/env node

/**
 * Vapi Voice Agent Setup Script
 * 
 * This script helps configure Vapi workflows for the Derrimut Fitness Platform
 * Run: node scripts/setup-vapi.js
 */

const https = require('https');
const readline = require('readline');

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '2cd34963-f7ed-4794-9fbb-76549b614bd0';
const VAPI_PUBLIC_KEY = process.env.VAPI_PUBLIC_KEY || 'f90a42da-11c9-490e-a9ec-111c86ff45a7';
const VAPI_API_BASE = 'https://api.vapi.ai';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
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
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(body);
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

async function listAssistants() {
  try {
    console.log('\n📋 Fetching existing assistants...');
    const response = await makeRequest('GET', '/assistant');
    return response.data || response || [];
  } catch (error) {
    console.error('❌ Error fetching assistants:', error.message);
    return [];
  }
}

async function listWorkflows() {
  try {
    console.log('\n📋 Fetching existing workflows...');
    const response = await makeRequest('GET', '/workflow');
    return response.data || response || [];
  } catch (error) {
    console.error('❌ Error fetching workflows:', error.message);
    return [];
  }
}

async function createWorkflow(convexUrl) {
  const workflowData = {
    name: 'Derrimut Fitness Program Generator',
    description: 'Voice consultation workflow for generating personalized fitness and diet plans',
    firstMessage: "Hi! I'm your Derrimut AI fitness coach. I'm here to help create a personalized workout and nutrition plan just for you. Let's start by getting to know you better. What's your primary fitness goal?",
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
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
        }
      ],
      functions: [
        {
          type: 'function',
          function: {
            name: 'collect_fitness_data',
            description: 'Submit collected fitness information to generate personalized workout and diet plans',
            parameters: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  description: "User's age"
                },
                height: {
                  type: 'string',
                  description: "User's height (e.g., '5ft 10in' or '178cm')"
                },
                weight: {
                  type: 'string',
                  description: "User's weight (e.g., '75kg' or '165lbs')"
                },
                injuries: {
                  type: 'string',
                  description: 'Any injuries or physical limitations (use "none" if none)'
                },
                workout_days: {
                  type: 'number',
                  description: 'Number of days per week available for workouts'
                },
                fitness_goal: {
                  type: 'string',
                  description: 'Primary fitness goal'
                },
                fitness_level: {
                  type: 'string',
                  description: 'Current fitness level'
                },
                dietary_restrictions: {
                  type: 'string',
                  description: 'Dietary restrictions or preferences (use "none" if none)'
                }
              },
              required: ['age', 'height', 'weight', 'workout_days', 'fitness_goal', 'fitness_level']
            }
          }
        }
      ],
      functionCalling: 'auto'
    },
    serverUrl: `${convexUrl}/vapi/generate-program`,
    serverUrlSecret: '',
    endCallFunction: {
      type: 'end-call-function',
      function: {
        name: 'collect_fitness_data'
      }
    },
    voice: {
      provider: 'cartesia',
      voiceId: '71a7ad14-091c-4e8e-a314-022ece01c121',
      model: 'sonic-2',
      speed: 1.0
    },
    variableValues: {}
  };

  try {
    console.log('\n🚀 Creating workflow...');
    const response = await makeRequest('POST', '/workflow', workflowData);
    return response;
  } catch (error) {
    console.error('❌ Error creating workflow:', error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🎙️  Vapi Voice Agent Setup\n');
  console.log('=' .repeat(50));

  // Get Convex URL
  const convexUrl = await question('\n📝 Enter your Convex deployment URL (e.g., https://your-deployment.convex.site): ');
  if (!convexUrl) {
    console.log('❌ Convex URL is required');
    process.exit(1);
  }

  // List existing workflows
  const workflows = await listWorkflows();
  if (workflows.length > 0) {
    console.log(`\n✅ Found ${workflows.length} existing workflow(s):`);
    workflows.forEach((wf, idx) => {
      console.log(`   ${idx + 1}. ${wf.name || wf.id} (ID: ${wf.id})`);
    });
  }

  // Ask if user wants to create a new workflow
  const createNew = await question('\n❓ Create a new workflow? (y/n): ');
  if (createNew.toLowerCase() === 'y') {
    try {
      const workflow = await createWorkflow(convexUrl);
      console.log('\n✅ Workflow created successfully!');
      console.log(`\n📋 Workflow ID: ${workflow.id}`);
      console.log(`\n📝 Add this to your .env.local file:`);
      console.log(`NEXT_PUBLIC_VAPI_API_KEY=${VAPI_PUBLIC_KEY}`);
      console.log(`NEXT_PUBLIC_VAPI_WORKFLOW_ID=${workflow.id}`);
      console.log('\n✅ Setup complete!');
    } catch (error) {
      console.error('\n❌ Failed to create workflow:', error.message);
      console.log('\n💡 You can create the workflow manually in the Vapi dashboard:');
      console.log('   1. Go to https://dashboard.vapi.ai');
      console.log('   2. Create a new workflow');
      console.log('   3. Configure it to call:', `${convexUrl}/vapi/generate-program`);
      console.log('   4. Add the collect_fitness_data function');
      console.log('   5. Set up voice settings');
    }
  } else {
    const workflowId = await question('\n📝 Enter existing workflow ID to use: ');
    if (workflowId) {
      console.log(`\n✅ Using workflow ID: ${workflowId}`);
      console.log(`\n📝 Add this to your .env.local file:`);
      console.log(`NEXT_PUBLIC_VAPI_API_KEY=${VAPI_PUBLIC_KEY}`);
      console.log(`NEXT_PUBLIC_VAPI_WORKFLOW_ID=${workflowId}`);
    }
  }

  rl.close();
}

main().catch(console.error);

