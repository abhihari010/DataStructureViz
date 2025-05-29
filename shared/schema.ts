import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  topicId: varchar("topic_id").notNull(),
  completed: boolean("completed").default(false),
  score: integer("score").default(0),
  timeSpent: integer("time_spent").default(0), // in seconds
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Practice problems
export const practiceProblems = pgTable("practice_problems", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  difficulty: varchar("difficulty").notNull(), // easy, medium, hard
  topicId: varchar("topic_id").notNull(),
  testCases: jsonb("test_cases"),
  solution: text("solution"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User solutions to practice problems
export const userSolutions = pgTable("user_solutions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  problemId: integer("problem_id").references(() => practiceProblems.id).notNull(),
  code: text("code"),
  language: varchar("language").notNull(),
  passed: boolean("passed").default(false),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPracticeProblemSchema = createInsertSchema(practiceProblems).omit({
  id: true,
  createdAt: true,
});

export const insertUserSolutionSchema = createInsertSchema(userSolutions).omit({
  id: true,
  submittedAt: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type PracticeProblem = typeof practiceProblems.$inferSelect;
export type InsertPracticeProblem = z.infer<typeof insertPracticeProblemSchema>;
export type UserSolution = typeof userSolutions.$inferSelect;
export type InsertUserSolution = z.infer<typeof insertUserSolutionSchema>;
