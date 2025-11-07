import { JSONFilePreset } from 'lowdb/node';
import { User } from '../models.js';

export class UserRepository {
    private db: Awaited<ReturnType<typeof JSONFilePreset<{ users: User[] }>>> | null = null;
    private readonly dbPath: string;

    constructor(dbPath: string = 'db.json') {
        this.dbPath = dbPath;
    }

    private async getDb() {
        if (!this.db) {
            const defaultData: { users: User[] } = { users: [] };
            try {
                this.db = await JSONFilePreset(this.dbPath, defaultData);
            } catch (error) {
                throw new Error(`Failed to initialize database at ${this.dbPath}: ${error}`);
            }
        }
        return this.db;
    }

    async getAll(): Promise<User[]> {
        const db = await this.getDb();
        return [...db.data.users];
    }

    async findById(id: string): Promise<User | undefined> {
        const db = await this.getDb();
        return db.data.users.find((user) => user.id === id);
    }

    async create(user: User): Promise<User> {
        const db = await this.getDb();
        await db.update(({ users }) => users.push(user));
        return user;
    }

    async update(id: string, updatedUser: Partial<User>): Promise<User | null> {
        const db = await this.getDb();
        const user = db.data.users.find((u) => u.id === id);

        if (!user) {
            return null;
        }

        Object.assign(user, updatedUser);
        await db.write();
        return user;
    }

    async updateWatchlist(id: string, watchlist: string[]): Promise<User | null> {
        return this.update(id, { watchlist });
    }

    async delete(id: string): Promise<boolean> {
        const db = await this.getDb();
        const index = db.data.users.findIndex((u) => u.id === id);

        if (index === -1) {
            return false;
        }

        db.data.users.splice(index, 1);
        await db.write();
        return true;
    }

    async save(): Promise<void> {
        const db = await this.getDb();
        await db.write();
    }
}
