import { useEffect } from 'react';
import { motion } from "framer-motion";
import { letterTileVariants } from "@/lib/animations";

interface LetterTileProps {
  letter: string;
  revealed: boolean;
  index: number;
  difficultyClass?: number;
}

export default function LetterTile({ letter, revealed, index, difficultyClass = 0 }: LetterTileProps) {
  // Determine size based on word length difficulty
  const sizeClass = difficultyClass === 0
    ? "w-12 h-14 lg:w-14 lg:h-16 text-xl" 
    : difficultyClass === 1
      ? "w-10 h-12 lg:w-12 lg:h-14 text-lg"
      : "w-8 h-10 lg:w-10 lg:h-12 text-base";
  
  return (
    <motion.div
      variants={letterTileVariants}
      initial="initial"
      animate={revealed ? "correct" : "animate"}
      custom={index}
      className={`letter-tile ${sizeClass} rounded-lg flex items-center justify-center bg-white/10 font-bold uppercase`}
    >
      {revealed && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {letter}
        </motion.span>
      )}
    </motion.div>
  );
}
