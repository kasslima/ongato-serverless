
import { and, desc, eq, like, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { animals } from "../../db/schema";
import { Animal, AnimalCreate, AnimalQuery, AnimalUpdate, AnimalUpdateInput } from "./schema";


export interface IAnimalRepository {
    getAll(query: AnimalQuery): Promise<Animal[]>;
    findById(id: number): Promise<Animal | null>;
    create(input: AnimalCreate): Promise<Animal>;
    update(id: number, input: AnimalUpdateInput): Promise<Animal>;
    delete(id: number): Promise<void>;
}

export class AnimalRepository implements IAnimalRepository {
    private orm;


    constructor(private readonly db: D1Database) {
        this.orm = drizzle(this.db);
     }
    

    async getAll(query: AnimalQuery): Promise<Animal[]> {
        const filters = [];

        if (query.cursor) {
            filters.push(lt(animals.id, query.cursor));
        }

        if (query.name) {
            filters.push(like(animals.name, `%${query.name}%`));
        }

        if (query.type) {
            filters.push(eq(animals.type, query.type));
        }

        if (query.gender) {
            filters.push(eq(animals.gender, query.gender));
        }

        const rows = await this.orm
            .select()
            .from(animals)
            .where(filters.length > 0 ? and(...filters) : undefined)
            .limit(query.limit)
            .orderBy(desc(animals.id));

        return rows
    }

    async findById(id: number): Promise<Animal | null> {
        const rows = await this.orm
            .select()
            .from(animals)
            .where(eq(animals.id, id))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }
    
    async create(input: AnimalCreate): Promise<Animal> {
        const rows = await this.orm
            .insert(animals)
            .values(input)
            .returning();

        if (rows.length === 0) {
            throw new Error("Falha ao criar usuário");
        }

        return rows[0]
    }

    async update(id: number, input: AnimalUpdate): Promise<Animal> {
        const rows = await this.orm
            .update(animals)
            .set(input)
            .where(eq(animals.id, id))
            .returning();
        if (rows.length === 0) {
            throw new Error("Falha ao atualizar usuário");
        }
        return rows[0]
    }

    async delete(id: number): Promise<void> {
        await this.orm
            .delete(animals)
            .where(eq(animals.id, id));
    }
}
