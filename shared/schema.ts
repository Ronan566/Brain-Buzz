import { pgTable, text, serial, integer, array, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  wordCount: integer("word_count").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  color: true,
  wordCount: true
});

// Define the Word schema
export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  categoryId: integer("category_id").notNull(),
  hints: array(text("hints")).notNull(),
});

export const insertWordSchema = createInsertSchema(words).pick({
  word: true,
  categoryId: true,
  hints: true
});

// Define the UserScore schema
export const userScores = pgTable("user_scores", {
  id: serial("id").primaryKey(),
  bestScore: integer("best_score").notNull().default(0),
  wordsSolved: integer("words_solved").notNull().default(0),
  categoryProgress: json("category_progress").notNull().default({}),
});

export const insertUserScoreSchema = createInsertSchema(userScores).pick({
  bestScore: true,
  wordsSolved: true,
  categoryProgress: true
});

// Define the GameState schema for the frontend
export const gameStateSchema = z.object({
  currentCategory: z.string().optional(),
  currentWord: z.string().optional(),
  hints: z.array(z.string()),
  revealedHints: z.number().default(0),
  guessedLetters: z.array(z.string()),
  incorrectGuesses: z.number().default(0),
  remainingHints: z.number().default(3),
  score: z.number().default(0),
  totalScore: z.number().default(0),
  wordsSolved: z.number().default(0),
  currentWordIndex: z.number().default(0),
  maxWords: z.number().default(10),
  gameStatus: z.enum(["playing", "won", "lost", "idle"]).default("idle"),
});

// Type definitions
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Word = typeof words.$inferSelect;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type UserScore = typeof userScores.$inferSelect;
export type InsertUserScore = z.infer<typeof insertUserScoreSchema>;
export type GameState = z.infer<typeof gameStateSchema>;
