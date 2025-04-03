import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  wordCount: integer("word_count").notNull(),
  gameType: text("game_type").default("word").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  color: true,
  wordCount: true,
  gameType: true
});

// Define the Word schema
export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  categoryId: integer("category_id").notNull(),
  hints: json("hints").$type<string[]>().notNull().default([]),
});

export const insertWordSchema = createInsertSchema(words).pick({
  word: true,
  categoryId: true,
  hints: true
});

// Define the Memory Card schema
export const memoryCards = pgTable("memory_cards", {
  id: serial("id").primaryKey(),
  value: text("value").notNull(),
  image: text("image"),
  categoryId: integer("category_id").notNull(),
  difficulty: integer("difficulty").default(1),
});

export const insertMemoryCardSchema = createInsertSchema(memoryCards).pick({
  value: true,
  image: true,
  categoryId: true,
  difficulty: true
});

// Define the UserScore schema
export const userScores = pgTable("user_scores", {
  id: serial("id").primaryKey(),
  bestScore: integer("best_score").notNull().default(0),
  wordsSolved: integer("words_solved").notNull().default(0),
  memorySetsCompleted: integer("memory_sets_completed").default(0),
  numberSequencesSolved: integer("number_sequences_solved").default(0),
  categoryProgress: json("category_progress").notNull().default({}),
});

export const insertUserScoreSchema = createInsertSchema(userScores).pick({
  bestScore: true,
  wordsSolved: true,
  memorySetsCompleted: true,
  numberSequencesSolved: true,
  categoryProgress: true
});

// Define the GameState schema for the word guessing game
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

// Define the MemoryGameState schema for the memory matching game
export const memoryGameStateSchema = z.object({
  currentCategory: z.string().optional(),
  categoryId: z.number().optional(),
  cards: z.array(
    z.object({
      id: z.number(),
      value: z.string(),
      image: z.string().optional(),
      flipped: z.boolean().default(false),
      matched: z.boolean().default(false),
      position: z.number(),
    })
  ).default([]),
  difficulty: z.number().default(1),
  moves: z.number().default(0),
  pairs: z.number().default(0),
  remainingPairs: z.number().default(0),
  timeElapsed: z.number().default(0),
  timeLimit: z.number().default(60),
  score: z.number().default(0),
  gameStatus: z.enum(["idle", "playing", "won", "timeup"]).default("idle"),
});

// Type definitions
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Word = typeof words.$inferSelect;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type MemoryCard = typeof memoryCards.$inferSelect;
export type InsertMemoryCard = z.infer<typeof insertMemoryCardSchema>;
export type UserScore = typeof userScores.$inferSelect;
export type InsertUserScore = z.infer<typeof insertUserScoreSchema>;
export type GameState = z.infer<typeof gameStateSchema>;
export type MemoryGameState = z.infer<typeof memoryGameStateSchema>;
