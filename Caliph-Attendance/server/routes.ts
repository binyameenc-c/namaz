import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeacherSchema, loginTeacherSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Teacher registration
  app.post("/api/teachers/register", async (req, res) => {
    try {
      const parseResult = insertTeacherSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid input", details: parseResult.error.errors });
      }

      const { name, email, password } = parseResult.data;

      if (password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters" });
      }

      const existingTeacher = await storage.getTeacherByEmail(email);
      if (existingTeacher) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const result = await storage.createTeacher({ name, email, password: hashedPassword });
      
      if ("error" in result) {
        return res.status(403).json({ error: result.error });
      }

      const { password: _, ...teacherWithoutPassword } = result;
      res.status(201).json(teacherWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register teacher" });
    }
  });

  // Teacher login
  app.post("/api/teachers/login", async (req, res) => {
    try {
      const parseResult = loginTeacherSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const { email, password } = parseResult.data;
      const teacher = await storage.getTeacherByEmail(email);

      if (!teacher) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, teacher.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const { password: _, ...teacherWithoutPassword } = teacher;
      res.json(teacherWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Get teacher count (for showing slots available)
  app.get("/api/teachers/count", async (req, res) => {
    try {
      const count = await storage.getTeacherCount();
      res.json({ count, maxTeachers: 5, available: 5 - count });
    } catch (error) {
      console.error("Count error:", error);
      res.status(500).json({ error: "Failed to get teacher count" });
    }
  });

  return httpServer;
}
