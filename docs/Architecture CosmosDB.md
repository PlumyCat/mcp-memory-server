# Architecture CosmosDB pour MCP Memory System

## 🏛️ Structure Multi-API

### **1. SQL API Container: `conversations`**
```json
{
  "id": "conv_uuid",
  "partitionKey": "/user_id",
  "timestamp": "2025-06-23T10:00:00Z",
  "messages": [
    {
      "id": "msg_uuid",
      "role": "user|assistant", 
      "content": "message content",
      "tools_used": ["web_search", "memory_store"],
      "entities_mentioned": ["entity_id_1", "entity_id_2"],
      "timestamp": "2025-06-23T10:00:00Z"
    }
  ],
  "context_summary": "Auto-generated summary",
  "topics": ["ai", "programming", "memory"],
  "sentiment": "positive|neutral|negative",
  "metadata": {
    "duration_minutes": 45,
    "tool_calls_count": 12,
    "entities_created": 5
  }
}
```

### **2. SQL API Container: `entities`**
```json
{
  "id": "entity_uuid",
  "partitionKey": "/entity_type",
  "name": "Entity Name",
  "type": "person|company|project|concept|tool",
  "aliases": ["Alternative Name", "Acronym"],
  "attributes": {
    "description": "Entity description",
    "confidence": 0.95,
    "source": "conversation|web_search|user_input",
    "verified": true
  },
  "observations": [
    {
      "id": "obs_uuid",
      "content": "Observation text",
      "timestamp": "2025-06-23T10:00:00Z",
      "source": "conversation_id",
      "confidence": 0.9,
      "tags": ["fact", "opinion", "speculation"]
    }
  ],
  "embedding": [0.1, 0.2, ...], // Vector embedding
  "relationships_count": 15,
  "last_mentioned": "2025-06-23T10:00:00Z",
  "created_at": "2025-06-20T14:30:00Z",
  "updated_at": "2025-06-23T10:00:00Z"
}
```

### **3. Gremlin API: Knowledge Graph**
```
Vertices (Entities):
- id: entity_uuid
- label: entity_type  
- properties: { name, confidence, created_at }

Edges (Relations):
- label: relation_type (works_at, created_by, related_to, mentioned_with)
- properties: { strength, confidence, first_seen, last_seen }

Exemple:
(Person:John)-[works_at:0.9]->(Company:Anthropic)
(Project:MCP)-[created_by:1.0]->(Company:Anthropic)
(Concept:Memory)-[related_to:0.8]->(Project:MCP)
```

## 🔄 Flux de données

### **Stockage**
1. **Message reçu** → SQL Container `conversations`
2. **Entities extraites** → SQL Container `entities` + Gremlin Graph
3. **Relations détectées** → Gremlin Graph edges
4. **Embeddings** → ChromaDB + cache dans `entities`

### **Récupération**  
1. **Recherche sémantique** → ChromaDB → Entity IDs
2. **Context enrichment** → CosmosDB SQL query
3. **Graph traversal** → Gremlin pour relations
4. **Assembly** → Context complet pour LLM

## 🎯 Avantages de cette architecture

### **Performance**
- **Partition key strategy** : `/user_id` pour conversations, `/entity_type` pour entities
- **Indexing automatique** sur tous les champs JSON
- **Point reads** pour accès direct aux entities
- **Cross-partition queries** optimisées pour recherche

### **Scalabilité**
- **Auto-scaling** basé sur RU/s consumption
- **Global replication** pour multi-region
- **Consistent reads** configurables par query

### **Flexibilité**
- **Schema evolution** sans migration
- **Multi-model** : Document + Graph dans même service
- **API unifiée** pour différents patterns d'accès

## 🛠️ Requêtes types

### **Recherche contextuelle**
```sql
SELECT * FROM entities e 
WHERE CONTAINS(e.name, @search_term, true)
   OR ARRAY_CONTAINS(e.aliases, @search_term, true)
   OR EXISTS(SELECT VALUE obs FROM obs IN e.observations 
             WHERE CONTAINS(obs.content, @search_term, true))
ORDER BY e.last_mentioned DESC
```

### **Timeline d'une entité**
```sql
SELECT c.timestamp, c.messages
FROM conversations c
JOIN message IN c.messages
WHERE ARRAY_CONTAINS(message.entities_mentioned, @entity_id)
ORDER BY c.timestamp DESC
```

### **Graph traversal (Gremlin)**
```gremlin
g.V().hasLabel('person').has('name', 'John')
     .out('works_at')
     .in('created_by')
     .dedup()
     .limit(10)
```

Cette architecture vous donne une **foundation enterprise-grade** pour votre memory system ! 🚀