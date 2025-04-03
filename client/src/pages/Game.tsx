import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { useGameState } from "@/hooks/useGameState";
import LetterTile from "@/components/LetterTile";
import Keyboard from "@/components/Keyboard";
import SuccessModal from "@/components/SuccessModal";
import GameOverModal from "@/components/GameOverModal";
import HintModal from "@/components/HintModal";
import ThemeInfo from "@/components/ThemeInfo";
import { playSound } from "@/lib/sound";

export default function Game() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute<{ categoryId: string }>('/game/:categoryId');
  const categoryId = matched ? parseInt(params.categoryId) : null;
  
  const [showHintModal, setShowHintModal] = useState(false);
  
  // Initialize game state
  const {
    gameState,
    getCurrentWord,
    getCurrentHint,
    guessLetter,
    useHint,
    nextWord,
    restartGame,
    loading
  } = useGameState(categoryId);
  
  // Get the current word
  const currentWord = getCurrentWord();
  
  // Handle back button
  const handleBack = () => {
    playSound('click');
    navigate('/');
  };
  
  // Handle hint button click
  const handleHintClick = () => {
    playSound('click');
    setShowHintModal(true);
  };
  
  // Handle hint confirmation
  const handleConfirmHint = () => {
    setShowHintModal(false);
    useHint();
  };
  
  // Create a keyboard layout for rendering
  const keyboardLayout = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split('')
  ];
  
  // Calculate difficulty class for animations based on word length
  const difficultyClass = () => {
    if (!currentWord) return 0;
    if (currentWord.length <= 5) return 0;
    if (currentWord.length <= 8) return 1;
    return 2;
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col p-6 items-center justify-center">
        <div className="text-white text-xl font-semibold">Starting game...</div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col p-6 text-white">
      <header className="flex justify-between items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
        >
          <i className="fas fa-arrow-left"></i>
        </motion.button>
        
        <div className="flex flex-col items-center">
          <h2 className="font-semibold text-lg">{gameState.currentCategory}</h2>
          <div className="flex items-center gap-1 text-sm text-white/70">
            <span>Word</span>
            <span className="font-bold text-white">{gameState.currentWordIndex + 1}</span>
            <span>/{gameState.maxWords}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-1">
            <i className="fas fa-star text-amber-400"></i>
            <span className="font-bold">{gameState.totalScore + gameState.score}</span>
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        {/* Word Display Area */}
        <div className="mb-10 relative">
          <div className="flex gap-2 justify-center mb-6">
            {currentWord.split('').map((letter, index) => (
              <LetterTile
                key={`${gameState.currentWordIndex}-${index}`}
                letter={letter}
                revealed={gameState.guessedLetters.includes(letter)}
                index={index}
                difficultyClass={difficultyClass()}
              />
            ))}
          </div>
          
          {/* Hint Section */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-block bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 max-w-[80%]"
            >
              <div className="flex items-center justify-between mb-1">
                <ThemeInfo word={currentWord} />
                <div className="text-xs text-white/50">
                  {currentWord.length} letters
                </div>
              </div>
              <p className="text-sm text-white/90">
                <span className="font-semibold">Hint:</span> 
                <span className="ml-1">{getCurrentHint()}</span>
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Hints and Status */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHintClick}
            disabled={gameState.remainingHints === 0 || gameState.gameStatus !== "playing"}
            className={`w-12 h-12 rounded-full ${
              gameState.remainingHints > 0 && gameState.gameStatus === "playing"
                ? "bg-amber-500 animate-pulse cursor-pointer"
                : "bg-gray-500 cursor-not-allowed"
            } flex items-center justify-center`}
          >
            <i className="fas fa-lightbulb"></i>
          </motion.button>
          
          <div className="flex">
            {Array(gameState.remainingHints).fill(0).map((_, i) => (
              <div key={`hint-active-${i}`} className="w-4 h-4 rounded-full bg-white/70 mx-1"></div>
            ))}
            {Array(3 - gameState.remainingHints).fill(0).map((_, i) => (
              <div key={`hint-used-${i}`} className="w-4 h-4 rounded-full bg-white/20 mx-1"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Keyboard Section */}
      <Keyboard
        layout={keyboardLayout}
        guessedLetters={gameState.guessedLetters}
        currentWord={currentWord}
        onKeyPress={guessLetter}
      />
      
      {/* Modals */}
      <AnimatePresence>
        {gameState.gameStatus === "won" && (
          <SuccessModal
            word={currentWord}
            score={gameState.score}
            hintsUsed={3 - gameState.remainingHints}
            onNext={nextWord}
            onCategorySelect={handleBack}
          />
        )}
        
        {gameState.gameStatus === "lost" && (
          <GameOverModal
            word={currentWord}
            totalScore={gameState.totalScore}
            wordsSolved={gameState.wordsSolved}
            maxWords={gameState.maxWords}
            onTryAgain={restartGame}
            onCategorySelect={handleBack}
          />
        )}
        
        {showHintModal && (
          <HintModal
            remainingHints={gameState.remainingHints}
            onCancel={() => setShowHintModal(false)}
            onConfirm={handleConfirmHint}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
