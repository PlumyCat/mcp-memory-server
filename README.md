# MCP Memory Server 🧠

Un serveur MCP (Model Context Protocol) avancé qui fournit une mémoire conversationnelle persistante avec extraction automatique d'entités, recherche sémantique et injection de contexte intelligent.

## ✨ Fonctionnalités

- **Mémoire conversationnelle persistante** avec CosmosDB
- **Extraction automatique d'entités** (personnes, entreprises, projets, concepts)
- **Recherche sémantique** avec embeddings OpenAI stockés dans CosmosDB
- **Résolution de coréférences** ("il", "cette entreprise", etc.)
- **Injection de contexte intelligent** basée sur l'historique
- **Analyse de patterns conversationnels**
- **Timeline d'interactions** pour chaque entité

## 🚀 Installation

```bash
# Clone et setup
git clone <repo>
cd mcp-memory-server
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés Azure/OpenAI

# Setup CosmosDB
npm run setup-cosmos

# Build
npm run build
```

## 🔧 Configuration

### Azure CosmosDB
1. Créer un compte CosmosDB sur Azure
2. Activer les APIs SQL et Gremlin (optionnel)
3. Copier endpoint et clé primaire dans .env



### Claude Desktop
```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/mcp-memory-server"
    }
  }
}
```

## 🛠️ Outils disponibles

- **memory_store**: Stockage automatique avec extraction d'entités
- **memory_search**: Recherche sémantique dans la mémoire
- **context_inject**: Injection de contexte pertinent
- **entity_resolve**: Résolution de références d'entités
- **conversation_analyze**: Analyse de patterns conversationnels
- **memory_timeline**: Timeline d'interactions avec entités

## 🧪 Tests

```bash
# Test du système complet
npm run test-memory

# Inspection MCP
npm run inspect
```

## 📖 Usage Examples

### Stockage automatique depuis d'autres outils
```javascript
// Automatiquement capturé quand vous utilisez web_search
User: "Recherche les dernières news sur Anthropic"
// Le résultat est automatiquement stocké avec entités extraites

// Puis plus tard...
User: "Rappelle-moi ce qu'on a trouvé sur cette entreprise"
// Le système retrouve automatiquement le contexte Anthropic
```

### Résolution de références
```javascript
User: "Claude est développé par Anthropic"
Assistant: "Oui, Claude est l'assistant IA créé par Anthropic..."

User: "Parle-moi plus de cette entreprise"
// "cette entreprise" → résolu automatiquement vers "Anthropic"
```

### Continuité conversationnelle
```javascript
// Session 1
User: "Je travaille sur un projet MCP avec TypeScript"
Assistant: "Stocké: Projet MCP, TypeScript..."

// Session 2 (jours plus tard)  
User: "Comment avance le projet dont on a parlé?"
// Le système retrouve automatiquement le contexte du projet MCP
```

## 🏗️ Architecture

### Stack technique
- **Backend**: Node.js 22 + TypeScript
- **Database**: Azure CosmosDB (SQL + Gremlin APIs)
- **Vector Store**: CosmosDB (embeddings stockés directement)
- **Embeddings**: OpenAI
- **NLP**: Compromise.js + custom patterns
- **Protocol**: Model Context Protocol (MCP)

### Flux de données
```
Message → Entity Extraction → CosmosDB Storage
    ↓
OpenAI Embeddings ← RAG System → Context Retrieval
    ↓
Intelligent Context Injection → Enhanced Response
```

## 🔄 Intégration avec autres outils MCP

Le Memory Server s'intègre automatiquement avec tous les autres outils MCP :

- **web_search** → Auto-stockage des résultats
- **repl** → Stockage des analyses de données  
- **file operations** → Contexte sur les fichiers manipulés
- **api calls** → Historique des interactions API

## 🎯 Roadmap

### Phase 1 (Actuel)
- [x] Stockage entités + conversations
- [x] Recherche sémantique basique
- [x] Extraction d'entités automatique
- [x] Résolution coréférences simple

### Phase 2 (Prochaine)
- [ ] Graph traversal avec Gremlin API
- [ ] Détection de contradictions
- [ ] Fusion intelligente d'entités
- [ ] Analytics avancés

### Phase 3 (Future)
- [ ] Multi-user memory isolation
- [ ] Real-time collaboration
- [ ] Memory compression/archiving
- [ ] Advanced reasoning chains

## 🔒 Sécurité

- **Isolation utilisateur** via partition keys
- **Chiffrement** au repos et en transit (CosmosDB)
- **Pas de stockage de données sensibles** dans les logs
- **Rate limiting** sur les APIs externes
- **Validation stricte** des inputs avec Zod

## 📊 Monitoring

### Métriques clés
- Nombre d'entités stockées
- Qualité des extractions (confidence scores)
- Performance des recherches sémantiques
- Utilisation des RU/s CosmosDB

### Logs structurés
```json
{
  "timestamp": "2025-06-23T10:00:00Z",
  "level": "info",
  "action": "entity_extracted",
  "entity_type": "company",
  "entity_name": "Anthropic",
  "confidence": 0.95,
  "source": "web_search"
}
```

## 🤝 Contributing

1. Fork le repository
2. Créer une branch feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branch (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 License

MIT License - voir le fichier LICENSE pour les détails.

## 🆘 Support

- **Documentation**: [MCP Official Docs](https://modelcontextprotocol.io)
- **Issues**: Créer un issue sur GitHub
- **Discussions**: GitHub Discussions pour questions générales

---

**Construit avec ❤️ pour la communauté MCP**