#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

// Path to the MCP server
const serverPath = './build/index.js';

// Spawn the MCP server process
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔒 Fasten MCP Server Test Client');
console.log('--------------------------------');
console.log('Available commands:');
console.log('- check-auth: Check authentication status');
console.log('- login: Open the Fasten login page');
console.log('- save-token <token>: Save authentication token');
console.log('- get-summary: Get user summary');
console.log('- list-sources: List all sources');
console.log('- exit: Exit the test client');
console.log('--------------------------------');

// Handle server output
serverProcess.stdout.on('data', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'response') {
      console.log('\n📥 Response from server:');
      
      if (message.content) {
        message.content.forEach(item => {
          if (item.type === 'text') {
            console.log(item.text);
          }
        });
      }
      
      if (message.browser) {
        console.log(`\n🌐 Browser action: Opening ${message.browser.url}`);
      }
    }
  } catch (error) {
    console.log('Raw server output:', data.toString());
  }
  
  promptUser();
});

// Send a request to the server
function sendRequest(method, params = {}) {
  const request = {
    type: 'request',
    id: Date.now().toString(),
    method,
    params
  };
  
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
}

// Prompt the user for input
function promptUser() {
  rl.question('\n> ', (input) => {
    const [command, ...args] = input.trim().split(' ');
    
    switch (command) {
      case 'check-auth':
        sendRequest('check-auth-status');
        break;
        
      case 'login':
        sendRequest('login-to-fasten');
        break;
        
      case 'save-token':
        if (args.length === 0) {
          console.log('❌ Error: Token is required');
          promptUser();
          return;
        }
        sendRequest('save-auth-token', { token: args[0] });
        break;
        
      case 'get-summary':
        sendRequest('get-summary');
        break;
        
      case 'list-sources':
        sendRequest('list-sources');
        break;
        
      case 'exit':
        console.log('👋 Exiting...');
        serverProcess.kill();
        rl.close();
        process.exit(0);
        break;
        
      default:
        console.log('❌ Unknown command. Try again.');
        promptUser();
    }
  });
}

// Start the prompt
promptUser();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Exiting...');
  serverProcess.kill();
  rl.close();
  process.exit(0);
}); 