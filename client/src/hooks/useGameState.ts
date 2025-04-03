import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { gameStateSchema } from "@shared/schema";
import type { UserScore } from "@shared/schema";
import { z } from "zod";
import { playSound } from "@/lib/sound";

export type GameStatus = "idle" | "playing" | "won" | "lost";

interface GameState {
  currentCategory: string;
  categoryId: number;
  words: {
    id: number;
    word: string;
    categoryId: number;
    hints: string[];
  }[];
  currentWordIndex: number;
  maxWords: number;
  guessedLetters: string[];
  incorrectGuesses: number;
  remainingHints: number;
  revealedHints: number;
  score: number;
  totalScore: number;
  wordsSolved: number;
  gameStatus: GameStatus;
}

export function useGameState(categoryId: number | null) {
  const queryClient = useQueryClient();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentCategory: "",
    categoryId: 0,
    words: [],
    currentWordIndex: 0,
    maxWords: 10,
    guessedLetters: [],
    incorrectGuesses: 0,
    remainingHints: 3,
    revealedHints: 0,
    score: 0,
    totalScore: 0,
    wordsSolved: 0,
    gameStatus: "idle",
  });

  // Get user score
  const { data: userScore } = useQuery<UserScore>({
    queryKey: ['/api/scores'],
    enabled: categoryId !== null,
  });

  // Start game mutation
  const startGameMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await apiRequest('POST', '/api/game/start', { 
        categoryId, 
        wordCount: 10
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGameState({
        ...data,
        guessedLetters: [],
        incorrectGuesses: 0,
        remainingHints: 3,
        revealedHints: 0,
        score: 0,
        gameStatus: "playing", // Set the game status to playing
      });
    },
  });

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async (scoreData: { bestScore?: number, wordsSolved?: number }) => {
      const response = await apiRequest('POST', '/api/scores', scoreData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
    },
  });

  // Init game
  useEffect(() => {
    if (categoryId) {
      startGameMutation.mutate(categoryId);
    }
  }, [categoryId, startGameMutation]);

  // Get current word
  const getCurrentWord = useCallback(() => {
    if (!gameState.words.length || gameState.currentWordIndex >= gameState.words.length) {
      return "";
    }
    return gameState.words[gameState.currentWordIndex].word;
  }, [gameState.words, gameState.currentWordIndex]);

  // Get current hints
  const getCurrentHints = useCallback(() => {
    if (!gameState.words.length || gameState.currentWordIndex >= gameState.words.length) {
      return [];
    }
    return gameState.words[gameState.currentWordIndex].hints;
  }, [gameState.words, gameState.currentWordIndex]);

  // Get current hint
  const getCurrentHint = useCallback(() => {
    const hints = getCurrentHints();
    return hints[gameState.revealedHints] || "";
  }, [getCurrentHints, gameState.revealedHints]);

  // Check if all letters are guessed
  const isWordComplete = useCallback(() => {
    const currentWord = getCurrentWord();
    if (!currentWord) return false;
    
    const uniqueLetters = Array.from(new Set(currentWord.split('')));
    return uniqueLetters.every(letter => gameState.guessedLetters.includes(letter));
  }, [getCurrentWord, gameState.guessedLetters]);

  // Functions that we need to define early to avoid circular dependencies
  const handleGameComplete = useCallback((status: "won" | "lost") => {
    if (status === "won") {
      playSound('success');
      
      const newWordsSolved = gameState.wordsSolved + 1;
      const newTotalScore = gameState.totalScore + gameState.score;
      
      setGameState(prev => ({
        ...prev,
        wordsSolved: newWordsSolved,
        totalScore: newTotalScore,
        gameStatus: "won",
      }));
      
      // Update best score if needed
      if (userScore && newTotalScore > userScore.bestScore) {
        updateScoreMutation.mutate({ 
          bestScore: newTotalScore,
          wordsSolved: userScore.wordsSolved + 1
        });
      } else if (userScore) {
        updateScoreMutation.mutate({ 
          wordsSolved: userScore.wordsSolved + 1
        });
      }
    } else {
      playSound('gameover');
      
      setGameState(prev => ({
        ...prev,
        gameStatus: "lost",
      }));
    }
  }, [gameState.wordsSolved, gameState.totalScore, gameState.score, userScore, updateScoreMutation]);
  
  // Make a guess
  const guessLetter = useCallback((letter: string) => {
    if (gameState.gameStatus !== "playing") return;
    
    const currentWord = getCurrentWord();
    if (!currentWord) return;
    
    // Check if letter already guessed
    if (gameState.guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...gameState.guessedLetters, letter];
    const isCorrect = currentWord.includes(letter);
    
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }
    
    const newIncorrectGuesses = isCorrect 
      ? gameState.incorrectGuesses 
      : gameState.incorrectGuesses + 1;
    
    // Calculate score for this guess
    const basePoints = 10;
    const hintPenalty = gameState.revealedHints * 5;
    const timePenalty = 0; // Could add time-based scoring later
    const guessScore = isCorrect ? basePoints - hintPenalty - timePenalty : 0;
    
    // Update game state first
    setGameState(prevState => {
      const updatedState = {
        ...prevState,
        guessedLetters: newGuessedLetters,
        incorrectGuesses: newIncorrectGuesses,
        score: prevState.score + guessScore,
      };
      return updatedState;
    });
    
    // Check for word complete and game over separately, after state update
    const uniqueLetters = Array.from(new Set(currentWord.split('')));
    const wordComplete = uniqueLetters.every(l => newGuessedLetters.includes(l));
    
    if (wordComplete) {
      // Small delay to ensure state update completes
      setTimeout(() => handleGameComplete("won"), 100);
    } else if (newIncorrectGuesses >= 6) {
      setTimeout(() => handleGameComplete("lost"), 100);
    }
  }, [gameState, getCurrentWord, handleGameComplete]);

  // Use a hint
  const useHint = useCallback(() => {
    if (gameState.remainingHints <= 0 || gameState.gameStatus !== "playing") return;
    
    const currentWord = getCurrentWord();
    if (!currentWord) return;
    
    // Find unguessed letters
    const unguessedLetters = currentWord
      .split('')
      .filter(letter => !gameState.guessedLetters.includes(letter));
    
    if (unguessedLetters.length === 0) return;
    
    // Select a random unguessed letter
    const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
    
    playSound('hint');
    
    const newGuessedLetters = [...gameState.guessedLetters, randomLetter];
    
    setGameState(prevState => {
      const newState = {
        ...prevState,
        guessedLetters: newGuessedLetters,
        remainingHints: prevState.remainingHints - 1,
        revealedHints: Math.min(prevState.revealedHints + 1, getCurrentHints().length - 1),
        score: Math.max(0, prevState.score - 5), // Penalty for using hint
      };
      return newState;
    });
    
    // Check if word is complete after hint
    const uniqueLetters = Array.from(new Set(currentWord.split('')));
    if (uniqueLetters.every(l => newGuessedLetters.includes(l))) {
      // Small delay to ensure state update completes
      setTimeout(() => handleGameComplete("won"), 100);
    }
  }, [gameState, getCurrentWord, getCurrentHints, handleGameComplete]);

  // Move to the next word
  const nextWord = useCallback(() => {
    const nextIndex = gameState.currentWordIndex + 1;
    
    if (nextIndex >= gameState.maxWords) {
      // Game complete
      return;
    }
    
    setGameState(prevState => ({
      ...prevState,
      currentWordIndex: nextIndex,
      guessedLetters: [],
      incorrectGuesses: 0,
      remainingHints: 3,
      revealedHints: 0,
      score: 0,
      gameStatus: "playing",
    }));
  }, [gameState.currentWordIndex, gameState.maxWords]);

  // Restart the game with same category
  const restartGame = useCallback(() => {
    if (categoryId) {
      startGameMutation.mutate(categoryId);
    }
  }, [categoryId, startGameMutation]);

  return {
    gameState,
    getCurrentWord,
    getCurrentHint,
    isWordComplete,
    guessLetter,
    useHint,
    nextWord,
    restartGame,
    loading: startGameMutation.isPending,
  };
}