import { CosmosClient } from '@azure/cosmos';
import { ChromaApi } from 'chromadb';

async function healthCheck(): Promise<void> {
  try {
    console.log('🔍 Running health check...');

    // Check CosmosDB connection
    const cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT!,
      key: process.env.COSMOS_KEY!
    });

    const { database } = await cosmosClient.database(process.env.COSMOS_DATABASE_NAME!).read();
    console.log('✅ CosmosDB connection: OK');

    // Check ChromaDB connection
    const chroma = new ChromaApi({
      host: process.env.CHROMA_HOST || 'localhost',
      port: parseInt(process.env.CHROMA_PORT || '8000')
    });

    await chroma.heartbeat();
    console.log('✅ ChromaDB connection: OK');

    // Check environment variables
    const requiredEnvVars = [
      'COSMOS_ENDPOINT',
      'COSMOS_KEY',
      'OPENAI_API_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
    console.log('✅ Environment variables: OK');

    console.log('🎉 Health check passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck();
}