# Contributing to MCP Memory Server

Thank you for your interest in contributing to MCP Memory Server! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the [GitHub Issues](https://github.com/YOUR_USERNAME/mcp-memory-server/issues) page
- Search existing issues before creating a new one
- Provide detailed information including:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (Node.js version, OS, etc.)
  - Relevant logs or error messages

### Suggesting Features
- Use [GitHub Discussions](https://github.com/YOUR_USERNAME/mcp-memory-server/discussions) for feature requests
- Check the [Roadmap](ROADMAP.md) to see if it's already planned
- Provide clear use cases and benefits

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- Azure Cosmos DB account (for testing)
- OpenAI API key (for testing)

### Local Development
```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/mcp-memory-server.git
cd mcp-memory-server
npm install

# Environment setup
cp .env.example .env
# Edit .env with your test credentials

# Build and test
npm run build
npm test
npm run health-check
```

### Project Structure
```
src/
├── config/          # Configuration (CosmosDB, etc.)
├── memory/          # Core memory system
│   ├── rag.ts       # Retrieval Augmented Generation
│   ├── storage.ts   # Data persistence layer
│   └── graph.ts     # Entity relationship management
├── types/           # TypeScript type definitions
├── utils/           # Utilities (entity extraction, context injection)
└── server.ts        # Main MCP server implementation
```

## 📝 Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style
- Use Prettier for formatting (config in `.prettierrc`)
- Use ESLint for linting (config in `eslint.config.js`)
- Follow existing code patterns and conventions

### Testing
- Write unit tests for new functionality
- Update integration tests when adding new tools
- Ensure all tests pass before submitting PR

## 🔄 Pull Request Process

### Before Submitting
1. **Fork** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** following the coding standards
4. **Test thoroughly** including edge cases
5. **Update documentation** if needed
6. **Commit with clear messages**

### PR Requirements
- [ ] All tests pass (`npm test`)
- [ ] Code builds without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Documentation updated if needed
- [ ] Clear description of changes
- [ ] Reference related issues

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(entity): add intelligent deduplication
fix(storage): resolve timestamp parsing issue
docs(readme): update installation instructions
```

## 🎯 Priority Areas for Contribution

### High Impact (⭐⭐⭐⭐⭐)
1. **Entity Deduplication** - Merge duplicate entities intelligently
2. **Entity Resolution** - Improve pronoun and reference resolution
3. **Auto-capture Tools** - Automatically store results from other MCP tools

### Medium Impact (⭐⭐⭐⭐)
4. **Extraction Patterns** - Improve entity extraction accuracy
5. **Contradiction Detection** - Detect and resolve conflicting information
6. **Performance Optimization** - Improve query speed and memory usage

### Documentation (⭐⭐⭐)
7. **Usage Examples** - More real-world use cases
8. **API Documentation** - Detailed API reference
9. **Troubleshooting** - Common issues and solutions

See [ROADMAP.md](ROADMAP.md) for detailed feature descriptions.

## 🧪 Testing Guidelines

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- storage.test.ts

# Run tests in watch mode
npm run test:watch
```

### Integration Tests
```bash
# Test memory system end-to-end
npm run test-memory

# Health check
npm run health-check
```

### Manual Testing
1. Build the project: `npm run build`
2. Configure Claude Desktop with your local build
3. Test core functionality:
   - Entity storage and extraction
   - Semantic search
   - Context injection
   - Reference resolution

## 🐛 Debugging

### Common Issues
- **CosmosDB connection**: Check credentials and network access
- **Entity extraction**: Verify OpenAI API key and quota
- **MCP communication**: Check Claude Desktop configuration

### Debug Tools
```bash
# Verbose logging
DEBUG=* npm run build && node dist/index.js

# Health check with details
npm run health-check

# Inspect MCP protocol
npm run inspect
```

## 📚 Resources

### Documentation
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### Related Projects
- [Claude Desktop](https://claude.ai)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Compromise.js](https://github.com/spencermountain/compromise)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

---

**Thank you for helping make MCP Memory Server better! 🚀** 