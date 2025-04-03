import { 
  categories, 
  words, 
  memoryCards,
  userScores, 
  type Category, 
  type Word, 
  type MemoryCard,
  type UserScore,
  type InsertCategory,
  type InsertWord,
  type InsertMemoryCard
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Word methods
  getWordsByCategoryId(categoryId: number): Promise<Word[]>;
  getRandomWordsByCategoryId(categoryId: number, count: number): Promise<Word[]>;
  
  // Memory card methods
  getMemoryCardsByCategoryId(categoryId: number): Promise<MemoryCard[]>;
  getRandomMemoryCardsByCategoryId(categoryId: number, count: number): Promise<MemoryCard[]>;
  
  // Score methods
  getUserScore(): Promise<UserScore>;
  updateUserScore(score: Partial<UserScore>): Promise<UserScore>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private words: Map<number, Word>;
  private memoryCards: Map<number, MemoryCard>;
  private userScore: UserScore;
  private categoryCurrentId: number;
  private wordCurrentId: number;
  private memoryCardCurrentId: number;

  constructor() {
    this.categories = new Map();
    this.words = new Map();
    this.memoryCards = new Map();
    this.categoryCurrentId = 1;
    this.wordCurrentId = 1;
    this.memoryCardCurrentId = 1;
    
    // Initialize with default user score
    this.userScore = {
      id: 1,
      bestScore: 0,
      wordsSolved: 0,
      memorySetsCompleted: 0,
      numberSequencesSolved: 0,
      crosswordsCompleted: 0,
      categoryProgress: {}
    };
    
    // Seed with initial data
    this.seedData();
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  // Word methods
  async getWordsByCategoryId(categoryId: number): Promise<Word[]> {
    return Array.from(this.words.values()).filter(
      (word) => word.categoryId === categoryId,
    );
  }

  async getRandomWordsByCategoryId(categoryId: number, count: number): Promise<Word[]> {
    const categoryWords = await this.getWordsByCategoryId(categoryId);
    // Shuffle array and take requested count
    return [...categoryWords]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  // Memory card methods
  async getMemoryCardsByCategoryId(categoryId: number): Promise<MemoryCard[]> {
    return Array.from(this.memoryCards.values()).filter(
      (card) => card.categoryId === categoryId,
    );
  }

  async getRandomMemoryCardsByCategoryId(categoryId: number, count: number): Promise<MemoryCard[]> {
    const categoryCards = await this.getMemoryCardsByCategoryId(categoryId);
    // Shuffle array and take requested count
    return [...categoryCards]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  // Score methods
  async getUserScore(): Promise<UserScore> {
    return this.userScore;
  }

  async updateUserScore(score: Partial<UserScore>): Promise<UserScore> {
    this.userScore = { ...this.userScore, ...score };
    return this.userScore;
  }

  // Helper methods for seeding initial data
  private addCategory(category: InsertCategory): Category {
    const id = this.categoryCurrentId++;
    const newCategory = { 
      ...category, 
      id,
      gameType: category.gameType ?? 'word' // Ensure gameType is never undefined
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  private addWord(word: InsertWord): Word {
    const id = this.wordCurrentId++;
    // Ensure hints is always a proper string array
    const hints = Array.isArray(word.hints) ? word.hints : [];
    const newWord = { 
      id,
      word: word.word,
      categoryId: word.categoryId,
      hints: hints
    };
    this.words.set(id, newWord);
    return newWord;
  }
  
  private addMemoryCard(card: InsertMemoryCard): MemoryCard {
    const id = this.memoryCardCurrentId++;
    const newCard = {
      id,
      value: card.value,
      image: card.image,
      categoryId: card.categoryId,
      difficulty: card.difficulty || 1
    };
    this.memoryCards.set(id, newCard);
    return newCard;
  }

  private seedData() {
    // Add categories for different brain teaser games
    const wordPuzzleCategory = this.addCategory({
      name: "Word Guessing Challenge",
      icon: "fa-font",
      color: "#4F46E5", // Improved color for better visibility
      wordCount: 25,
      gameType: "word"
    });

    const memoryMatchCategory = this.addCategory({
      name: "Memory Matching",
      icon: "fa-clone",
      color: "#F59E0B",
      wordCount: 30,
      gameType: "memory"
    });

    const numberSequenceCategory = this.addCategory({
      name: "Number Sequences",
      icon: "fa-sort-numeric-up",
      color: "#6366F1",
      wordCount: 32,
      gameType: "number"
    });

    const crosswordsCategory = this.addCategory({
      name: "Crosswords",
      icon: "fa-table",
      color: "#F59E0B",
      wordCount: 18,
      gameType: "crossword"
    });

    // Add words for Word Guessing category (Animals theme)
    this.addWord({
      word: "DOLPHIN",
      categoryId: wordPuzzleCategory.id,
      hints: ["Intelligent marine mammal", "Known for its playful behavior", "Uses echolocation to navigate"]
    });

    this.addWord({
      word: "ELEPHANT",
      categoryId: wordPuzzleCategory.id,
      hints: ["Largest land mammal", "Has a long trunk and tusks", "Known for excellent memory"]
    });

    this.addWord({
      word: "GIRAFFE",
      categoryId: wordPuzzleCategory.id,
      hints: ["Tallest living animal", "Has a very long neck", "Native to African savannas"]
    });

    this.addWord({
      word: "PENGUIN",
      categoryId: wordPuzzleCategory.id,
      hints: ["Flightless bird", "Primarily lives in Antarctica", "Excellent swimmers"]
    });

    // Add more words for Word Guessing category (Countries theme)
    this.addWord({
      word: "BRAZIL",
      categoryId: wordPuzzleCategory.id,
      hints: ["Largest country in South America", "Famous for carnival celebrations", "Home to most of the Amazon rainforest"]
    });

    this.addWord({
      word: "JAPAN",
      categoryId: wordPuzzleCategory.id,
      hints: ["Island nation in East Asia", "Known for cherry blossoms", "Famous for sushi and anime"]
    });

    this.addWord({
      word: "EGYPT",
      categoryId: wordPuzzleCategory.id,
      hints: ["North African country", "Famous for ancient pyramids", "The Nile river runs through it"]
    });

    this.addWord({
      word: "CANADA",
      categoryId: wordPuzzleCategory.id,
      hints: ["Second largest country by area", "Known for maple syrup", "Has the longest coastline in the world"]
    });
    
    // Add more words for Word Guessing category (Foods theme)
    this.addWord({
      word: "CHOCOLATE",
      categoryId: wordPuzzleCategory.id,
      hints: ["Sweet treat made from cocoa", "Can be dark, milk or white", "Often given as a gift on Valentine's Day"]
    });

    this.addWord({
      word: "PIZZA",
      categoryId: wordPuzzleCategory.id,
      hints: ["Italian dish with toppings", "Usually round with a crust", "Popular delivery food"]
    });
    
    // Add more words for Word Guessing category (Space theme)
    this.addWord({
      word: "GALAXY",
      categoryId: wordPuzzleCategory.id,
      hints: ["Massive system of stars", "The Milky Way is one", "Contains planets, stars and nebulae"]
    });

    this.addWord({
      word: "METEOR",
      categoryId: wordPuzzleCategory.id, 
      hints: ["Space rock that enters atmosphere", "Creates a streak of light", "Also called a shooting star"]
    });

    // Add more words for Word Guessing category (Technology theme)
    this.addWord({
      word: "COMPUTER",
      categoryId: wordPuzzleCategory.id,
      hints: ["Electronic device for processing data", "Has a CPU and memory", "Used for work and entertainment"]
    });

    this.addWord({
      word: "INTERNET",
      categoryId: wordPuzzleCategory.id,
      hints: ["Global network of connected computers", "Used to access websites", "Allows instant communication worldwide"]
    });

    // Add words for Memory Matching category
    this.addWord({
      word: "PAIRS",
      categoryId: memoryMatchCategory.id,
      hints: ["Finding matching items", "Tests short-term recall", "Often played with cards"]
    });

    this.addWord({
      word: "MEMORY",
      categoryId: memoryMatchCategory.id,
      hints: ["Ability to recall information", "Storage of knowledge", "Can be improved with practice"]
    });

    this.addWord({
      word: "RECALL",
      categoryId: memoryMatchCategory.id,
      hints: ["Bringing back to mind", "Remembering previous patterns", "Quick mental access"]
    });

    // Add more words for Memory Matching category
    this.addWord({
      word: "MATCH",
      categoryId: memoryMatchCategory.id,
      hints: ["Finding identical items", "Looking for similarities", "Pairing like with like"]
    });



    // Add words for Number Sequences category
    this.addWord({
      word: "PATTERN",
      categoryId: numberSequenceCategory.id,
      hints: ["Repeating elements", "Discernible regularity", "Requires logical detection"]
    });

    this.addWord({
      word: "SEQUENCE",
      categoryId: numberSequenceCategory.id,
      hints: ["Series of related elements", "Following a logical order", "Each element builds on previous ones"]
    });

    this.addWord({
      word: "FIBONACCI",
      categoryId: numberSequenceCategory.id,
      hints: ["Famous number pattern", "Each number is sum of two preceding ones", "Starts with 0, 1, 1, 2, 3, 5..."]
    });

    // Add more words for Number Sequences category
    this.addWord({
      word: "PRIME",
      categoryId: numberSequenceCategory.id,
      hints: ["Divisible only by 1 and itself", "2, 3, 5, 7, 11...", "Special category of numbers"]
    });

    // Add words for Crosswords category
    this.addWord({
      word: "CLUES",
      categoryId: crosswordsCategory.id,
      hints: ["Hints to find answers", "Can be cryptic or direct", "Guide to solving puzzles"]
    });

    this.addWord({
      word: "ACROSS",
      categoryId: crosswordsCategory.id,
      hints: ["Horizontal direction", "From left to right", "One dimension in a grid"]
    });

    this.addWord({
      word: "DOWN",
      categoryId: crosswordsCategory.id,
      hints: ["Vertical direction", "From top to bottom", "Perpendicular to across"]
    });
    
    // Add more words for Crosswords category
    this.addWord({
      word: "FILL",
      categoryId: crosswordsCategory.id,
      hints: ["Complete the empty spaces", "Enter the correct answers", "Populate the blank squares"]
    });
    
    // Add memory cards for animals category
    const animalsCategoryId = memoryMatchCategory.id;
    
    this.addMemoryCard({ value: "🐘", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🐘", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🦒", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🦒", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🦁", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🦁", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🐬", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🐬", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🦈", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🦈", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🐢", categoryId: animalsCategoryId, difficulty: 1 });
    this.addMemoryCard({ value: "🐢", categoryId: animalsCategoryId, difficulty: 1 });
    
    // Add memory cards for food category
    const foodCategoryId = memoryMatchCategory.id;
    
    this.addMemoryCard({ value: "🍕", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍕", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍔", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍔", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍦", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍦", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍩", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍩", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍎", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍎", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍉", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍉", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🥑", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🥑", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍗", categoryId: foodCategoryId, difficulty: 2 });
    this.addMemoryCard({ value: "🍗", categoryId: foodCategoryId, difficulty: 2 });
    
    // Add memory cards for space category
    const spaceCategoryId = memoryMatchCategory.id;
    
    this.addMemoryCard({ value: "🚀", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🚀", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🌎", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🌎", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🌙", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🌙", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "⭐", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "⭐", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "☄️", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "☄️", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🌌", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🌌", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "👨‍🚀", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "👨‍🚀", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "👩‍🚀", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "👩‍🚀", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🛰️", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🛰️", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🪐", categoryId: spaceCategoryId, difficulty: 3 });
    this.addMemoryCard({ value: "🪐", categoryId: spaceCategoryId, difficulty: 3 });
  }
}

export const storage = new MemStorage();
