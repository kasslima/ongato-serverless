
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../../db/schema";
import { User, UserCreateInput, UserResponse, UserUpdateInput } from "./schema";


export interface IUserRepository {
    getAll(): Promise<UserResponse[]>;
    findById(id: number): Promise<UserResponse | null>;
    findByEmail(email: string): Promise<User | null>;
    create(input: UserCreateInput): Promise<UserResponse>;
    update(id: number, input: UserUpdateInput): Promise<UserResponse>;
    delete(id: number): Promise<void>;
}

export class UserRepository implements IUserRepository {
    private orm;


    constructor(private readonly db: D1Database) {
        this.orm = drizzle(this.db);
     }
    

    async getAll(): Promise<UserResponse[]> {
        const rows = await this.orm
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt
            })
            .from(users)
            .orderBy(desc(users.id));

        return rows
    }

    async findById(id: number): Promise<UserResponse | null> {
        const rows = await this.orm
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt
            })
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

    async create(input: UserCreateInput): Promise<UserResponse> {
        const rows = await this.orm
            .insert(users)
            .values(input)
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt
            });

        if (rows.length === 0) {
            throw new Error("Falha ao criar usuário");
        }

        return rows[0]
    }

    async update(id: number, input: UserUpdateInput): Promise<UserResponse> {
        const rows = await this.orm
            .update(users)
            .set(input)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt
            });
        if (rows.length === 0) {
            throw new Error("Falha ao atualizar usuário");
        }
        return rows[0]
    }

    async delete(id: number): Promise<void> {
        await this.orm
            .delete(users)
            .where(eq(users.id, id));
    }
}
