import 'dotenv/config';
import { MemoryMCPServer } from '../src/server.js';

async function testMemorySystem() {
  console.log('🧪 Testing Memory System...');
  
  const server = new MemoryMCPServer();
  await server.initialize();
  
  // Test entity extraction and storage
  console.log('\n1. Testing memory storage...');
  const testContent = `
    I'm working with Claude from Anthropic on a new project called MCP Memory Server. 
    We're using TypeScript, CosmosDB, and LangChain to build a conversational memory system.
    The goal is to create persistent context that can remember entities, relationships, and conversations.
  `;
  
  try {
    // Simulate tool call
    const storeResult = await server['handleMemoryStore']({
      content: testContent,
      source: 'test',
      user_id: 'test-user',
      role: 'user'
    });
    
    console.log('✅ Storage result:', storeResult);
    
    // Test search
    console.log('\n2. Testing memory search...');
    const searchResult = await server['handleMemorySearch']({
      query: 'Anthropic Claude project',
      user_id: 'test-user',
      limit: 3
    });
    
    console.log('✅ Search result:', searchResult);
    
    // Test context injection
    console.log('\n3. Testing context injection...');
    const contextResult = await server['handleContextInject']({
      query: 'Tell me about the project we discussed',
      user_id: 'test-user'
    });
    
    console.log('✅ Context result:', contextResult);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testMemorySystem().catch(console.error);
}