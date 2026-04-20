
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../../db/schema";
import { User, UserCreateInput } from "./schema";


export interface IUserRepository {
    getAll(): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(input: UserCreateInput): Promise<User>;
    delete(id: number): Promise<void>;
}

export class UserRepository implements IUserRepository {
    private orm;


    constructor(private readonly db: D1Database) {
        this.orm = drizzle(this.db);
     }
    

    async getAll(): Promise<User[]> {
        const rows = await this.orm
            .select()
            .from(users)
            .orderBy(desc(users.id));

        return rows
    }

    async findById(id: number): Promise<User | null> {
        const rows = await this.orm
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }

    async findByEmail(email: string): Promise<User | null> {
        const rows = await this.orm
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }

    async create(input: UserCreateInput): Promise<User> {
        const rows = await this.orm
            .insert(users)
            .values(input)
            .returning();

        if (rows.length === 0) {
            throw new Error("Falha ao criar usuário");
        }

        return rows[0]
    }

    async delete(id: number): Promise<void> {
        await this.orm
            .delete(users)
            .where(eq(users.id, id));
    }
}
