import { JSONFilePreset } from 'lowdb/node';
import { TopMovieHeap } from './heap.js';
import { MovieCount, User } from './models';

export class Analysis {
    async run() {
        const defaultData: { users: User[] } = { users: [] };

        let db;
        try {
            db = await JSONFilePreset('db.json', defaultData);
        } catch (error) {
            console.error('Error loading database:', error);
            throw new Error('Failed to load database. Please ensure db.json exists and is readable.');
        }

        const { users } = db.data;

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
                map.set(title, count);
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

            console.log(output);
            console.log(`Wanted by ${count.users.length} people`);
            console.log('');
        }
    }
}

const a = new Analysis();
await a.run()
