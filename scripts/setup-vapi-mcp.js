#!/usr/bin/env node

/**
 * Vapi MCP Server Integration Script
 * 
 * Sets up Vapi MCP server connection for programmatic access
 * This allows using Vapi via Model Context Protocol
 */

const https = require('https');
const { URL } = require('url');

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY || '2cd34963-f7ed-4794-9fbb-76549b614bd0';
const VAPI_MCP_URL = 'https://mcp.vapi.ai/mcp';

/**
 * Make a request to Vapi MCP Server
 */
function mcpRequest(tool, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(VAPI_MCP_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
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
            reject(new Error(`MCP Error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: tool,
        arguments: params
      }
    }));
    req.end();
  });
}

/**
 * List available MCP tools
 */
async function listTools() {
  try {
    const url = new URL(VAPI_MCP_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve({ result: { tools: [] } });
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/list'
      }));
      req.end();
    });
  } catch (error) {
    console.error('Error listing tools:', error.message);
    return { result: { tools: [] } };
  }
}

/**
 * Create workflow via MCP
 */
async function createWorkflowViaMCP(convexUrl) {
  try {
    const result = await mcpRequest('create_workflow', {
      name: 'Derrimut Fitness Program Generator',
      description: 'Voice consultation workflow for generating personalized fitness and diet plans',
      serverUrl: `${convexUrl}/vapi/generate-program`,
      firstMessage: "Hi! I'm your Derrimut AI fitness coach. I'm here to help create a personalized workout and nutrition plan just for you. Let's start by getting to know you better. What's your primary fitness goal?",
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini'
      },
      voice: {
        provider: 'cartesia',
        voiceId: '71a7ad14-091c-4e8e-a314-022ece01c121',
        model: 'sonic-2'
      }
    });
    return result;
  } catch (error) {
    console.error('Error creating workflow via MCP:', error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🎙️  Vapi MCP Server Integration\n');
  console.log('='.repeat(50));

  console.log(`\n📡 MCP Server URL: ${VAPI_MCP_URL}`);
  console.log(`🔑 API Key: ${VAPI_API_KEY.substring(0, 8)}...`);

  try {
    console.log('\n📋 Listing available MCP tools...');
    const tools = await listTools();
    console.log('✅ MCP Server connected!');
    
    if (tools.result && tools.result.tools) {
      console.log(`\n📚 Available tools (${tools.result.tools.length}):`);
      tools.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description || 'No description'}`);
      });
    }

    console.log('\n💡 To use MCP server in Claude Desktop:');
    console.log('\nAdd to ~/Library/Application Support/Claude/claude_desktop_config.json:');
    console.log(JSON.stringify({
      mcpServers: {
        'vapi-mcp': {
          command: 'npx',
          args: [
            'mcp-remote',
            VAPI_MCP_URL,
            '--header',
            `Authorization: Bearer ${VAPI_API_KEY}`
          ]
        }
      }
    }, null, 2));

    console.log('\n✅ MCP Server setup information displayed above');

  } catch (error) {
    console.error('\n❌ Error connecting to MCP server:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your API key is correct');
    console.log('   2. You have network access to mcp.vapi.ai');
    console.log('   3. The MCP server is operational');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { mcpRequest, listTools, createWorkflowViaMCP };

