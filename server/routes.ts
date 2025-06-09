import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertUserProgressSchema,
  insertUserSolutionSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Progress tracking routes
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get("/api/progress/:topicId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { topicId } = req.params;
      const progress = await storage.getTopicProgress(userId, topicId);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching topic progress:", error);
      res.status(500).json({ message: "Failed to fetch topic progress" });
    }
  });

  app.post("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(userId, progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Practice problems routes
  app.get("/api/problems", async (req, res) => {
    try {
      const { topicId } = req.query;
      const problems = await storage.getPracticeProblems(topicId as string);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  app.get("/api/problems/:id", async (req, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const problem = await storage.getPracticeProblem(problemId);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      res.json(problem);
    } catch (error) {
      console.error("Error fetching problem:", error);
      res.status(500).json({ message: "Failed to fetch problem" });
    }
  });

  // User solutions routes
  app.get("/api/solutions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { problemId } = req.query;
      const solutions = await storage.getUserSolutions(
        userId,
        problemId ? parseInt(problemId as string) : undefined
      );
      res.json(solutions);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      res.status(500).json({ message: "Failed to fetch solutions" });
    }
  });

  app.post("/api/solutions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const solutionData = insertUserSolutionSchema.parse({
        ...req.body,
        userId,
      });
      const solution = await storage.saveUserSolution(solutionData);
      res.json(solution);
    } catch (error) {
      console.error("Error saving solution:", error);
      res.status(500).json({ message: "Failed to save solution" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
