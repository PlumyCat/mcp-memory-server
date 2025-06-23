// import { ChromaApi } from 'chromadb';
// import type { Collection } from 'chromadb';
// TODO: Update ChromaDB imports when API is clarified
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryStorage } from './storage.js';
import { Entity } from '../types/memory.js';

export class RAGSystem {
  // private chroma: ChromaApi;
  // private collection!: Collection;
  private embeddings: OpenAIEmbeddings;

  constructor(private storage: MemoryStorage) {
    // TODO: Initialize ChromaDB when API is clarified
    // this.chroma = new ChromaApi({
    //   host: process.env.CHROMA_HOST || 'localhost',
    //   port: parseInt(process.env.CHROMA_PORT || '8000'),
    // });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize(): Promise<void> {
    // TODO: Initialize ChromaDB collection when API is clarified
    console.error('RAG System initialized (using CosmosDB only)');
  }

  async addEntity(entity: Entity): Promise<void> {
    // TODO: Implement ChromaDB storage when API is clarified
    console.error(`Adding entity: ${entity.name} (${entity.type})`);

    // Create embedding from entity content
    const content = this.entityToText(entity);
    const embedding = await this.embeddings.embedQuery(content);

    // Store embedding directly in entity
    entity.embedding = embedding;

    // Store in CosmosDB
    await this.storage.storeEntity(entity);
  }

  async semanticSearch(query: string, limit: number = 5): Promise<Entity[]> {
    // TODO: Implement ChromaDB search when API is clarified
    console.error(`Searching for: ${query} (limit: ${limit})`);

    // Get query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Get all entities from CosmosDB and calculate similarity
    const allEntities = await this.storage.getAllEntities();

    // Calculate cosine similarity for entities with embeddings
    const similarities = allEntities
      .filter((entity: Entity) => entity.embedding && entity.embedding.length > 0)
      .map((entity: Entity) => ({
        entity,
        similarity: this.cosineSimilarity(queryEmbedding, entity.embedding!)
      }))
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities.map((item: any) => item.entity);
  }

  async findRelevantContext(
    query: string,
    conversationHistory: any[]
  ): Promise<string> {
    // Semantic search for relevant entities
    const relevantEntities = await this.semanticSearch(query, 3);

    // Extract entities mentioned in recent conversation
    const recentEntityIds = this.extractEntityIdsFromHistory(conversationHistory);
    const recentEntities = await Promise.all(
      recentEntityIds.map(id => this.storage.getEntityById(id))
    );

    // Combine and format context
    const allEntities = [
      ...relevantEntities,
      ...recentEntities.filter((entity: Entity | null): entity is Entity => entity !== null),
    ];
    return this.formatContextForLLM(allEntities, conversationHistory);
  }

  private entityToText(entity: Entity): string {
    const observations = entity.observations.map(obs => obs.content).join(' ');
    return `${entity.name} (${entity.type}): ${entity.attributes.description}. ${observations}`;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private extractEntityIdsFromHistory(history: any[]): string[] {
    const entityIds: string[] = [];

    for (const message of history) {
      if (message.entities_mentioned) {
        entityIds.push(...message.entities_mentioned);
      }
    }

    return [...new Set(entityIds)]; // Remove duplicates
  }

  private formatContextForLLM(entities: Entity[], history: any[]): string {
    let context = '# Relevant Context\n\n';

    if (entities.length > 0) {
      context += '## Entities:\n';
      for (const entity of entities) {
        context += `- **${entity.name}** (${entity.type}): ${entity.attributes.description}\n`;

        // Add recent observations
        const recentObs = entity.observations
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 2);

        for (const obs of recentObs) {
          context += `  - ${obs.content}\n`;
        }
      }
    }

    if (history.length > 0) {
      context += '\n## Recent Conversation:\n';
      for (const msg of history.slice(-3)) {
        context += `- ${msg.role}: ${msg.content.substring(0, 100)}...\n`;
      }
    }

    return context;
  }
}
