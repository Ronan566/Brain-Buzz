import { motion } from "framer-motion";
import { categoryCardVariants } from "@/lib/animations";
import { playSound } from "@/lib/sound";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
    wordCount: number;
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
        <p className="text-xs text-white/70 mt-1">{category.wordCount} words</p>
      </div>
    </motion.div>
  );
}
