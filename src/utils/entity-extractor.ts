import nlp from 'compromise';
import { Entity, EntityType, Observation } from '../types/memory.js';
import { v4 as uuidv4 } from 'uuid';

export class EntityExtractor {
  private readonly patterns = {
    // Patterns spécifiques en premier (ordre important!)
    project: [
      /\bMCP [A-Za-z]+ Server\b/g,                    // "MCP Memory Server"
      /\b[A-Z][a-zA-Z]+ Server\b/g,                   // "Memory Server"
      /\b[A-Z][a-zA-Z]+ (?:Project|System|Platform|Framework)\b/g,
    ],
    tool: [
      /\b(?:Claude|ChatGPT|VS Code|Docker|Kubernetes|React|TypeScript|Python)\b/g,
    ],
    company: [
      /\b[A-Z][a-zA-Z]+ (?:Inc|Corp|Ltd|LLC|Co)\b/g,
      /\b(?:Apple|Google|Microsoft|Amazon|Meta|Anthropic|OpenAI)\b/g,
    ],
    person: [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last
      /\b(?:Mr|Mrs|Dr|Prof)\.? [A-Z][a-z]+/g, // Title Name
    ],
  };

  async extractEntities(text: string, source: string): Promise<Entity[]> {
    const entities: Entity[] = [];
    const foundEntities = new Set<string>(); // Track already found entities

    // Extract using custom patterns FIRST (plus spécifiques)
    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) {
            const cleanMatch = match.trim();
            const key = cleanMatch.toLowerCase();
            if (!foundEntities.has(key)) {
              entities.push(
                this.createEntity(cleanMatch, type as EntityType, text, source)
              );
              foundEntities.add(key);
            }
          }
        }
      }
    }

    // Extract using compromise.js (pour les entités non capturées)
    const doc = nlp(text);
    const people = doc.people().out('array');
    const organizations = doc.organizations().out('array');
    const places = doc.places().out('array');

    // Process people (filter out short/invalid names)
    for (const person of people) {
      const cleanPerson = person.trim();
      const key = cleanPerson.toLowerCase();
      if (!foundEntities.has(key) && this.isValidPersonName(cleanPerson)) {
        entities.push(this.createEntity(cleanPerson, 'person', text, source));
        foundEntities.add(key);
      }
    }

    // Process organizations
    for (const org of organizations) {
      const cleanOrg = org.trim();
      const key = cleanOrg.toLowerCase();
      if (!foundEntities.has(key) && this.isValidOrganization(cleanOrg)) {
        entities.push(this.createEntity(cleanOrg, 'company', text, source));
        foundEntities.add(key);
      }
    }

    // Process places (filter out short/common words)
    for (const place of places) {
      const cleanPlace = place.trim();
      const key = cleanPlace.toLowerCase();
      if (!foundEntities.has(key) && this.isValidLocation(cleanPlace)) {
        entities.push(this.createEntity(cleanPlace, 'location', text, source));
        foundEntities.add(key);
      }
    }

    return this.deduplicateEntities(entities);
  }

  private createEntity(
    name: string,
    type: EntityType,
    fullText: string,
    source: string
  ): Entity {
    const observation: Observation = {
      id: uuidv4(),
      content: this.extractContextAroundEntity(fullText, name),
      timestamp: new Date(),
      source,
      confidence: 0.8,
      tags: ['auto-extracted'],
    };

    return {
      id: uuidv4(),
      name: name.trim(),
      type,
      aliases: [],
      attributes: {
        description: `Auto-extracted ${type}`,
        confidence: 0.8,
        source,
        verified: false,
      },
      observations: [observation],
      relationships_count: 0,
      last_mentioned: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  private extractContextAroundEntity(text: string, entity: string): string {
    const index = text.toLowerCase().indexOf(entity.toLowerCase());
    if (index === -1) return text.substring(0, 200);

    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + entity.length + 100);

    return text.substring(start, end).trim();
  }

  private isValidPersonName(name: string): boolean {
    // Filter out common false positives
    const invalidNames = ['ont', 'est', 'sont', 'avec', 'dans', 'pour', 'sur'];
    return name.length > 2 && !invalidNames.includes(name.toLowerCase());
  }

  private isValidOrganization(org: string): boolean {
    // Filter out common false positives
    return org.length > 2 && !org.match(/^(ont|est|sont|avec|dans|pour|sur)$/i);
  }

  private isValidLocation(location: string): boolean {
    // Filter out common false positives and short words
    const invalidLocations = ['ont', 'est', 'sont', 'avec', 'dans', 'pour', 'sur'];
    return location.length > 2 && !invalidLocations.includes(location.toLowerCase());
  }

  private deduplicateEntities(entities: Entity[]): Entity[] {
    const unique = new Map<string, Entity>();

    for (const entity of entities) {
      const key = `${entity.type}:${entity.name.toLowerCase()}`;

      if (!unique.has(key)) {
        unique.set(key, entity);
      } else {
        // Merge observations
        const existing = unique.get(key)!;
        existing.observations.push(...entity.observations);
      }
    }

    return Array.from(unique.values());
  }
}
