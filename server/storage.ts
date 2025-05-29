import {
  users,
  userProgress,
  practiceProblems,
  userSolutions,
  type User,
  type UpsertUser,
  type UserProgress,
  type InsertUserProgress,
  type PracticeProblem,
  type InsertPracticeProblem,
  type UserSolution,
  type InsertUserSolution,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Progress tracking
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(userId: string, progress: InsertUserProgress): Promise<UserProgress>;
  getTopicProgress(userId: string, topicId: string): Promise<UserProgress | undefined>;
  
  // Practice problems
  getPracticeProblems(topicId?: string): Promise<PracticeProblem[]>;
  getPracticeProblem(id: number): Promise<PracticeProblem | undefined>;
  
  // User solutions
  getUserSolutions(userId: string, problemId?: number): Promise<UserSolution[]>;
  saveUserSolution(solution: InsertUserSolution): Promise<UserSolution>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Progress tracking
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.updatedAt));
  }

  async updateUserProgress(userId: string, progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.topicId, progress.topicId)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({
          ...progress,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({ userId, ...progress })
        .returning();
      return created;
    }
  }

  async getTopicProgress(userId: string, topicId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.topicId, topicId)
        )
      );
    return progress;
  }

  // Practice problems
  async getPracticeProblems(topicId?: string): Promise<PracticeProblem[]> {
    if (topicId) {
      return await db
        .select()
        .from(practiceProblems)
        .where(eq(practiceProblems.topicId, topicId));
    }
    return await db.select().from(practiceProblems);
  }

  async getPracticeProblem(id: number): Promise<PracticeProblem | undefined> {
    const [problem] = await db
      .select()
      .from(practiceProblems)
      .where(eq(practiceProblems.id, id));
    return problem;
  }

  // User solutions
  async getUserSolutions(userId: string, problemId?: number): Promise<UserSolution[]> {
    const query = db
      .select()
      .from(userSolutions)
      .where(eq(userSolutions.userId, userId));

    if (problemId) {
      return await query.where(eq(userSolutions.problemId, problemId));
    }
    return await query.orderBy(desc(userSolutions.submittedAt));
  }

  async saveUserSolution(solution: InsertUserSolution): Promise<UserSolution> {
    const [saved] = await db
      .insert(userSolutions)
      .values(solution)
      .returning();
    return saved;
  }
}

export const storage = new DatabaseStorage();
