import { config } from 'dotenv';
import { MemoryMCPServer } from './server.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  try {
    console.error('🔧 Loading environment variables...');
    console.error(`📁 Looking for .env at: ${path.join(__dirname, '..', '.env')}`);

    // Validate required environment variables
    const requiredEnvVars = [
      'COSMOS_ENDPOINT',
      'COSMOS_KEY',
      'COSMOS_DATABASE_NAME',
      'COSMOS_CONTAINER_CONVERSATIONS',
      'COSMOS_CONTAINER_ENTITIES',
      'OPENAI_API_KEY',
    ];

    const missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
      console.error('Please check your .env file');
      process.exit(1);
    }

    console.error('🧠 Starting Memory MCP Server...');

    const server = new MemoryMCPServer();
    await server.initialize();
    await server.start();
  } catch (error) {
    console.error('❌ Failed to start Memory MCP Server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Always start the server
main();
