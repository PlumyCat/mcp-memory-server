import 'dotenv/config';
import { CosmosClient } from '@azure/cosmos';
import { writeFileSync } from 'fs';

async function backupData(): Promise<void> {
  console.log('💾 Starting data backup...');
  
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
  });

  const database = client.database(process.env.COSMOS_DATABASE_NAME!);
  
  try {
    // Backup conversations
    const conversationsContainer = database.container(process.env.COSMOS_CONTAINER_CONVERSATIONS!);
    const { resources: conversations } = await conversationsContainer.items.readAll().fetchAll();
    
    // Backup entities  
    const entitiesContainer = database.container(process.env.COSMOS_CONTAINER_ENTITIES!);
    const { resources: entities } = await entitiesContainer.items.readAll().fetchAll();
    
    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      conversations,
      entities,
      metadata: {
        conversationsCount: conversations.length,
        entitiesCount: entities.length
      }
    };
    
    // Save to file
    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
    writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup completed: ${filename}`);
    console.log(`📊 Backed up ${conversations.length} conversations and ${entities.length} entities`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  backupData().catch(console.error);
}