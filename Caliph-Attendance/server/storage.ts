import { drizzle } from "drizzle-orm/node-postgres";
import { eq, count } from "drizzle-orm";
import pg from "pg";
import { 
  teachers, classes, students,
  type Teacher, type InsertTeacher,
  type Class, type InsertClass,
  type Student, type InsertStudent 
} from "@shared/schema";

const MAX_TEACHERS = 5;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export class DatabaseStorage {
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

  // Classes methods
  async getAllClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClass(id: string): Promise<Class | undefined> {
    const result = await db.select().from(classes).where(eq(classes.id, id));
    return result[0];
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const result = await db.insert(classes).values(insertClass).returning();
    return result[0];
  }

  async deleteClass(id: string): Promise<void> {
    await db.delete(students).where(eq(students.classId, id));
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Students methods
  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.classId, classId));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id));
    return result[0];
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const result = await db.insert(students).values(insertStudent).returning();
    return result[0];
  }

  async createStudentsBulk(studentsList: InsertStudent[]): Promise<Student[]> {
    if (studentsList.length === 0) return [];
    const result = await db.insert(students).values(studentsList).returning();
    return result;
  }

  async updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const result = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return result[0];
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async deleteStudentsByClass(classId: string): Promise<void> {
    await db.delete(students).where(eq(students.classId, classId));
  }

  async getStudentCountByClass(classId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(students).where(eq(students.classId, classId));
    return result[0]?.count ?? 0;
  }

  async getMaxRollNoByClass(classId: string): Promise<number> {
    const result = await db.select({ rollNo: students.rollNo })
      .from(students)
      .where(eq(students.classId, classId))
      .orderBy(students.rollNo);
    if (result.length === 0) return 0;
    return Math.max(...result.map(r => r.rollNo));
  }
}

export const storage = new DatabaseStorage();
