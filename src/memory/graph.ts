import { MemoryStorage } from './storage.js';
import { RAGSystem } from './rag.js';
import { EntityExtractor } from '../utils/entity-extractor.js';
import { Entity } from '../types/memory.js';
import { Conversation, Message } from '../types/conversation.js';
import { v4 as uuidv4 } from 'uuid';

export class MemoryGraph {
  private extractor: EntityExtractor;

  constructor(
    private storage: MemoryStorage,
    private rag: RAGSystem
  ) {
    this.extractor = new EntityExtractor();
  }

  async processMessage(
    content: string,
    role: 'user' | 'assistant',
    userId: string = 'default',
    toolsUsed: string[] = []
  ): Promise<{ entities: Entity[]; messageId: string }> {
    // Extract entities from message
    const entities = await this.extractor.extractEntities(
      content,
      `message:${role}`
    );

    // Store entities and get their IDs
    const entityIds: string[] = [];
    for (const entity of entities) {
      await this.storage.storeEntity(entity);
      await this.rag.addEntity(entity);
      entityIds.push(entity.id);
    }

    // Create message
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      tools_used: toolsUsed,
      entities_mentioned: entityIds,
      timestamp: new Date(),
    };

    // Store in conversation (create new or append to existing)
    await this.storeMessage(message, userId);

    return { entities, messageId: message.id };
  }

  async getRelevantContext(query: string, userId: string): Promise<string> {
    // Get recent conversation history
    const conversations = await this.storage.getConversationHistory(userId, 3);
    const recentHistory = conversations.flatMap(c => c.messages).slice(-10);

    // Use RAG to find relevant context
    return await this.rag.findRelevantContext(query, recentHistory);
  }

  async resolveEntityReference(
    reference: string,
    context: string[]
  ): Promise<Entity | null> {
    // Handle pronouns and references like "he", "it", "this company"
    const pronounMap: Record<string, string | string[]> = {
      he: 'person',
      she: 'person',
      it: ['tool', 'concept', 'project'],
      they: ['company', 'person'],
      'this company': 'company',
      'that project': 'project',
    };

    const ref = reference.toLowerCase();
    if (pronounMap[ref]) {
      // Look for most recent entity of matching type in context
      return await this.findMostRecentEntityByType(pronounMap[ref], context);
    }

    // Direct name search
    return await this.storage.findEntityByName(reference, 'concept');
  }

  private async storeMessage(message: Message, userId: string): Promise<void> {
    // Try to find current conversation (last one from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const conversations = await this.storage.getConversationHistory(userId, 1);
    const currentConv = conversations.find(c => c.timestamp >= today);

    if (currentConv) {
      // Append to existing conversation
      currentConv.messages.push(message);
      currentConv.metadata.tool_calls_count += message.tools_used.length;

      // Update conversation summary and topics
      await this.updateConversationSummary(currentConv);
      await this.storage.storeConversation(currentConv);
    } else {
      // Create new conversation
      const newConv: Conversation = {
        id: uuidv4(),
        user_id: userId,
        timestamp: new Date(),
        messages: [message],
        context_summary: '',
        topics: [],
        sentiment: 'neutral',
        metadata: {
          duration_minutes: 0,
          tool_calls_count: message.tools_used.length,
          entities_created: message.entities_mentioned.length,
        },
      };

      await this.storage.storeConversation(newConv);
    }
  }

  private async findMostRecentEntityByType(
    types: string | string[],
    context: string[]
  ): Promise<Entity | null> {
    const typeArray = Array.isArray(types) ? types : [types];

    // Search in context messages for most recent entity mention
    for (const contextMsg of context.reverse()) {
      const entities = await this.extractor.extractEntities(
        contextMsg,
        'context'
      );
      const matching = entities.find(e => typeArray.includes(e.type));
      if (matching) {
        return await this.storage.findEntityByName(
          matching.name,
          matching.type
        );
      }
    }

    return null;
  }

  private async updateConversationSummary(
    conversation: Conversation
  ): Promise<void> {
    // Extract topics from messages
    const allText = conversation.messages.map((m: Message) => m.content).join(' ');
    const entities = await this.extractor.extractEntities(
      allText,
      'conversation'
    );

    conversation.topics = [...new Set(entities.map(e => e.name))];

    // Generate summary (this could use an LLM)
    const messageCount = conversation.messages.length;
    const entityCount = new Set(
      conversation.messages.flatMap((m: Message) => m.entities_mentioned)
    ).size;

    conversation.context_summary = `Conversation with ${messageCount} messages discussing ${entityCount} entities including: ${conversation.topics.slice(0, 5).join(', ')}`;
  }
}
