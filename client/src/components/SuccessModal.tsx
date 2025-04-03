import { useEffect } from "react";
import { motion } from "framer-motion";
import { generateConfetti, modalVariants, backdropVariants } from "@/lib/animations";
import { playSound } from "@/lib/sound";

interface SuccessModalProps {
  word: string;
  score: number;
  hintsUsed: number;
  onNext: () => void;
  onCategorySelect: () => void;
}

export default function SuccessModal({ word, score, hintsUsed, onNext, onCategorySelect }: SuccessModalProps) {
  // Generate confetti effect
  useEffect(() => {
    const container = document.querySelector('#confetti-container') as HTMLDivElement;
    if (!container) return;
    
    const particles = generateConfetti(30);
    
    particles.forEach(particle => {
      const element = document.createElement('div');
      element.className = 'confetti';
      element.style.left = `${particle.x}%`;
      element.style.top = `${particle.y}px`;
      element.style.width = `${particle.size}px`;
      element.style.height = `${particle.size}px`;
      element.style.backgroundColor = particle.color;
      element.style.transform = `rotate(${particle.rotation}deg)`;
      element.style.animation = `fall ${particle.duration}s linear forwards ${particle.delay}s`;
      
      container.appendChild(element);
      
      // Clean up after animation
      setTimeout(() => {
        element.remove();
      }, (particle.duration + particle.delay) * 1000 + 100);
    });
  }, []);
  
  const handleNextClick = () => {
    playSound('click');
    onNext();
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
      <div id="confetti-container" className="absolute inset-0 overflow-hidden pointer-events-none" />
      
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-10/12 max-w-sm bg-gradient-to-br from-primary to-[#7c3aed] rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl"
      >
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4">
          <i className="fas fa-check text-4xl text-green-500"></i>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Word Mastered!</h2>
        <p className="text-center text-white/80 mb-4">You correctly guessed "<span className="font-bold text-white">{word}</span>"!</p>
        <p className="text-center text-white/80 mb-3 text-sm">Your vocabulary is growing stronger!</p>
        
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs text-white/70">POINTS</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{hintsUsed}</div>
            <div className="text-xs text-white/70">HINTS USED</div>
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
            onClick={handleNextClick}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 transition py-3 rounded-lg font-semibold"
          >
            Next Word
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
