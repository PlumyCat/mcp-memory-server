export interface Conversation {
  id: string;
  user_id: string;
  timestamp: Date;
  messages: Message[];
  context_summary: string;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  metadata: ConversationMetadata;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tools_used: string[];
  entities_mentioned: string[];
  timestamp: Date;
}

export interface ConversationMetadata {
  duration_minutes: number;
  tool_calls_count: number;
  entities_created: number;
}
