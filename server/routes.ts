import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gameStateSchema, memoryGameStateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get words for a game session (random selection from category)
  app.get("/api/categories/:id/words", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const count = parseInt(req.query.count as string) || 10;
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const words = await storage.getRandomWordsByCategoryId(categoryId, count);
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });

  // Get user score
  app.get("/api/scores", async (_req, res) => {
    try {
      const score = await storage.getUserScore();
      res.json(score);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch score" });
    }
  });

  // Update user score
  app.post("/api/scores", async (req, res) => {
    try {
      const scoreSchema = z.object({
        bestScore: z.number().optional(),
        wordsSolved: z.number().optional(),
        memorySetsCompleted: z.number().optional(),
        categoryProgress: z.record(z.number()).optional(),
      });

      const parsedData = scoreSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid score data", errors: parsedData.error });
      }

      const updatedScore = await storage.updateUserScore(parsedData.data);
      res.json(updatedScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  // Create game session with initial game state
  app.post("/api/game/start", async (req, res) => {
    try {
      const startGameSchema = z.object({
        categoryId: z.number(),
        wordCount: z.number().default(10),
      });

      const parsedData = startGameSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid game data", errors: parsedData.error });
      }

      const { categoryId, wordCount } = parsedData.data;
      
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const words = await storage.getRandomWordsByCategoryId(categoryId, wordCount);
      if (words.length === 0) {
        return res.status(404).json({ message: "No words found for this category" });
      }

      // Initialize the game state
      const gameState = {
        currentCategory: category.name,
        categoryId: category.id,
        words: words,
        currentWordIndex: 0,
        maxWords: words.length,
        score: 0,
        totalScore: 0,
        wordsSolved: 0,
        gameStatus: "playing"
      };

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to start game" });
    }
  });

  // Create memory game session with initial game state
  app.post("/api/memory/start", async (req, res) => {
    try {
      const startMemoryGameSchema = z.object({
        categoryId: z.number(),
        difficulty: z.number().default(1),
        cardCount: z.number().default(12),
      });

      const parsedData = startMemoryGameSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: "Invalid memory game data", 
          errors: parsedData.error 
        });
      }

      const { categoryId, difficulty, cardCount } = parsedData.data;
      
      const category = await storage.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Get memory cards for this category and difficulty
      let cards = await storage.getRandomMemoryCardsByCategoryId(categoryId, cardCount / 2);
      
      // Duplicate each card to create pairs
      cards = cards.flatMap(card => [
        { ...card, id: card.id * 2 - 1 },
        { ...card, id: card.id * 2 }
      ]);
      
      // Shuffle the cards
      const shuffledCards = [...cards]
        .sort(() => 0.5 - Math.random())
        .map((card, index) => ({
          id: card.id,
          value: card.value,
          image: card.image || null,
          flipped: false,
          matched: false,
          position: index
        }));

      // Initialize the memory game state
      const gameState = {
        currentCategory: category.name,
        categoryId: category.id,
        cards: shuffledCards,
        difficulty: difficulty,
        moves: 0,
        pairs: Math.floor(shuffledCards.length / 2),
        remainingPairs: Math.floor(shuffledCards.length / 2),
        timeElapsed: 0,
        timeLimit: difficulty === 1 ? 120 : difficulty === 2 ? 90 : 60,
        score: 0,
        gameStatus: "playing"
      };

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to start memory game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
