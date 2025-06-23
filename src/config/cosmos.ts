import { CosmosClient, Database, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

export class CosmosConfig {
  private client: CosmosClient;
  private database: Database;

  public conversationsContainer: Container;
  public entitiesContainer: Container;

  constructor() {
    const endpoint = process.env.COSMOS_ENDPOINT!;
    const key = process.env.COSMOS_KEY;

    // Use managed identity in production, key for development
    this.client = key
      ? new CosmosClient({ endpoint, key })
      : new CosmosClient({
        endpoint,
        aadCredentials: new DefaultAzureCredential(),
      });

    this.database = this.client.database(process.env.COSMOS_DATABASE_NAME!);

    this.conversationsContainer = this.database.container(
      process.env.COSMOS_CONTAINER_CONVERSATIONS!
    );
    this.entitiesContainer = this.database.container(
      process.env.COSMOS_CONTAINER_ENTITIES!
    );
  }

  async initialize(): Promise<void> {
    // Create database if it doesn't exist
    await this.client.databases.createIfNotExists({
      id: process.env.COSMOS_DATABASE_NAME!,
    });

    // Create containers if they don't exist
    await this.database.containers.createIfNotExists({
      id: process.env.COSMOS_CONTAINER_CONVERSATIONS!,
      partitionKey: '/user_id',
      indexingPolicy: {
        automatic: true,
        includedPaths: [{ path: '/*' }],
        excludedPaths: [
          { path: '/messages/?' }, // Exclude messages array from indexing for performance
        ],
      },
    });

    await this.database.containers.createIfNotExists({
      id: process.env.COSMOS_CONTAINER_ENTITIES!,
      partitionKey: '/type',
      indexingPolicy: {
        automatic: true,
        includedPaths: [
          { path: '/' }, // Mandatory root path
          { path: '/name/*' },
          { path: '/aliases/*' },
          { path: '/last_mentioned/*' },
          { path: '/attributes/confidence/*' },
        ],
      },
    });
  }
}
