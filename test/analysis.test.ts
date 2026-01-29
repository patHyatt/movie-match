import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Analysis } from '../src/analysis.js';
import { UserRepository } from '../src/repositories/user-repository.js';
import { User } from '../src/models.js';

// Mock UserRepository for testing error scenarios
class MockUserRepository extends UserRepository {
    private mockUsers: User[] | null;
    private shouldThrowError: boolean;

    constructor(users: User[] | null = null, shouldThrowError = false) {
        super('/tmp/mock-db.json');
        this.mockUsers = users;
        this.shouldThrowError = shouldThrowError;
    }

    async getAll(): Promise<User[]> {
        if (this.shouldThrowError) {
            throw new Error('Database error');
        }
        return this.mockUsers || [];
    }
}

describe('Analysis Error Handling', () => {
    it('should handle database errors gracefully', async () => {
        const mockRepo = new MockUserRepository(null, true);
        const analysis = new Analysis(mockRepo);

        await assert.rejects(
            async () => await analysis.run(),
            {
                message: 'Failed to load database. Please ensure db.json exists and is readable.'
            }
        );
    });

    it('should handle empty database gracefully', async () => {
        const mockRepo = new MockUserRepository([]);
        const analysis = new Analysis(mockRepo);

        // Should not throw, just log message
        await analysis.run();
    });

    it('should handle users with empty watchlists', async () => {
        const users: User[] = [
            { id: 'user1', name: 'User 1', watchlist: [] },
            { id: 'user2', name: 'User 2', watchlist: [] }
        ];
        const mockRepo = new MockUserRepository(users);
        const analysis = new Analysis(mockRepo);

        // Should not throw, just handle gracefully
        await analysis.run();
    });

    it('should handle users with invalid movie titles', async () => {
        const users: User[] = [
            {
                id: 'user1',
                name: 'User 1',
                watchlist: ['Valid Movie', '', '   ', 'Another Valid Movie']
            }
        ];
        const mockRepo = new MockUserRepository(users);
        const analysis = new Analysis(mockRepo);

        // Should skip empty titles and process valid ones
        await analysis.run();
    });

    it('should handle mixed valid and invalid data', async () => {
        const users: User[] = [
            { id: 'user1', name: 'User 1', watchlist: ['Movie A', 'Movie B'] },
            { id: 'user2', name: 'User 2', watchlist: [] },
            { id: 'user3', name: 'User 3', watchlist: ['Movie A', '', 'Movie C'] }
        ];
        const mockRepo = new MockUserRepository(users);
        const analysis = new Analysis(mockRepo);

        // Should process all valid data and skip invalid
        await analysis.run();
    });

    it('should handle unanimous movie selection', async () => {
        const users: User[] = [
            { id: 'user1', name: 'User 1', watchlist: ['Popular Movie'] },
            { id: 'user2', name: 'User 2', watchlist: ['Popular Movie'] },
            { id: 'user3', name: 'User 3', watchlist: ['Popular Movie'] }
        ];
        const mockRepo = new MockUserRepository(users);
        const analysis = new Analysis(mockRepo);

        await analysis.run();
    });
});
