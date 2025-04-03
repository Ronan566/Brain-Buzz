import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { modalVariants, backdropVariants } from '@/lib/animations';
import { playSound } from '@/lib/sound';
import { useToast } from '@/hooks/use-toast';
import Fireworks from '@/components/Fireworks';

// Define levels for number sequences
const sequenceLevels = [
  {
    sequence: [2, 4, 6, 8],
    answer: 10,
    pattern: "Add 2",
    difficulty: 1
  },
  {
    sequence: [1, 3, 6, 10],
    answer: 15,
    pattern: "Add increasing numbers (1, 2, 3, 4, 5)",
    difficulty: 1
  },
  {
    sequence: [3, 6, 12, 24],
    answer: 48,
    pattern: "Multiply by 2",
    difficulty: 2
  },
  {
    sequence: [1, 4, 9, 16],
    answer: 25,
    pattern: "Square numbers (1², 2², 3², 4², 5²)",
    difficulty: 2
  },
  {
    sequence: [1, 1, 2, 3, 5],
    answer: 8,
    pattern: "Fibonacci sequence (each number is the sum of the two preceding ones)",
    difficulty: 3
  },
  {
    sequence: [2, 6, 12, 20, 30],
    answer: 42,
    pattern: "Difference increases by 2 each time (4, 6, 8, 10)",
    difficulty: 3
  },
  {
    sequence: [1, 3, 7, 15, 31],
    answer: 63,
    pattern: "Multiply by 2 and add 1",
    difficulty: 3
  },
  {
    sequence: [0, 1, 4, 9, 16, 25],
    answer: 36,
    pattern: "Square numbers (0², 1², 2², 3², 4², 5², 6²)",
    difficulty: 3
  },
  {
    sequence: [100, 90, 81, 73],
    answer: 66,
    pattern: "Subtract 10, then 9, then 8...",
    difficulty: 4
  },
  {
    sequence: [2, 3, 5, 8, 13],
    answer: 21,
    pattern: "Each number is the sum of the last two numbers",
    difficulty: 4
  },
];

interface GameState {
  currentLevel: number;
  score: number;
  lives: number;
  showHint: boolean;
  userAnswer: string;
  feedbackMessage: string | null;
  gameStatus: 'playing' | 'success' | 'failure';
}

export default function NumberSequence() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/number/:id');
  const [showFireworks, setShowFireworks] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0,
    score: 0,
    lives: 3,
    showHint: false,
    userAnswer: '',
    feedbackMessage: null,
    gameStatus: 'playing'
  });

  const categoryId = match ? parseInt(params.id) : null;

  const { data: category } = useQuery({
    queryKey: ['/api/categories', categoryId],
    enabled: !!categoryId
  });

  const { data: scores } = useQuery<{
    id: number;
    bestScore: number;
    wordsSolved: number;
    memorySetsCompleted: number; 
    numberSequencesSolved: number;
    categoryProgress: Record<string, any>;
  }>({
    queryKey: ['/api/scores'],
  });
  
  const { toast } = useToast();

  const updateScoreMutation = useMutation({
    mutationFn: async (score: number) => {
      return apiRequest('/api/scores', 'PATCH', { 
        numberSequencesSolved: (scores?.numberSequencesSolved || 0) + 1,
        bestScore: Math.max(scores?.bestScore || 0, score)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
    }
  });

  // Get current level data
  const currentSequence = sequenceLevels[gameState.currentLevel % sequenceLevels.length];

  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameState(prev => ({
      ...prev,
      userAnswer: e.target.value,
    }));
  };

  // Check answer
  const checkAnswer = () => {
    const userGuess = parseInt(gameState.userAnswer);
    
    if (isNaN(userGuess)) {
      setGameState(prev => ({
        ...prev,
        feedbackMessage: "Please enter a valid number"
      }));
      return;
    }
    
    if (userGuess === currentSequence.answer) {
      // Correct answer
      playSound('success');
      const pointsEarned = calculatePoints();
      
      // Show fireworks animation for correct answer
      setShowFireworks(true);
      setTimeout(() => {
        setShowFireworks(false);
      }, 2000);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + pointsEarned,
        feedbackMessage: `Correct! +${pointsEarned} points`,
        userAnswer: '',
        gameStatus: prev.currentLevel === sequenceLevels.length - 1 ? 'success' : 'playing',
        currentLevel: prev.currentLevel + 1,
        showHint: false
      }));

      if (gameState.currentLevel === sequenceLevels.length - 1) {
        // Game completed
        updateScoreMutation.mutate(gameState.score + pointsEarned);
      }
    } else {
      // Wrong answer
      playSound('incorrect');
      
      setGameState(prev => {
        const newLives = prev.lives - 1;
        return {
          ...prev,
          lives: newLives,
          feedbackMessage: "Incorrect answer, try again",
          gameStatus: newLives <= 0 ? 'failure' : 'playing'
        };
      });
      
      if (gameState.lives <= 1) {
        updateScoreMutation.mutate(gameState.score);
      }
    }
  };

  // Calculate points based on difficulty and hint usage
  const calculatePoints = () => {
    const basePoints = currentSequence.difficulty * 10;
    return gameState.showHint ? Math.floor(basePoints / 2) : basePoints;
  };

  // Show hint
  const toggleHint = () => {
    setGameState(prev => ({
      ...prev,
      showHint: !prev.showHint
    }));
    
    if (!gameState.showHint) {
      playSound('hint');
    }
  };

  // Go to next level
  const nextLevel = () => {
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      userAnswer: '',
      feedbackMessage: null,
      showHint: false,
      gameStatus: 'playing'
    }));
  };

  // Restart game
  const restartGame = () => {
    setGameState({
      currentLevel: 0,
      score: 0,
      lives: 3,
      showHint: false,
      userAnswer: '',
      feedbackMessage: null,
      gameStatus: 'playing'
    });
  };

  // Go back to category selection
  const goToCategories = () => {
    setLocation('/');
  };

  // Check if game is over (win or lose)
  const isGameOver = gameState.gameStatus === 'success' || gameState.gameStatus === 'failure';

  return (
    <div className="flex flex-col items-center min-h-screen bg-primary p-4 text-white relative">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={goToCategories} className="hover:bg-white/10">
          &larr; Categories
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xl">❤️</span>
            <span>{gameState.lives}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl">🏆</span>
            <span>{gameState.score}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Number Sequence Challenge</h1>
        <Badge className="mb-6" variant="outline">Level {gameState.currentLevel + 1}</Badge>
        
        <div className="mb-8">
          <h2 className="text-lg mb-4">Complete the sequence:</h2>
          <div className="flex items-center justify-center gap-4 text-2xl font-bold mb-6">
            {currentSequence.sequence.map((num, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-lg"
              >
                {num}
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-indigo-600 w-12 h-12 flex items-center justify-center rounded-lg"
            >
              ?
            </motion.div>
          </div>
          
          {/* Input Area */}
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={gameState.userAnswer}
              onChange={handleInputChange}
              placeholder="Enter next number"
              className="flex-1 p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isGameOver}
            />
            <Button 
              onClick={checkAnswer} 
              disabled={gameState.userAnswer === '' || isGameOver}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Check
            </Button>
          </div>
          
          {/* Hint Button */}
          <Button 
            variant="outline" 
            onClick={toggleHint} 
            className="w-full mb-4"
            disabled={isGameOver || gameState.showHint}
          >
            {gameState.showHint ? "Hint Revealed" : "Show Hint (Half Points)"}
          </Button>
          
          {/* Hint Display */}
          {gameState.showHint && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-indigo-900/50 p-3 rounded-lg mb-4"
            >
              <p>Pattern: {currentSequence.pattern}</p>
            </motion.div>
          )}
          
          {/* Feedback Message */}
          {gameState.feedbackMessage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded-lg mb-4 text-center ${
                gameState.feedbackMessage.includes("Correct") 
                  ? "bg-green-600/50" 
                  : "bg-red-600/50"
              }`}
            >
              <p>{gameState.feedbackMessage}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            onClick={(e) => e.stopPropagation()}
          />
          
          <motion.div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/10 backdrop-blur p-8 rounded-xl shadow-lg z-50"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              {gameState.gameStatus === 'success' ? "Congratulations! 🎉" : "Game Over! 😢"}
            </h2>
            
            <div className="text-center mb-6">
              <p className="text-xl mb-2">Final Score: {gameState.score}</p>
              <p>You completed {gameState.currentLevel} sequence{gameState.currentLevel !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={restartGame} className="bg-indigo-600 hover:bg-indigo-700">
                Play Again
              </Button>
              <Button variant="outline" onClick={goToCategories}>
                Return to Categories
              </Button>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Fireworks Animation */}
      <Fireworks isVisible={showFireworks} count={15} duration={2000} />
    </div>
  );
}