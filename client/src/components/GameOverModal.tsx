import { motion } from "framer-motion";
import { modalVariants, backdropVariants } from "@/lib/animations";
import { playSound } from "@/lib/sound";

interface GameOverModalProps {
  word: string;
  totalScore: number;
  wordsSolved: number;
  maxWords: number;
  onTryAgain: () => void;
  onCategorySelect: () => void;
}

export default function GameOverModal({ 
  word, 
  totalScore, 
  wordsSolved,
  maxWords,
  onTryAgain, 
  onCategorySelect 
}: GameOverModalProps) {
  
  const handleTryAgainClick = () => {
    playSound('click');
    onTryAgain();
  };
  
  const handleCategoriesClick = () => {
    playSound('click');
    onCategorySelect();
  };
  
  return (
    <motion.div
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-10/12 max-w-sm bg-gradient-to-br from-neutral to-neutral/70 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl"
      >
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4">
          <i className="fas fa-hourglass-end text-4xl text-neutral"></i>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
        <p className="text-center text-white/80 mb-2">The word was "{word}"</p>
        <p className="text-center text-white/60 text-sm mb-6">Don't worry, try again!</p>
        
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-xs text-white/70">TOTAL SCORE</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{wordsSolved}/{maxWords}</div>
            <div className="text-xs text-white/70">WORDS SOLVED</div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCategoriesClick}
            className="flex-1 bg-white/20 hover:bg-white/30 transition py-3 rounded-lg font-semibold"
          >
            Categories
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTryAgainClick}
            className="flex-1 bg-primary hover:bg-primary/90 transition py-3 rounded-lg font-semibold"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
