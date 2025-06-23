import { MemoryGraph } from '../memory/graph.js';

export class ContextInjector {
  constructor(private graph: MemoryGraph) {}

  async injectRelevantContext(
    currentMessage: string,
    userId: string = 'default'
  ): Promise<string> {
    const context = await this.graph.getRelevantContext(currentMessage, userId);

    if (context.trim()) {
      return `${context}\n\n---\n\nUser message: ${currentMessage}`;
    }

    return currentMessage;
  }

  async shouldInjectContext(message: string): Promise<boolean> {
    // Inject context if message contains references or questions about past info
    const contextTriggers = [
      /\b(?:remember|recall|you mentioned|we talked about|earlier|before|previously)\b/i,
      /\b(?:he|she|it|they|this|that|the company|the project)\b/i,
      /\b(?:what did|how did|when did|why did)\b/i,
    ];

    return contextTriggers.some(pattern => pattern.test(message));
  }
}
