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
    const newWord = { ...word, id };
    this.words.set(id, newWord);
    return newWord;
  }

  private seedData() {
    // Add categories
    const moviesCategory = this.addCategory({
      name: "Movies",
      icon: "fa-film",
      color: "#6366F1",
      wordCount: 25
    });

    const foodCategory = this.addCategory({
      name: "Food",
      icon: "fa-utensils",
      color: "#F59E0B",
      wordCount: 30
    });

    const countriesCategory = this.addCategory({
      name: "Countries",
      icon: "fa-globe-americas",
      color: "#10B981",
      wordCount: 20
    });

    const gamesCategory = this.addCategory({
      name: "Video Games",
      icon: "fa-gamepad",
      color: "#EF4444",
      wordCount: 27
    });

    const animalsCategory = this.addCategory({
      name: "Animals",
      icon: "fa-paw",
      color: "#6366F1",
      wordCount: 32
    });

    const vehiclesCategory = this.addCategory({
      name: "Vehicles",
      icon: "fa-car",
      color: "#F59E0B",
      wordCount: 18
    });

    // Add words for Movies category
    this.addWord({
      word: "TITANIC",
      categoryId: moviesCategory.id,
      hints: ["A famous ship disaster from 1912", "Leonardo DiCaprio starred in it", "Directed by James Cameron"]
    });

    this.addWord({
      word: "AVATAR",
      categoryId: moviesCategory.id,
      hints: ["Blue aliens", "Pandora is the setting", "Highest grossing movie"]
    });

    this.addWord({
      word: "MATRIX",
      categoryId: moviesCategory.id,
      hints: ["Red pill or blue pill", "Neo is the main character", "Reality is a simulation"]
    });

    // Add words for Food category
    this.addWord({
      word: "PIZZA",
      categoryId: foodCategory.id,
      hints: ["Italian dish", "Round with toppings", "Often delivered to homes"]
    });

    this.addWord({
      word: "SUSHI",
      categoryId: foodCategory.id,
      hints: ["Japanese cuisine", "Often contains raw fish", "Served with wasabi"]
    });

    this.addWord({
      word: "BURGER",
      categoryId: foodCategory.id,
      hints: ["American classic", "Patty between buns", "Fast food staple"]
    });

    // Add words for Countries category
    this.addWord({
      word: "FRANCE",
      categoryId: countriesCategory.id,
      hints: ["Known for the Eiffel Tower", "Located in Europe", "Famous for wine and cheese"]
    });

    this.addWord({
      word: "BRAZIL",
      categoryId: countriesCategory.id,
      hints: ["Largest country in South America", "Famous for carnival", "Home of the Amazon rainforest"]
    });

    this.addWord({
      word: "JAPAN",
      categoryId: countriesCategory.id,
      hints: ["Island nation in Asia", "Land of the rising sun", "Known for sushi and anime"]
    });

    // Add words for Video Games category
    this.addWord({
      word: "MINECRAFT",
      categoryId: gamesCategory.id,
      hints: ["Block-building game", "Created by Notch", "Involves mining and crafting"]
    });

    this.addWord({
      word: "FORTNITE",
      categoryId: gamesCategory.id,
      hints: ["Battle royale game", "Building structures is key", "Features a shrinking storm"]
    });

    this.addWord({
      word: "TETRIS",
      categoryId: gamesCategory.id,
      hints: ["Falling block puzzle", "Created in Russia", "Line clearing game"]
    });

    // Add words for Animals category
    this.addWord({
      word: "ELEPHANT",
      categoryId: animalsCategory.id,
      hints: ["Largest land mammal", "Has a trunk", "Big ears and tusks"]
    });

    this.addWord({
      word: "GIRAFFE",
      categoryId: animalsCategory.id,
      hints: ["Tallest animal", "Long neck", "Spotted pattern"]
    });

    this.addWord({
      word: "PENGUIN",
      categoryId: animalsCategory.id,
      hints: ["Flightless bird", "Lives in Antarctica", "Black and white coloring"]
    });

    // Add words for Vehicles category
    this.addWord({
      word: "HELICOPTER",
      categoryId: vehiclesCategory.id,
      hints: ["Flying vehicle with rotors", "Vertical takeoff", "No fixed wings"]
    });

    this.addWord({
      word: "SUBMARINE",
      categoryId: vehiclesCategory.id,
      hints: ["Underwater vessel", "Used by navies", "Can dive deep below the surface"]
    });

    this.addWord({
      word: "MOTORCYCLE",
      categoryId: vehiclesCategory.id,
      hints: ["Two-wheeled vehicle", "Requires balance", "Rider straddles the seat"]
    });
  }
}

export const storage = new MemStorage();
