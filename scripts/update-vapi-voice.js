#!/usr/bin/env node

/**
 * Update Vapi Workflow Voice
 * Updates the existing workflow to use Lily British voice from ElevenLabs
 */

const https = require('https');

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '2cd34963-f7ed-4794-9fbb-76549b614bd0';
const VAPI_API_BASE = 'https://api.vapi.ai';
const WORKFLOW_ID = 'e13b1b19-3cd5-42ab-ba5d-7c46bf989a6e';

// Lily British voice ID from ElevenLabs
const LILY_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // ElevenLabs Lily voice ID

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

async function getWorkflow() {
  try {
    return await makeRequest('GET', `/workflow/${WORKFLOW_ID}`);
  } catch (error) {
    console.error('❌ Error fetching workflow:', error.message);
    throw error;
  }
}

async function updateWorkflowVoice() {
  try {
    console.log('📋 Fetching current workflow...');
    const workflow = await getWorkflow();
    
    console.log('🔄 Updating voice to Lily British...');
    
    // Find the conversation node and update its voice
    const updatedNodes = workflow.nodes.map(node => {
      if (node.type === 'conversation') {
        return {
          ...node,
          voice: {
            provider: '11labs',
            voiceId: LILY_VOICE_ID
          }
        };
      }
      return node;
    });

    const updateData = {
      nodes: updatedNodes
    };

    const updated = await makeRequest('PATCH', `/workflow/${WORKFLOW_ID}`, updateData);
    
    console.log('\n✅ Workflow voice updated successfully!');
    console.log(`\n📋 Voice Details:`);
    console.log(`   Provider: ElevenLabs`);
    console.log(`   Voice: Lily British`);
    console.log(`   Voice ID: ${LILY_VOICE_ID}`);
    console.log(`\n🎉 Your workflow now uses the Lily British voice!`);
    
    return updated;
  } catch (error) {
    console.error('\n❌ Error updating workflow:', error.message);
    
    // Try alternative voice IDs if the first one doesn't work
    const alternativeVoices = [
      'pNInz6obpgDQGcFmaJgB', // Common Lily voice ID
      'EXAVITQu4vr4xnSDxMaL', // Alternative
      'Lily' // Try just the name
    ];
    
    console.log('\n💡 Trying alternative voice IDs...');
    for (const voiceId of alternativeVoices.slice(1)) {
      try {
        const workflow = await getWorkflow();
        const updatedNodes = workflow.nodes.map(node => {
          if (node.type === 'conversation') {
            return {
              ...node,
              voice: {
                provider: '11labs',
                voiceId: voiceId
              }
            };
          }
          return node;
        });
        
        await makeRequest('PATCH', `/workflow/${WORKFLOW_ID}`, { nodes: updatedNodes });
        console.log(`\n✅ Successfully updated with voice ID: ${voiceId}`);
        return;
      } catch (e) {
        console.log(`   ❌ Voice ID ${voiceId} failed: ${e.message}`);
      }
    }
    
    throw error;
  }
}

async function main() {
  console.log('\n🎙️  Updating Vapi Workflow Voice\n');
  console.log('='.repeat(50));
  console.log(`\n📋 Workflow ID: ${WORKFLOW_ID}`);
  console.log(`🎤 Target Voice: Lily British (ElevenLabs)`);
  
  try {
    await updateWorkflowVoice();
  } catch (error) {
    console.error('\n❌ Failed to update voice:', error.message);
    console.log('\n💡 Alternative options:');
    console.log('   1. Update via dashboard: https://dashboard.vapi.ai/workflows/' + WORKFLOW_ID);
    console.log('   2. Check ElevenLabs voice library for correct voice ID');
    console.log('   3. Ensure ElevenLabs API key is configured in Vapi dashboard');
    process.exit(1);
  }
}

main().catch(console.error);

