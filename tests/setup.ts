import { jest } from '@jest/globals';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods to avoid noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

// Mock external dependencies (ChromaDB removed)

jest.mock('@azure/cosmos', () => ({
    CosmosClient: jest.fn().mockImplementation(() => ({
        database: jest.fn().mockReturnValue({
            container: jest.fn().mockReturnValue({
                items: {
                    create: jest.fn(),
                    query: jest.fn().mockReturnValue({
                        fetchAll: jest.fn(),
                    }),
                },
            }),
        }),
    })),
})); 