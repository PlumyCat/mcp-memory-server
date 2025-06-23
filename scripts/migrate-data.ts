import 'dotenv/config';
import { CosmosConfig } from '../src/config/cosmos.js';
import { MemoryStorage } from '../src/memory/storage.js';

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  const cosmos = new CosmosConfig();
  await cosmos.initialize();
  
  const storage = new MemoryStorage(cosmos);
  
  try {
    // Add any migration logic here
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData().catch(console.error);
}