import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { UserRepository } from '../src/repositories/user-repository.js';
import { User } from '../src/models.js';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('UserRepository Error Handling', () => {
    const testDbPath = join(tmpdir(), 'test-error-db.json');
    let repo: UserRepository;

    beforeEach(() => {
        repo = new UserRepository(testDbPath);
    });

    afterEach(async () => {
        // Clean up test database
        if (existsSync(testDbPath)) {
            await unlink(testDbPath);
        }
    });

    it('should handle creating a user successfully', async () => {
        const user: User = {
            id: 'test-id-1',
            name: 'Test User',
            watchlist: ['Movie 1', 'Movie 2']
        };

        const created = await repo.create(user);
        assert.deepStrictEqual(created, user);

        const found = await repo.findById('test-id-1');
        assert.deepStrictEqual(found, user);
    });

    it('should handle updating a user successfully', async () => {
        const user: User = {
            id: 'test-id-2',
            name: 'Test User',
            watchlist: ['Movie 1']
        };

        await repo.create(user);
        const updated = await repo.update('test-id-2', { name: 'Updated Name' });

        assert.strictEqual(updated?.name, 'Updated Name');
        assert.strictEqual(updated?.id, 'test-id-2');
    });

    it('should return null when updating non-existent user', async () => {
        const result = await repo.update('non-existent-id', { name: 'Test' });
        assert.strictEqual(result, null);
    });

    it('should handle deleting a user successfully', async () => {
        const user: User = {
            id: 'test-id-3',
            name: 'Test User',
            watchlist: []
        };

        await repo.create(user);
        const deleted = await repo.delete('test-id-3');
        assert.strictEqual(deleted, true);

        const found = await repo.findById('test-id-3');
        assert.strictEqual(found, undefined);
    });

    it('should return false when deleting non-existent user', async () => {
        const result = await repo.delete('non-existent-id');
        assert.strictEqual(result, false);
    });

    it('should handle saving database successfully', async () => {
        const user: User = {
            id: 'test-id-4',
            name: 'Test User',
            watchlist: ['Movie 1']
        };

        await repo.create(user);
        await repo.save();

        // Verify data persisted
        const newRepo = new UserRepository(testDbPath);
        const found = await newRepo.findById('test-id-4');
        assert.deepStrictEqual(found, user);
    });

    it('should handle updating watchlist successfully', async () => {
        const user: User = {
            id: 'test-id-5',
            name: 'Test User',
            watchlist: ['Movie 1']
        };

        await repo.create(user);
        const newWatchlist = ['Movie 2', 'Movie 3'];
        const updated = await repo.updateWatchlist('test-id-5', newWatchlist);

        assert.deepStrictEqual(updated?.watchlist, newWatchlist);
    });

    it('should return null when updating watchlist for non-existent user', async () => {
        const result = await repo.updateWatchlist('non-existent-id', ['Movie 1']);
        assert.strictEqual(result, null);
    });

    it('should get all users', async () => {
        const user1: User = { id: 'id1', name: 'User 1', watchlist: [] };
        const user2: User = { id: 'id2', name: 'User 2', watchlist: [] };

        await repo.create(user1);
        await repo.create(user2);

        const users = await repo.getAll();
        assert.strictEqual(users.length, 2);
    });
});
