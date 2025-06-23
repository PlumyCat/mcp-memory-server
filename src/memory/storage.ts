import { CosmosConfig } from '../config/cosmos.js';
import { Entity, EntityType } from '../types/memory.js';
import { Conversation } from '../types/conversation.js';
import { v4 as uuidv4 } from 'uuid';

export class MemoryStorage {
  constructor(private cosmos: CosmosConfig) { }

  async storeConversation(conversation: Conversation): Promise<void> {
    await this.cosmos.conversationsContainer.items.create(conversation);
  }

  async storeEntity(entity: Entity): Promise<void> {
    // Check if entity exists
    const existing = await this.findEntityByName(entity.name, entity.type);

    if (existing) {
      // Merge observations and update
      entity.id = existing.id;
      entity.observations = [...existing.observations, ...entity.observations];
      entity.updated_at = new Date();

      await this.cosmos.entitiesContainer
        .item(entity.id, entity.type)
        .replace(entity);
    } else {
      // Create new entity
      entity.id = uuidv4();
      entity.created_at = new Date();
      entity.updated_at = new Date();

      await this.cosmos.entitiesContainer.items.create(entity);
    }
  }

  async findEntityByName(
    name: string,
    type: EntityType
  ): Promise<Entity | null> {
    const query = {
      query: `
        SELECT * FROM entities e 
        WHERE e.type = @type 
        AND (e.name = @name OR ARRAY_CONTAINS(e.aliases, @name, true))
      `,
      parameters: [
        { name: '@type', value: type },
        { name: '@name', value: name },
      ],
    };

    const { resources } = await this.cosmos.entitiesContainer.items
      .query(query)
      .fetchAll();
    return resources[0] || null;
  }

  async searchEntities(
    searchTerm: string,
    limit: number = 10
  ): Promise<Entity[]> {
    const query = {
      query: `
        SELECT * FROM entities e 
        WHERE CONTAINS(e.name, @search, true)
           OR ARRAY_CONTAINS(e.aliases, @search, true)
           OR EXISTS(SELECT VALUE obs FROM obs IN e.observations 
                     WHERE CONTAINS(obs.content, @search, true))
        ORDER BY e.last_mentioned DESC
        OFFSET 0 LIMIT @limit
      `,
      parameters: [
        { name: '@search', value: searchTerm },
        { name: '@limit', value: limit },
      ],
    };

    const { resources } = await this.cosmos.entitiesContainer.items
      .query(query)
      .fetchAll();
    return resources;
  }

  async getConversationHistory(
    userId: string,
    limit: number = 10
  ): Promise<Conversation[]> {
    const query = {
      query: `
        SELECT * FROM conversations c 
        WHERE c.user_id = @userId 
        ORDER BY c.timestamp DESC
        OFFSET 0 LIMIT @limit
      `,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@limit', value: limit },
      ],
    };

    const { resources } = await this.cosmos.conversationsContainer.items
      .query(query)
      .fetchAll();
    return resources;
  }

  async getEntityTimeline(entityId: string): Promise<any[]> {
    const query = {
      query: `
        SELECT c.timestamp, c.messages, c.context_summary
        FROM conversations c
        JOIN message IN c.messages
        WHERE ARRAY_CONTAINS(message.entities_mentioned, @entityId)
        ORDER BY c.timestamp DESC
      `,
      parameters: [{ name: '@entityId', value: entityId }],
    };

    const { resources } = await this.cosmos.conversationsContainer.items
      .query(query)
      .fetchAll();
    return resources;
  }

  async getAllEntities(): Promise<Entity[]> {
    const query = {
      query: 'SELECT * FROM entities e ORDER BY e.last_mentioned DESC',
    };

    const { resources } = await this.cosmos.entitiesContainer.items
      .query(query)
      .fetchAll();
    return resources;
  }

  async getEntityById(id: string): Promise<Entity | null> {
    try {
      const { resource } = await this.cosmos.entitiesContainer.item(id).read();
      return resource || null;
    } catch {
      return null;
    }
  }
}
