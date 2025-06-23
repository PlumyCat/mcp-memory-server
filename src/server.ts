import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
// import { z } from 'zod'; // Unused import

import { CosmosConfig } from './config/cosmos.js';
import { MemoryStorage } from './memory/storage.js';
import { RAGSystem } from './memory/rag.js';
import { MemoryGraph } from './memory/graph.js';
import { ContextInjector } from './utils/context-injector.js';
import { Conversation, Message } from './types/conversation.js';
import { EntityType } from './types/memory.js';

export class MemoryMCPServer {
  private server: Server;
  private cosmos: CosmosConfig;
  private storage: MemoryStorage;
  private rag: RAGSystem;
  private graph: MemoryGraph;
  private contextInjector: ContextInjector;

  constructor() {
    this.server = new Server(
      { name: 'memory-server', version: '1.0.0' },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );

    this.cosmos = new CosmosConfig();
    this.storage = new MemoryStorage(this.cosmos);
    this.rag = new RAGSystem(this.storage);
    this.graph = new MemoryGraph(this.storage, this.rag);
    this.contextInjector = new ContextInjector(this.graph);

    this.setupTools();
    this.setupResources();
    this.setupErrorHandling();
  }

  async initialize(): Promise<void> {
    await this.cosmos.initialize();
    await this.rag.initialize();
    console.error('Memory MCP Server initialized successfully');
  }

  private setupTools(): void {
    // 🧠 Main memory storage tool
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'memory_store':
          return await this.handleMemoryStore(args);

        case 'memory_search':
          return await this.handleMemorySearch(args);

        case 'context_inject':
          return await this.handleContextInject(args);

        case 'entity_resolve':
          return await this.handleEntityResolve(args);

        case 'conversation_analyze':
          return await this.handleConversationAnalyze(args);

        case 'memory_timeline':
          return await this.handleMemoryTimeline(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // 📋 List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'memory_store',
            description:
              'Store information in conversational memory with automatic entity extraction',
            inputSchema: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'Content to store' },
                source: {
                  type: 'string',
                  description:
                    'Source of information (e.g., web_search, user_input)',
                },
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                  default: 'default',
                },
                role: {
                  type: 'string',
                  enum: ['user', 'assistant'],
                  default: 'assistant',
                },
                tools_used: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tools that generated this content',
                },
              },
              required: ['content', 'source'],
            },
          },
          {
            name: 'memory_search',
            description:
              'Search through stored memories using semantic similarity',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                  default: 'default',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum results to return',
                  default: 5,
                },
                entity_types: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by entity types',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'context_inject',
            description:
              'Get relevant context for a query based on conversation history and stored memories',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Current query or topic',
                },
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                  default: 'default',
                },
                include_timeline: {
                  type: 'boolean',
                  description: 'Include temporal context',
                  default: false,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'entity_resolve',
            description:
              'Resolve entity references like "he", "it", "this company" to actual entities',
            inputSchema: {
              type: 'object',
              properties: {
                reference: {
                  type: 'string',
                  description: 'Entity reference to resolve',
                },
                context: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Recent conversation context',
                },
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                  default: 'default',
                },
              },
              required: ['reference', 'context'],
            },
          },
          {
            name: 'conversation_analyze',
            description: 'Analyze conversation patterns and extract insights',
            inputSchema: {
              type: 'object',
              properties: {
                user_id: {
                  type: 'string',
                  description: 'User identifier',
                  default: 'default',
                },
                days: {
                  type: 'number',
                  description: 'Number of days to analyze',
                  default: 7,
                },
              },
            },
          },
          {
            name: 'memory_timeline',
            description: 'Get timeline of interactions with a specific entity',
            inputSchema: {
              type: 'object',
              properties: {
                entity_name: { type: 'string', description: 'Name of entity' },
                entity_type: {
                  type: 'string',
                  description: 'Type of entity (optional)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum timeline entries',
                  default: 10,
                },
              },
              required: ['entity_name'],
            },
          },
        ],
      };
    });
  }

  private setupResources(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'memory://conversations/recent',
            name: 'Recent Conversations',
            description: 'Recent conversation history with context',
            mimeType: 'application/json',
          },
          {
            uri: 'memory://entities/all',
            name: 'All Entities',
            description: 'All stored entities with relationships',
            mimeType: 'application/json',
          },
          {
            uri: 'memory://stats/overview',
            name: 'Memory Statistics',
            description: 'Overview of memory system statistics',
            mimeType: 'application/json',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      const { uri } = request.params;

      switch (uri) {
        case 'memory://conversations/recent':
          return await this.getRecentConversations();

        case 'memory://entities/all':
          return await this.getAllEntities();

        case 'memory://stats/overview':
          return await this.getMemoryStats();

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  // Tool handlers
  private async handleMemoryStore(args: unknown) {
    const {
      content,
      user_id = 'default',
      role = 'assistant',
      tools_used = [],
    } = args as { content: string, user_id: string, role: string, tools_used: string[] };

    try {
      const result = await this.graph.processMessage(
        content,
        role as "user" | "assistant",
        user_id,
        tools_used
      );

      return {
        content: [
          {
            type: 'text',
            text: `Stored memory successfully. Extracted ${result.entities.length} entities: ${result.entities.map(e => `${e.name} (${e.type})`).join(', ')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to store memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleMemorySearch(args: unknown) {
    const { query, limit = 5, entity_types } = args as { query: string, limit: number, entity_types: string[] };

    try {
      let entities = await this.rag.semanticSearch(query, limit);

      // Filter by entity types if specified
      if (entity_types?.length > 0) {
        entities = entities.filter(e => entity_types.includes(e.type));
      }

      const results = entities.map(e => ({
        name: e.name,
        type: e.type,
        description: e.attributes.description,
        confidence: e.attributes.confidence,
        last_mentioned: e.last_mentioned,
        recent_observations: e.observations.slice(-2).map(obs => obs.content),
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} relevant memories:\n\n${JSON.stringify(results, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to search memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleContextInject(args: unknown) {
    const { query, user_id = 'default' } = args as { query: string, user_id: string };

    try {
      const context = await this.graph.getRelevantContext(query, user_id);

      return {
        content: [
          {
            type: 'text',
            text: context,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to inject context: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleEntityResolve(args: unknown) {
    const { reference, context } = args as { reference: string, context: string[] };

    try {
      const entity = await this.graph.resolveEntityReference(
        reference,
        context
      );

      if (entity) {
        return {
          content: [
            {
              type: 'text',
              text: `Resolved "${reference}" to: ${entity.name} (${entity.type}) - ${entity.attributes.description}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Could not resolve entity reference: "${reference}"`,
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to resolve entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleConversationAnalyze(args: unknown) {
    const { user_id = 'default', days = 7 } = args as { user_id: string, days: number };

    try {
      const conversations = await this.storage.getConversationHistory(
        user_id,
        50
      );

      // Simple analysis
      const totalMessages = conversations.reduce(
        (sum, c) => sum + c.messages.length,
        0
      );
      const totalEntities = new Set(
        conversations.flatMap(c =>
          c.messages.flatMap((m: Message) => m.entities_mentioned)
        )
      ).size;
      const topTopics = this.getTopTopics(conversations);

      const analysis = {
        period_days: days,
        total_conversations: conversations.length,
        total_messages: totalMessages,
        unique_entities: totalEntities,
        top_topics: topTopics,
        average_messages_per_conversation:
          totalMessages / conversations.length || 0,
      };

      return {
        content: [
          {
            type: 'text',
            text: `Conversation Analysis:\n\n${JSON.stringify(analysis, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze conversations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleMemoryTimeline(args: unknown) {
    const { entity_name, entity_type, limit = 10 } = args as { entity_name: string, entity_type: string, limit: number };

    try {
      // First find the entity
      const entity = await this.storage.findEntityByName(
        entity_name,
        entity_type as EntityType
      );
      if (!entity) {
        return {
          content: [
            {
              type: 'text',
              text: `Entity "${entity_name}" not found`,
            },
          ],
        };
      }

      const timeline = await this.storage.getEntityTimeline(entity.id);

      return {
        content: [
          {
            type: 'text',
            text: `Timeline for ${entity.name} (${entity.type}):\n\n${JSON.stringify(timeline.slice(0, limit), null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get timeline: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Resource handlers
  private async getRecentConversations() {
    const conversations = await this.storage.getConversationHistory(
      'default',
      5
    );
    return {
      contents: [
        {
          uri: 'memory://conversations/recent',
          mimeType: 'application/json',
          text: JSON.stringify(conversations, null, 2),
        },
      ],
    };
  }

  private async getAllEntities() {
    // This would need implementation in storage
    return {
      contents: [
        {
          uri: 'memory://entities/all',
          mimeType: 'application/json',
          text: JSON.stringify([], null, 2),
        },
      ],
    };
  }

  private async getMemoryStats() {
    const stats = {
      timestamp: new Date().toISOString(),
      // Add actual statistics here
      entities_count: 0,
      conversations_count: 0,
      total_messages: 0,
    };

    return {
      contents: [
        {
          uri: 'memory://stats/overview',
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  // Utility methods
  private getTopTopics(conversations: Conversation[]): string[] {
    const topicCounts = new Map<string, number>();

    for (const conv of conversations) {
      for (const topic of conv.topics || []) {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      }
    }

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  private setupErrorHandling(): void {
    this.server.onerror = error => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      console.error('Shutting down Memory MCP Server...');
      await this.server.close();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Memory MCP Server started on stdio transport');
  }
}
