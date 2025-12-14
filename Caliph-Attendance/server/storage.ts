import { drizzle } from "drizzle-orm/node-postgres";
import { eq, count } from "drizzle-orm";
import pg from "pg";
import { teachers, type Teacher, type InsertTeacher } from "@shared/schema";

const MAX_TEACHERS = 5;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByEmail(email: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher | { error: string }>;
  getAllTeachers(): Promise<Teacher[]>;
  getTeacherCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getTeacher(id: string): Promise<Teacher | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.id, id));
    return result[0];
  }

  async getTeacherByEmail(email: string): Promise<Teacher | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.email, email));
    return result[0];
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher | { error: string }> {
    const currentCount = await this.getTeacherCount();
    if (currentCount >= MAX_TEACHERS) {
      return { error: `Maximum of ${MAX_TEACHERS} teachers allowed. Please contact administrator.` };
    }

    const result = await db.insert(teachers).values(insertTeacher).returning();
    return result[0];
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }

  async getTeacherCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(teachers);
    return result[0]?.count ?? 0;
  }
}

export const storage = new DatabaseStorage();
