import { 
  categories, 
  words, 
  userScores, 
  type Category, 
  type Word, 
  type UserScore,
  type InsertCategory,
  type InsertWord
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Word methods
  getWordsByCategoryId(categoryId: number): Promise<Word[]>;
  getRandomWordsByCategoryId(categoryId: number, count: number): Promise<Word[]>;
  
  // Score methods
  getUserScore(): Promise<UserScore>;
  updateUserScore(score: Partial<UserScore>): Promise<UserScore>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private words: Map<number, Word>;
  private userScore: UserScore;
  private categoryCurrentId: number;
  private wordCurrentId: number;

  constructor() {
    this.categories = new Map();
    this.words = new Map();
    this.categoryCurrentId = 1;
    this.wordCurrentId = 1;
    
    // Initialize with default user score
    this.userScore = {
      id: 1,
      bestScore: 0,
      wordsSolved: 0,
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
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  private addWord(word: InsertWord): Word {
    const id = this.wordCurrentId++;
    const newWord = { 
      id,
      word: word.word,
      categoryId: word.categoryId,
      hints: word.hints
    };
    this.words.set(id, newWord);
    return newWord;
  }

  private seedData() {
    // Add categories for different brain teaser games
    const wordPuzzleCategory = this.addCategory({
      name: "Word Guessing",
      icon: "fa-font",
      color: "#6366F1",
      wordCount: 25
    });

    const memoryMatchCategory = this.addCategory({
      name: "Memory Matching",
      icon: "fa-clone",
      color: "#F59E0B",
      wordCount: 30
    });

    const puzzleGamesCategory = this.addCategory({
      name: "Puzzle Games",
      icon: "fa-puzzle-piece",
      color: "#10B981",
      wordCount: 20
    });

    const wordSearchCategory = this.addCategory({
      name: "Word Search",
      icon: "fa-search",
      color: "#EF4444",
      wordCount: 27
    });

    const numberSequenceCategory = this.addCategory({
      name: "Number Sequences",
      icon: "fa-sort-numeric-up",
      color: "#6366F1",
      wordCount: 32
    });

    const crosswordsCategory = this.addCategory({
      name: "Crosswords",
      icon: "fa-table",
      color: "#F59E0B",
      wordCount: 18
    });

    // Add words for Word Guessing category
    this.addWord({
      word: "PUZZLE",
      categoryId: wordPuzzleCategory.id,
      hints: ["A game or problem that tests ingenuity", "Often involves fitting pieces together", "Can be a mental challenge"]
    });

    this.addWord({
      word: "RIDDLE",
      categoryId: wordPuzzleCategory.id,
      hints: ["A mystifying question to be solved", "Often uses wordplay", "Requires thinking outside the box"]
    });

    this.addWord({
      word: "CRYPTIC",
      categoryId: wordPuzzleCategory.id,
      hints: ["Having a hidden meaning", "Mysterious or obscure", "Requires decoding"]
    });

    // Add more words for Word Guessing category
    this.addWord({
      word: "ENIGMA",
      categoryId: wordPuzzleCategory.id,
      hints: ["A puzzling mystery", "Hard to understand or explain", "Requires careful thought"]
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

    // Add words for Puzzle Games category
    this.addWord({
      word: "JIGSAW",
      categoryId: puzzleGamesCategory.id,
      hints: ["Pieces that interlock", "Creates a complete picture", "Often has 500-1000 pieces"]
    });

    this.addWord({
      word: "SLIDING",
      categoryId: puzzleGamesCategory.id,
      hints: ["Moving tiles in a frame", "Rearranging into correct order", "Classic 15-puzzle game"]
    });

    this.addWord({
      word: "TANGRAM",
      categoryId: puzzleGamesCategory.id,
      hints: ["Chinese geometric puzzle", "Seven pieces to form shapes", "Tests spatial reasoning"]
    });

    // Add more words for Puzzle Games category
    this.addWord({
      word: "SUDOKU",
      categoryId: puzzleGamesCategory.id,
      hints: ["Number placement puzzle", "Grid with 9x9 squares", "Each row and column has numbers 1-9"]
    });

    // Add words for Word Search category
    this.addWord({
      word: "HIDDEN",
      categoryId: wordSearchCategory.id,
      hints: ["Not easily seen", "Concealed from view", "Requires careful searching"]
    });

    this.addWord({
      word: "LETTERS",
      categoryId: wordSearchCategory.id,
      hints: ["Alphabet characters", "Building blocks of words", "Can be arranged in grids"]
    });

    this.addWord({
      word: "SEARCH",
      categoryId: wordSearchCategory.id,
      hints: ["Looking for something", "Careful examination", "Finding what's concealed"]
    });

    // Add more words for Word Search category
    this.addWord({
      word: "GRID",
      categoryId: wordSearchCategory.id,
      hints: ["Network of lines", "Organized arrangement", "Forms boxes or cells"]
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
  }
}

export const storage = new MemStorage();
