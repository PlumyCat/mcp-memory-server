# 📖 MCP Memory Server - Usage Guide

## 🎯 **What does it actually do?**

Imagine Claude with **photographic memory** that:
- Remembers everything you discuss
- Automatically retrieves context when you reference it  
- Understands "this project", "that company", "he/she" in your conversations
- Accumulates knowledge over time

## ⚡ **Quick Start - Test in 5 minutes**

### 1. **Lightning Installation**
```bash
# In your mcp-memory-server/ folder
npm install && npm run build
npm run health-check  # Verify everything works
```

### 2. **Claude Desktop Configuration**
```json
// ~/.config/claude-desktop/claude_desktop_config.json
{
  "mcpServers": {
    "memory": {
      "command": "node", 
      "args": ["/YOUR/PATH/mcp-memory-server/dist/index.js"]
    }
  }
}
```

### 3. **First magical test**
```
You: "I'm working on an MCP Memory Server project with TypeScript and CosmosDB"
Claude: "Interesting! [responds normally + automatic background storage]"

# 10 minutes later...
You: "Remind me about that project we discussed"
Claude: "You mentioned the MCP Memory Server project using TypeScript and CosmosDB..."
```

**✨ It works!** Claude remembers without you doing anything special.

---

## 🎪 **Real-world Use Cases**

### **🚀 For Developers**

#### **Project Management**
```
Session 1:
You: "I'm debugging the Stripe API, issue with webhooks"
Claude: [Auto-storage: Stripe API, webhooks, debugging]

Session 2 (2 weeks later):
You: "What was that Stripe problem we had?"
Claude: "You were debugging the Stripe API with a webhook issue..."
```

#### **Tech Research** 
```
You: search "new React features 2025"
Claude: [Uses web_search + auto-stores results]

Later:
You: "Those new React hooks, can you remind me?"
Claude: [Automatically retrieves info from the search]
```

### **👔 For Project Managers**

#### **Team Management**
```
You: "Sarah's team is working on the authentication module"
Claude: [Storage: Sarah → team → auth module]

Later:
You: "Who's handling auth again?"
Claude: "Sarah's team is working on the authentication module"
```

### **🔬 For Researchers**

#### **Knowledge Accumulation**
```
# Over several weeks
You search: "generative AI", "transformers", "LLM architecture"
Claude: [All searches automatically stored]

You: "Give me a summary of everything we found about AI"
Claude: [Intelligent synthesis of all previous searches]
```

---

## 🛠️ **Advanced Features**

### **🔍 Smart Search**
```bash
# In Claude interface, these commands work automatically:
"Search my memory: TypeScript projects"
"Find the companies we discussed" 
"When did we mention Docker?"
```

### **🧠 Automatic Resolution**
```bash
You: "Claude is developed by Anthropic"
# Later...
You: "What else does that company do?"
Claude: [Automatically understands "that company" = Anthropic]
```

### **📊 Personal Analytics**
```bash
# Claude can tell you:
- "You've discussed 15 projects this month"
- "Your main topics: AI, TypeScript, databases"
- "Timeline of your MCP Memory Server project"
```

---

## 🆘 **Troubleshooting - Quick Solutions**

### **❌ "Tool memory not found"**
**Cause**: Claude can't see the MCP server
```bash
# Solutions:
1. Check path in claude_desktop_config.json
2. Restart Claude Desktop completely
3. Test: npm run inspect
```

### **❌ "CosmosDB connection failed"**
**Cause**: Azure connection issue
```bash
# Solutions:
1. Check .env with your real Azure keys
2. Test: npm run health-check
3. Check firewall/VPN
```

### **❌ "Entities poorly extracted"**
**Cause**: System still learning your patterns
```bash
# Solutions:
1. Normal at start, precision improves with usage
2. Adjust patterns in src/utils/entity-extractor.ts
3. Provide more context in your messages
```

### **❌ "Memory seems to 'forget'"**
**Cause**: Semantic search not optimal
```bash
# Solutions:  
1. Use more specific keywords
2. Check ChromaDB: docker ps
3. Retry with different terms
```

---

## 🎯 **Usage Optimization**

### **💡 Best Practices**

#### **For better results**
```markdown
✅ "I'm working on the MCP project with TypeScript and CosmosDB"
❌ "I'm coding something"

✅ "The Stripe API has a bug with payment webhooks" 
❌ "There's a problem"

✅ "Sarah from the backend team is developing the auth module"
❌ "Sarah does auth"
```

#### **Effective references**
```markdown
✅ "That React project we discussed yesterday"
✅ "That company" (after mentioning a company)
✅ "John's team" (after talking about John)

❌ "That thing", "the stuff", "you know what"
```

### **🚀 Advanced Usage**

#### **Explicit commands**
```markdown
# These phrases trigger specific actions:
"Store that I'm working on..."          → memory_store
"Remind me..."                         → context_inject  
"Who's handling..." / "Find me..."      → memory_search
"That company" / "this project"         → entity_resolve
```

#### **Recommended workflows**
```markdown
1. **Project start**: Describe the project clearly
2. **Research**: Let Claude use web_search (auto-storage)
3. **References**: Use "this project", "that company" naturally
4. **Follow-up**: Regularly ask "where are we on..."
```

---

## 📈 **Evolution and Learning**

### **The system becomes smarter with usage**

**Week 1**: Basic extraction, some normal errors
**Week 2**: Recognition of your language patterns  
**Month 1**: Rich memory with precise reference resolution
**Month 3**: Truly personalized assistant that "knows you"

### **Success metrics**
- **Reference resolution**: "this project" → correct entity  
- **Contextual recall**: Finds relevant info automatically
- **Accumulation**: Knowledge enriches over time

---

## 🔮 **Upcoming Features**

### **In Development**
- ✅ Automatic entity deduplication
- ✅ Auto-capture of all MCP tools  
- ✅ Contradiction detection
- ✅ Advanced conversational analytics

### **Future Vision**
- 🔮 **Shared memory**: Teams with common memory
- 🔮 **Proactive AI**: "You should revisit that abandoned project"
- 🔮 **Automatic insights**: "Pattern detected in your projects"

---

**💬 Questions? Issues? Create a GitHub issue or test with `npm run inspect`!**