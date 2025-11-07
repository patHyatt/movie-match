import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TopMovieHeap } from '../src/heap.js';
import { MovieCount } from '../src/models.js';

describe('TopMovieHeap', () => {
    it('should return null when popping from empty heap', () => {
        const heap = new TopMovieHeap();
        const result = heap.pop();
        assert.strictEqual(result, null);
    });

    it('should push and pop a single movie', () => {
        const heap = new TopMovieHeap();
        const movie: MovieCount = {
            title: 'The Matrix',
            users: ['Alice', 'Bob']
        };

        heap.push(movie);
        const result = heap.pop();

        assert.deepStrictEqual(result, movie);
    });

    it('should return movies in descending order by user count', () => {
        const heap = new TopMovieHeap();

        const movie1: MovieCount = {
            title: 'Movie A',
            users: ['User1']
        };

        const movie2: MovieCount = {
            title: 'Movie B',
            users: ['User1', 'User2', 'User3']
        };

        const movie3: MovieCount = {
            title: 'Movie C',
            users: ['User1', 'User2']
        };

        heap.push(movie1);
        heap.push(movie2);
        heap.push(movie3);

        const first = heap.pop();
        const second = heap.pop();
        const third = heap.pop();

        assert.strictEqual(first?.title, 'Movie B');
        assert.strictEqual(first?.users.length, 3);

        assert.strictEqual(second?.title, 'Movie C');
        assert.strictEqual(second?.users.length, 2);

        assert.strictEqual(third?.title, 'Movie A');
        assert.strictEqual(third?.users.length, 1);
    });

    it('should handle multiple movies with same user count', () => {
        const heap = new TopMovieHeap();

        const movie1: MovieCount = {
            title: 'Movie A',
            users: ['User1', 'User2']
        };

        const movie2: MovieCount = {
            title: 'Movie B',
            users: ['User3', 'User4']
        };

        heap.push(movie1);
        heap.push(movie2);

        const first = heap.pop();
        const second = heap.pop();

        assert.strictEqual(first?.users.length, 2);
        assert.strictEqual(second?.users.length, 2);
    });

    it('should maintain heap property after multiple operations', () => {
        const heap = new TopMovieHeap();

        const movies: MovieCount[] = [
            { title: 'Movie 1', users: ['A'] },
            { title: 'Movie 2', users: ['A', 'B', 'C', 'D', 'E'] },
            { title: 'Movie 3', users: ['A', 'B'] },
            { title: 'Movie 4', users: ['A', 'B', 'C'] },
            { title: 'Movie 5', users: ['A', 'B', 'C', 'D'] }
        ];

        // Push all movies
        movies.forEach(movie => heap.push(movie));

        // Pop all and verify descending order
        let prev = heap.pop();
        assert.strictEqual(prev?.users.length, 5);

        for (let i = 0; i < movies.length - 1; i++) {
            const current = heap.pop();
            if (current && prev) {
                assert.ok(prev.users.length >= current.users.length,
                    `Heap order violated: ${prev.users.length} should be >= ${current.users.length}`);
            }
            prev = current;
        }
    });

    it('should handle single element heap', () => {
        const heap = new TopMovieHeap();
        const movie: MovieCount = {
            title: 'Solo Movie',
            users: ['User1']
        };

        heap.push(movie);
        const first = heap.pop();
        const second = heap.pop();

        assert.deepStrictEqual(first, movie);
        assert.strictEqual(second, null);
    });

    it('should return null after all elements are popped', () => {
        const heap = new TopMovieHeap();

        heap.push({ title: 'Movie 1', users: ['A'] });
        heap.push({ title: 'Movie 2', users: ['A', 'B'] });

        heap.pop();
        heap.pop();
        const result = heap.pop();

        assert.strictEqual(result, null);
    });
});
