export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  attributes: {
    description: string;
    confidence: number;
    source: string;
    verified: boolean;
  };
  observations: Observation[];
  embedding?: number[];
  relationships_count: number;
  last_mentioned: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Observation {
  id: string;
  content: string;
  timestamp: Date;
  source: string;
  confidence: number;
  tags: string[];
}

export type EntityType =
  | 'person'
  | 'company'
  | 'project'
  | 'concept'
  | 'tool'
  | 'location'
  | 'event';

export interface Relation {
  from: string;
  to: string;
  type: RelationType;
  strength: number;
  confidence: number;
  first_seen: Date;
  last_seen: Date;
}

export type RelationType =
  | 'works_at'
  | 'created_by'
  | 'related_to'
  | 'mentioned_with'
  | 'part_of'
  | 'uses';
