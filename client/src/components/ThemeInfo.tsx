import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeInfoProps {
  word: string;
}

// Function to determine the likely theme of a word
function determineTheme(word: string | null): string {
  if (!word) return 'Word';
  // List of theme words for each category
  const themes = {
    animals: ['DOLPHIN', 'ELEPHANT', 'GIRAFFE', 'PENGUIN'],
    countries: ['BRAZIL', 'JAPAN', 'EGYPT', 'CANADA'],
    foods: ['CHOCOLATE', 'PIZZA'],
    space: ['GALAXY', 'METEOR'],
    technology: ['COMPUTER', 'INTERNET'],
    general: ['PUZZLE', 'RIDDLE', 'CRYPTIC', 'ENIGMA']
  };

  // Check which theme the word belongs to
  for (const [theme, words] of Object.entries(themes)) {
    if (words.includes(word)) {
      return theme.charAt(0).toUpperCase() + theme.slice(1);
    }
  }

  return 'Word';
}

export default function ThemeInfo({ word }: ThemeInfoProps) {
  const [showInfo, setShowInfo] = useState(false);
  const theme = determineTheme(word);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowInfo(!showInfo)}
        className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70 flex items-center gap-1"
      >
        <span>{theme}</span>
        <i className="fas fa-info-circle"></i>
      </motion.button>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-3 bg-black/80 backdrop-blur-sm rounded-lg w-48 z-10 text-xs"
          >
            <p className="font-semibold mb-1">Theme: {theme}</p>
            <p className="text-white/70">
              This word belongs to the {theme.toLowerCase()} category. 
              Try to think about common characteristics in this theme.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}