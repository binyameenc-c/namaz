import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const teachers = pgTable("teachers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const classes = pgTable("classes", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const students = pgTable("students", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: text("name").notNull(),
  rollNo: integer("roll_no").notNull(),
  classId: varchar("class_id", { length: 50 }).notNull().references(() => classes.id),
  gender: varchar("gender", { length: 1 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTeacherSchema = createInsertSchema(teachers).pick({
  name: true,
  email: true,
  password: true,
});

export const loginTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const insertClassSchema = createInsertSchema(classes).pick({
  id: true,
  name: true,
});

export const insertStudentSchema = createInsertSchema(students).pick({
  id: true,
  name: true,
  rollNo: true,
  classId: true,
  gender: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
