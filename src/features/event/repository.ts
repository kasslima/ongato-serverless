
import { and, desc, eq, like, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { events } from "../../db/schema";
import { Event, EventCreate, EventQuery, EventUpdate, EventUpdateInput } from "./schema";


export interface IEventRepository {
    getAll(query: EventQuery): Promise<Event[]>;
    findById(id: number): Promise<Event | null>;
    findByTitle(title: string): Promise<Event | null>;
    create(input: EventCreate): Promise<Event>;
    update(id: number, input: EventUpdateInput): Promise<Event>;
    delete(id: number): Promise<void>;
}

export class EventRepository implements IEventRepository {
    private orm;


    constructor(private readonly db: D1Database) {
        this.orm = drizzle(this.db);
     }
    

    async getAll(query: EventQuery): Promise<Event[]> {
        const filters = [];

        if (query.cursor) {
            filters.push(lt(events.id, query.cursor));
        }

        if (query.title) {
            filters.push(like(events.title, `%${query.title}%`));
        }

        const rows = await this.orm
            .select()
            .from(events)
            .where(filters.length > 0 ? and(...filters) : undefined)
            .limit(query.limit)
            .orderBy(desc(events.id));

        return rows
    }

    async findById(id: number): Promise<Event | null> {
        const rows = await this.orm
            .select()
            .from(events)
            .where(eq(events.id, id))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }

    async findByTitle(title: string): Promise<Event | null> {
        const rows = await this.orm
            .select()
            .from(events)
            .where(eq(events.title, title))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }

    async create(input: EventCreate): Promise<Event> {
        const rows = await this.orm
            .insert(events)
            .values(input)
            .returning();

        if (rows.length === 0) {
            throw new Error("Falha ao criar usuário");
        }

        return rows[0]
    }

    async update(id: number, input: EventUpdate): Promise<Event> {
        const rows = await this.orm
            .update(events)
            .set(input)
            .where(eq(events.id, id))
            .returning();
        if (rows.length === 0) {
            throw new Error("Falha ao atualizar usuário");
        }
        return rows[0]
    }

    async delete(id: number): Promise<void> {
        await this.orm
            .delete(events)
            .where(eq(events.id, id));
    }
}
