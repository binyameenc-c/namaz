import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeacherSchema, loginTeacherSchema, insertClassSchema, insertStudentSchema } from "@shared/schema";
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

  // ============ CLASSES API ============
  
  // Get all classes
  app.get("/api/classes", async (req, res) => {
    try {
      const allClasses = await storage.getAllClasses();
      const classesWithCount = await Promise.all(
        allClasses.map(async (c) => ({
          ...c,
          students: await storage.getStudentCountByClass(c.id)
        }))
      );
      res.json(classesWithCount);
    } catch (error) {
      console.error("Get classes error:", error);
      res.status(500).json({ error: "Failed to get classes" });
    }
  });

  // Create a class
  app.post("/api/classes", async (req, res) => {
    try {
      const { id, name } = req.body;
      if (!id || !name) {
        return res.status(400).json({ error: "Class ID and name are required" });
      }
      const existing = await storage.getClass(id);
      if (existing) {
        return res.status(400).json({ error: "Class already exists" });
      }
      const newClass = await storage.createClass({ id, name });
      res.status(201).json(newClass);
    } catch (error) {
      console.error("Create class error:", error);
      res.status(500).json({ error: "Failed to create class" });
    }
  });

  // Update a class
  app.put("/api/classes/:id", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Class name is required" });
      }
      const updated = await storage.updateClass(req.params.id, { name });
      if (!updated) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update class error:", error);
      res.status(500).json({ error: "Failed to update class" });
    }
  });

  // Delete a class
  app.delete("/api/classes/:id", async (req, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete class error:", error);
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  // ============ STUDENTS API ============

  // Get all students
  app.get("/api/students", async (req, res) => {
    try {
      const allStudents = await storage.getAllStudents();
      res.json(allStudents);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ error: "Failed to get students" });
    }
  });

  // Get students by class
  app.get("/api/students/class/:classId", async (req, res) => {
    try {
      const students = await storage.getStudentsByClass(req.params.classId);
      res.json(students);
    } catch (error) {
      console.error("Get students by class error:", error);
      res.status(500).json({ error: "Failed to get students" });
    }
  });

  // Create a student
  app.post("/api/students", async (req, res) => {
    try {
      const { name, classId, gender } = req.body;
      if (!name || !classId || !gender) {
        return res.status(400).json({ error: "Name, class, and gender are required" });
      }
      const classExists = await storage.getClass(classId);
      if (!classExists) {
        return res.status(400).json({ error: "Class does not exist" });
      }
      const maxRollNo = await storage.getMaxRollNoByClass(classId);
      const rollNo = maxRollNo + 1;
      const id = `${classId.toLowerCase()}-${Date.now()}-${rollNo}`;
      const newStudent = await storage.createStudent({ id, name, rollNo, classId, gender });
      res.status(201).json(newStudent);
    } catch (error) {
      console.error("Create student error:", error);
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  // Bulk create students
  app.post("/api/students/bulk", async (req, res) => {
    try {
      const { students: studentsList, classId } = req.body;
      if (!Array.isArray(studentsList) || !classId) {
        return res.status(400).json({ error: "Students array and classId are required" });
      }
      const classExists = await storage.getClass(classId);
      if (!classExists) {
        return res.status(400).json({ error: "Class does not exist" });
      }
      const maxRollNo = await storage.getMaxRollNoByClass(classId);
      const timestamp = Date.now();
      const formattedStudents = studentsList.map((s: any, index: number) => ({
        id: `${classId.toLowerCase()}-${timestamp}-${maxRollNo + index + 1}`,
        name: s.name,
        rollNo: s.rollNo || maxRollNo + index + 1,
        classId,
        gender: s.gender || 'M'
      }));
      const created = await storage.createStudentsBulk(formattedStudents);
      res.status(201).json(created);
    } catch (error) {
      console.error("Bulk create students error:", error);
      res.status(500).json({ error: "Failed to create students" });
    }
  });

  // Update a student
  app.put("/api/students/:id", async (req, res) => {
    try {
      const updated = await storage.updateStudent(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update student error:", error);
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  // Delete a student
  app.delete("/api/students/:id", async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  return httpServer;
}
