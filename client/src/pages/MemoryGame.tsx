import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { queryClient } from '../lib/queryClient';
import { type MemoryGameState, type UserScore } from '@shared/schema';
import { playSound, preloadSounds } from '../lib/sound';
import { generateConfetti } from '../lib/animations';
import Fireworks from '@/components/Fireworks';

const initialGameState: MemoryGameState = {
  currentCategory: "",
  categoryId: 0,
  cards: [],
  difficulty: 1,
  moves: 0,
  pairs: 0,
  remainingPairs: 0,
  timeElapsed: 0,
  timeLimit: 60,
  score: 0,
  gameStatus: "idle"
};

export default function MemoryGame() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/memory/:id');
  const categoryId = params ? parseInt(params.id) : null;
  
  const [gameState, setGameState] = useState<MemoryGameState>(initialGameState);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showFireworks, setShowFireworks] = useState<boolean>(false);
  
  // Preload sounds
  useEffect(() => {
    preloadSounds();
  }, []);
  
  // Start the game when the component mounts
  const startGameMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await fetch('/api/memory/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryId, difficulty: 1 })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      
      return await response.json() as MemoryGameState;
    },
    onSuccess: (data) => {
      setGameState(data);
      setTimeLeft(data.timeLimit);
      startTimer(data.timeLimit);
      // Removed start sound
    },
    onError: (error) => {
      console.error('Failed to start memory game:', error);
    }
  });
  
  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async (score: { memorySetsCompleted: number }) => {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(score)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update score');
      }
      
      return await response.json() as UserScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
    }
  });
  
  // Get user score
  const { data: userScore } = useQuery<UserScore>({
    queryKey: ['/api/scores'],
    queryFn: async () => {
      const response = await fetch('/api/scores');
      
      if (!response.ok) {
        throw new Error('Failed to get user score');
      }
      
      return await response.json() as UserScore;
    }
  });
  
  // Init game
  useEffect(() => {
    if (categoryId) {
      // Reset game state first
      setGameState(initialGameState);
      setFlippedCards([]);
      setMatchedCards([]);
      setTimeLeft(60);
      
      // Short timeout to allow state reset before starting
      setTimeout(() => {
        startGameMutation.mutate(categoryId);
      }, 100);
    }
  }, [categoryId]);
  
  // Timer functions
  const startTimer = (seconds: number) => {
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };
  
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };
  
  // Handle time up
  const handleTimeUp = () => {
    stopTimer();
    setGameState(prev => ({ ...prev, gameStatus: "timeup" }));
    // Removed gameover sound
  };
  
  // Handle game completion
  const handleGameComplete = () => {
    stopTimer();
    setGameState(prev => ({ ...prev, gameStatus: "won" }));
    // Removed success sound
    generateConfetti(50);
    
    // Update best score if needed
    if (userScore) {
      const currentSets = userScore.memorySetsCompleted || 0;
      updateScoreMutation.mutate({ 
        memorySetsCompleted: currentSets + 1 
      });
    }
  };
  
  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (
      isChecking ||
      flippedCards.includes(cardId) ||
      matchedCards.includes(cardId) ||
      flippedCards.length >= 2 ||
      gameState.gameStatus !== "playing"
    ) {
      return;
    }
    
    // Removed flip sound
    
    // Update flipped cards
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    // Check for match if this is the second card
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      
      // Find the cards
      const firstCardId = newFlippedCards[0];
      const secondCardId = newFlippedCards[1];
      
      const firstCard = gameState.cards.find(card => card.id === firstCardId);
      const secondCard = gameState.cards.find(card => card.id === secondCardId);
      
      // Update move count
      setGameState(prev => ({
        ...prev,
        moves: prev.moves + 1
      }));
      
      setTimeout(() => {
        // Check if values match
        if (firstCard && secondCard && firstCard.value === secondCard.value) {
          // Match found
          // Removed match sound
          setMatchedCards(prev => [...prev, firstCardId, secondCardId]);
          
          // Show fireworks animation for correct match
          setShowFireworks(true);
          setTimeout(() => {
            setShowFireworks(false);
          }, 2000);
          
          // Update remaining pairs
          const newRemainingPairs = gameState.remainingPairs - 1;
          
          // Calculate score based on difficulty and speed
          const basePoints = 10 * gameState.difficulty;
          const timeBonus = Math.floor(timeLeft / 5);
          const newScore = gameState.score + basePoints + timeBonus;
          
          setGameState(prev => ({
            ...prev,
            remainingPairs: newRemainingPairs,
            score: newScore
          }));
          
          // Check if all pairs found
          if (newRemainingPairs <= 0) {
            handleGameComplete();
          }
        } else {
          // No match
          // Removed incorrect sound
        }
        
        setFlippedCards([]);
        setIsChecking(false);
      }, 800);
    }
  };
  
  // Restart game
  const restartGame = () => {
    if (categoryId) {
      setFlippedCards([]);
      setMatchedCards([]);
      setTimeLeft(60);
      startGameMutation.mutate(categoryId);
    }
  };
  
  // Go back to category selection
  const handleBack = () => {
    stopTimer();
    setLocation('/');
  };
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Loading state
  if (startGameMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-800 to-indigo-900">
        <div className="animate-pulse text-white text-2xl mb-4">Loading Memory Game...</div>
        <div className="w-16 h-16 border-t-4 border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Render functions
  const renderCard = (card: any, index: number) => {
    const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
    const isMatched = matchedCards.includes(card.id);
    
    return (
      <motion.div
        key={card.id}
        className={`memory-card-container ${isMatched ? 'matched' : ''}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          rotateY: isFlipped ? 180 : 0 
        }}
        transition={{ 
          delay: index * 0.05,
          duration: 0.3,
          type: 'spring',
          stiffness: 300
        }}
        onClick={() => handleCardClick(card.id)}
      >
        <div className={`memory-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="memory-card-back bg-blue-600 flex items-center justify-center rounded-xl shadow-lg text-white border-2 border-blue-300 cursor-pointer hover:border-yellow-300 transition-all">
            <span className="text-xl">❓</span>
          </div>
          <div className="memory-card-front bg-white flex items-center justify-center rounded-xl shadow-lg">
            <span className="text-4xl">{card.value}</span>
          </div>
        </div>
      </motion.div>
    );
  };
  
  const renderGameStatus = () => {
    switch (gameState.gameStatus) {
      case "playing":
        return null;
      case "won":
        return (
          <motion.div
            className="game-over-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="p-8 bg-white rounded-lg shadow-2xl max-w-md mx-auto text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-4">Great Job!</h2>
              <div className="py-4">
                <p className="text-lg mb-2">You completed the memory challenge!</p>
                <p className="text-2xl font-bold mb-4">Score: {gameState.score}</p>
                <div className="flex justify-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-blue-50 py-1 px-3">
                    Time: {formatTime(timeLeft)}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 py-1 px-3">
                    Moves: {gameState.moves}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-3 mt-4">
                <Button onClick={restartGame} className="w-full bg-green-500 hover:bg-green-600">
                  Play Again
                </Button>
                <Button onClick={handleBack} variant="outline" className="w-full">
                  Back to Categories
                </Button>
              </div>
            </div>
          </motion.div>
        );
      case "timeup":
        return (
          <motion.div
            className="game-over-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="p-8 bg-white rounded-lg shadow-2xl max-w-md mx-auto text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Time's Up!</h2>
              <div className="py-4">
                <p className="text-lg mb-2">You ran out of time!</p>
                <p className="text-2xl font-bold mb-4">Score: {gameState.score}</p>
                <div className="flex justify-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-red-50 py-1 px-3">
                    Pairs Found: {gameState.pairs - gameState.remainingPairs}
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 py-1 px-3">
                    Moves: {gameState.moves}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-3 mt-4">
                <Button onClick={restartGame} className="w-full bg-blue-500 hover:bg-blue-600">
                  Try Again
                </Button>
                <Button onClick={handleBack} variant="outline" className="w-full">
                  Back to Categories
                </Button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="memory-game-container flex flex-col items-center min-h-screen bg-gradient-to-b from-indigo-800 to-purple-900 py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
          <h1 className="text-2xl font-bold text-white">Memory Match</h1>
          <Badge className="text-white bg-indigo-700">{gameState.currentCategory}</Badge>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20"
            onClick={handleBack}
          >
            Exit
          </Button>
        </div>
      </div>
      
      {/* Game Stats */}
      <div className="w-full max-w-4xl mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex flex-col items-center">
            <span className="text-white/70 text-sm">Time</span>
            <span className="text-white text-xl font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex flex-col items-center">
            <span className="text-white/70 text-sm">Moves</span>
            <span className="text-white text-xl font-bold">{gameState.moves}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex flex-col items-center">
            <span className="text-white/70 text-sm">Score</span>
            <span className="text-white text-xl font-bold">{gameState.score}</span>
          </div>
        </div>
      </div>
      
      {/* Memory Cards Grid */}
      <div className="memory-cards-grid w-full max-w-4xl bg-indigo-900/30 backdrop-blur-sm rounded-xl p-4 mb-6">
        <div className={`grid gap-4 ${gameState.cards.length <= 12 
          ? 'grid-cols-3 md:grid-cols-4' 
          : 'grid-cols-4 md:grid-cols-5'}`}
        >
          {gameState.cards.map((card, index) => renderCard(card, index))}
        </div>
      </div>
      
      {/* Game Status Modals */}
      <AnimatePresence>
        {gameState.gameStatus !== "playing" && gameState.gameStatus !== "idle" && renderGameStatus()}
      </AnimatePresence>
      
      {/* Game Instructions */}
      <div className="w-full max-w-4xl mt-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
          <p className="text-white/80 text-sm text-center">
            Flip the cards to find matching pairs. Remember the positions to solve the puzzle quickly!
          </p>
        </div>
      </div>
      
      {/* Fireworks Animation */}
      <Fireworks isVisible={showFireworks} count={15} duration={2000} />
      
      {/* CSS for memory cards is added via regular CSS classes */}
    </div>
  );
}