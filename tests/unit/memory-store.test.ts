import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MemoryStorage } from '../../src/memory/storage';

describe('MemoryStorage', () => {
    let memoryStorage: MemoryStorage;
    let mockCosmos: any;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock CosmosConfig
        mockCosmos = {
            entitiesContainer: {
                items: {
                    create: jest.fn(),
                    query: jest.fn().mockReturnValue({
                        fetchAll: jest.fn(),
                    }),
                },
            },
            conversationsContainer: {
                items: {
                    create: jest.fn(),
                    query: jest.fn().mockReturnValue({
                        fetchAll: jest.fn(),
                    }),
                },
            },
        };

        memoryStorage = new MemoryStorage(mockCosmos);
    });

    describe('constructor', () => {
        it('should create a MemoryStorage instance', () => {
            expect(memoryStorage).toBeInstanceOf(MemoryStorage);
        });
    });

    describe('storeEntity method', () => {
        it('should store a new entity', async () => {
            const testEntity = {
                id: 'test-id',
                name: 'Anthropic',
                type: 'company' as const,
                aliases: [],
                observations: [],
                attributes: {
                    description: 'AI company',
                    confidence: 0.9,
                    source: 'test',
                    verified: false
                },
                relationships_count: 0,
                last_mentioned: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            };

            mockCosmos.entitiesContainer.items.query().fetchAll.mockResolvedValue({ resources: [] });
            mockCosmos.entitiesContainer.items.create.mockResolvedValue({});

            await memoryStorage.storeEntity(testEntity);

            expect(mockCosmos.entitiesContainer.items.create).toHaveBeenCalled();
        });
    });
}); 