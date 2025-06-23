import { CosmosClient } from '@azure/cosmos';
import 'dotenv/config';

async function setupCosmosDB() {
  console.log('🗄️ Setting up CosmosDB for Memory System...');
  
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
  });

  try {
    // Create database
    console.log('Creating database...');
    const { database } = await client.databases.createIfNotExists({
      id: process.env.COSMOS_DATABASE_NAME!,
      throughput: 400 // Shared throughput
    });

    // Create conversations container
    console.log('Creating conversations container...');
    await database.containers.createIfNotExists({
      id: process.env.COSMOS_CONTAINER_CONVERSATIONS!,
      partitionKey: '/user_id',
      indexingPolicy: {
        automatic: true,
        includedPaths: [
          { path: '/*' }
        ],
        excludedPaths: [
          { path: '/messages/*/content/*' } // Don't index large text content
        ]
      }
    });

    // Create entities container
    console.log('Creating entities container...');
    await database.containers.createIfNotExists({
      id: process.env.COSMOS_CONTAINER_ENTITIES!,
      partitionKey: '/type',
      indexingPolicy: {
        automatic: true,
        includedPaths: [
          { path: '/name/*' },
          { path: '/aliases/*' },
          { path: '/last_mentioned/*' },
          { path: '/attributes/confidence/*' },
          { path: '/type/*' }
        ],
        excludedPaths: [
          { path: '/observations/*/content/*' },
          { path: '/embedding/*' }
        ]
      }
    });

    console.log('✅ CosmosDB setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to setup CosmosDB:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupCosmosDB().catch(console.error);
}

export { setupCosmosDB };