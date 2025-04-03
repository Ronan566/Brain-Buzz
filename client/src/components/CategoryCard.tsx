import { motion } from "framer-motion";
import { categoryCardVariants } from "@/lib/animations";
import { playSound } from "@/lib/sound";

// Helper functions for game type display
function getGameTypeColor(gameType: string): string {
  switch (gameType) {
    case "word":
      return "#4F46E5";  // Indigo
    case "memory":
      return "#F59E0B";  // Amber
    case "puzzle":
      return "#10B981";  // Emerald
    case "wordsearch":
      return "#EF4444";  // Red
    case "number":
      return "#6366F1";  // Indigo
    case "crossword":
      return "#F59E0B";  // Amber
    default:
      return "#6B7280";  // Gray
  }
}

function getGameTypeLabel(gameType: string): string {
  switch (gameType) {
    case "word":
      return "Word Game";
    case "memory":
      return "Memory";
    case "puzzle":
      return "Puzzle";
    case "wordsearch":
      return "Word Search";
    case "number":
      return "Number";
    case "crossword":
      return "Crossword";
    default:
      return gameType;
  }
}

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
    wordCount: number;
    gameType?: string;
  };
  index: number;
  onSelect: () => void;
}

export default function CategoryCard({ category, index, onSelect }: CategoryCardProps) {
  const handleSelect = () => {
    playSound('click');
    onSelect();
  };
  
  return (
    <motion.div
      variants={categoryCardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={handleSelect}
      className="category-card"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 h-full flex flex-col items-center justify-center hover:bg-white/20 transition-all cursor-pointer border-2 border-white/20">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4" 
          style={{ backgroundColor: category.color }}
        >
          <i className={`fas ${category.icon} text-2xl`}></i>
        </div>
        <h3 className="font-semibold text-lg">{category.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-white/70">{category.wordCount} words</p>
          {category.gameType && (
            <span 
              className="text-xs px-2 py-0.5 rounded-full" 
              style={{ 
                backgroundColor: getGameTypeColor(category.gameType),
                color: 'white'
              }}
            >
              {getGameTypeLabel(category.gameType)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
