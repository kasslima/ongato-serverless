
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { banners } from "../../db/schema";
import { Banner, BannerCreate, BannerCreateInput, BannerUpdate, BannerUpdateInput } from "./schema";


export interface IBannerRepository {
    getAll(): Promise<Banner[]>;
    findById(id: number): Promise<Banner | null>;
    findByTitle(title: string): Promise<Banner | null>;
    create(input: BannerCreate): Promise<Banner>;
    update(id: number, input: BannerUpdateInput): Promise<Banner>;
    delete(id: number): Promise<void>;
}

export class BannerRepository implements IBannerRepository {
    private orm;


    constructor(private readonly db: D1Database) {
        this.orm = drizzle(this.db);
     }
    

    async getAll(): Promise<Banner[]> {
        const rows = await this.orm
            .select()
            .from(banners)
            .orderBy(desc(banners.id));

        return rows
    }

    async findById(id: number): Promise<Banner | null> {
        const rows = await this.orm
            .select()
            .from(banners)
            .where(eq(banners.id, id))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }

    async findByTitle(title: string): Promise<Banner | null> {
        const rows = await this.orm
            .select()
            .from(banners)
            .where(eq(banners.title, title))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        return rows[0]
    }

    async create(input: BannerCreate): Promise<Banner> {
        const rows = await this.orm
            .insert(banners)
            .values(input)
            .returning();

        if (rows.length === 0) {
            throw new Error("Falha ao criar usuário");
        }

        return rows[0]
    }

    async update(id: number, input: BannerUpdate): Promise<Banner> {
        const rows = await this.orm
            .update(banners)
            .set(input)
            .where(eq(banners.id, id))
            .returning();
        if (rows.length === 0) {
            throw new Error("Falha ao atualizar usuário");
        }
        return rows[0]
    }

    async delete(id: number): Promise<void> {
        await this.orm
            .delete(banners)
            .where(eq(banners.id, id));
    }
}
