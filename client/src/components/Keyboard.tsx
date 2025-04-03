import { motion } from "framer-motion";
import { keyboardKeyVariants } from "@/lib/animations";
import { playSound } from "@/lib/sound";

interface KeyboardProps {
  layout: string[][];
  guessedLetters: string[];
  currentWord: string;
  onKeyPress: (letter: string) => void;
}

export default function Keyboard({ layout, guessedLetters, currentWord, onKeyPress }: KeyboardProps) {
  // Check if a letter is correct in the current word
  const isCorrectLetter = (letter: string) => {
    return currentWord.includes(letter) && guessedLetters.includes(letter);
  };
  
  // Check if a letter is incorrect
  const isIncorrectLetter = (letter: string) => {
    return !currentWord.includes(letter) && guessedLetters.includes(letter);
  };
  
  // Handle key press
  const handleKeyPress = (letter: string) => {
    // Allow letters to be chosen multiple times
    playSound('click');
    onKeyPress(letter);
  };
  
  return (
    <div className="keyboard-container mb-6">
      {layout.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex justify-center gap-1 mb-1">
          {row.map((letter, letterIndex) => {
            // Determine key state for styling
            const isCorrect = isCorrectLetter(letter);
            const isIncorrect = isIncorrectLetter(letter);
            const isGuessed = guessedLetters.includes(letter);
            
            let bgColor = "bg-white/20";
            if (isCorrect) bgColor = "bg-correct bg-emerald-500";
            if (isIncorrect) bgColor = "bg-incorrect bg-red-500";
            
            return (
              <motion.button
                key={`key-${letter}`}
                variants={keyboardKeyVariants}
                initial="initial"
                animate={isCorrect ? "correct" : isIncorrect ? "incorrect" : "animate"}
                whileHover="hover"
                whileTap="tap"
                custom={rowIndex * 10 + letterIndex}
                onClick={() => handleKeyPress(letter)}
                className={`keyboard-key w-9 h-12 rounded-lg ${bgColor} flex items-center justify-center font-semibold shadow-lg`}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
