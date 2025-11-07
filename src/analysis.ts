import { TopMovieHeap } from './heap.js';
import { MovieCount } from './models.js';
import { UserRepository } from './repositories/user-repository.js';

export class Analysis {
    private userRepository: UserRepository;

    constructor(userRepository?: UserRepository) {
        this.userRepository = userRepository || new UserRepository();
    }

    async run() {
        let users;
        try {
            users = await this.userRepository.getAll();
        } catch (error) {
            console.error('Error loading database:', error);
            throw new Error('Failed to load database. Please ensure db.json exists and is readable.');
        }

        if (!users || users.length === 0) {
            console.log('No users found in database. Please run the scraper first.');
            return;
        }

        const map = new Map<string, MovieCount>();

        //Aggregate users per title
        for (const user of users) {
            if (!user.watchlist || user.watchlist.length === 0) {
                console.warn(`User ${user.name} (${user.id}) has no movies in watchlist`);
                continue;
            }

            for (const title of user.watchlist) {
                if (!title || title.trim() === '') {
                    console.warn(`Skipping empty title for user ${user.name}`);
                    continue;
                }

                if (!map.has(title))
                    map.set(title, { title, users: [] });

                const count = map.get(title)!;
                count.users.push(`${user.name} (${user.id})`);
            }
        }

        if (map.size === 0) {
            console.log('No movies found across all watchlists.');
            return;
        }

        const heap = new TopMovieHeap();
        for (const movieCount of map.values())
            heap.push(movieCount);

        const totalUsers = users.length;

        //Get top 3
        const TOP_N = 3;
        console.log(`\nTop ${Math.min(TOP_N, map.size)} Movies:\n`);

        for (let top = 1; top <= TOP_N; top++) {
            const count = heap.pop();
            if (!count) break;

            let output = count.title;
            if (count.users.length === totalUsers)
                output = "*UNANIMOUS* " + count.title;

            output += ` Wanted by ${count.users.length} people`;
            console.log(output);
        }
    }
}

// Allow running directly (check if this file is the entry point)
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const isMainModule = process.argv[1] &&
    fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMainModule) {
    const a = new Analysis();
    await a.run();
}
