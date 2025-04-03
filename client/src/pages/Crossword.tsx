import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { playSound } from '@/lib/sound';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { backdropVariants, modalVariants } from '@/lib/animations';
import type { CrosswordGameState } from '@shared/schema';

type ClueDirection = 'across' | 'down';

type ClueType = {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
  solved: boolean;
};

type CellType = {
  letter: string;
  isBlack: boolean;
  number?: number;
  filled: boolean;
  isRevealed: boolean;
  isCorrect?: boolean;
  row: number;
  col: number;
};

// Sample crossword data for our first puzzle
const sampleCrossword = {
  size: 10,
  grid: Array(10).fill(null).map((_, row) => (
    Array(10).fill(null).map((_, col) => ({
      letter: '',
      isBlack: false,
      number: undefined,
      filled: false,
      isRevealed: false,
      isCorrect: undefined,
      row,
      col,
    }))
  )),
  clues: {
    across: [
      { number: 1, clue: "Mental process", answer: "COGNITION", row: 0, col: 0, length: 9, solved: false },
      { number: 5, clue: "Type of memory", answer: "SHORT", row: 2, col: 0, length: 5, solved: false },
      { number: 7, clue: "Logical thinking", answer: "REASON", row: 4, col: 0, length: 6, solved: false },
      { number: 9, clue: "Problem resolution", answer: "SOLVE", row: 6, col: 4, length: 5, solved: false },
      { number: 11, clue: "Brain part", answer: "CORTEX", row: 8, col: 0, length: 6, solved: false }
    ],
    down: [
      { number: 1, clue: "Creative thinking", answer: "CREATE", row: 0, col: 0, length: 6, solved: false },
      { number: 2, clue: "Neuron connector", answer: "SYNAPSE", row: 0, col: 2, length: 7, solved: false },
      { number: 3, clue: "Memory storage", answer: "RECALL", row: 0, col: 4, length: 6, solved: false },
      { number: 4, clue: "Learning process", answer: "TRAIN", row: 0, col: 7, length: 5, solved: false },
      { number: 6, clue: "Mental acuity", answer: "SHARP", row: 2, col: 2, length: 5, solved: false },
      { number: 8, clue: "Complex thoughts", answer: "IDEAS", row: 4, col: 4, length: 5, solved: false },
      { number: 10, clue: "Focus attention", answer: "MIND", row: 6, col: 8, length: 4, solved: false }
    ]
  }
};

// Set up black cells in the grid
function setupGrid(crosswordData: any) {
  const { grid, clues } = crosswordData;
  
  // Mark all cells as black initially
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      grid[row][col].isBlack = true;
    }
  }
  
  // Mark cells for across clues as not black
  clues.across.forEach((clue: ClueType) => {
    for (let i = 0; i < clue.length; i++) {
      const col = clue.col + i;
      if (col < grid[clue.row].length) {
        grid[clue.row][col].isBlack = false;
      }
    }
  });
  
  // Mark cells for down clues as not black
  clues.down.forEach((clue: ClueType) => {
    for (let i = 0; i < clue.length; i++) {
      const row = clue.row + i;
      if (row < grid.length) {
        grid[row][clue.col].isBlack = false;
      }
    }
  });
  
  // Add numbers to cells
  const numbers = new Set();
  [...clues.across, ...clues.down].forEach((clue: ClueType) => {
    if (!numbers.has(clue.number)) {
      grid[clue.row][clue.col].number = clue.number;
      numbers.add(clue.number);
    }
  });
  
  return grid;
}

// Initial crossword game state
const initialGameState: CrosswordGameState = {
  currentCategory: '',
  categoryId: 0,
  grid: setupGrid(sampleCrossword),
  clues: sampleCrossword.clues,
  currentClue: { direction: 'across', number: 1 },
  score: 0,
  hints: 3,
  gameStatus: 'idle',
  timeElapsed: 0,
  timeLimit: 600,
  difficulty: 1,
};

export default function Crossword() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const categoryId = id ? parseInt(id) : null;
  const [gameState, setGameState] = useState<CrosswordGameState>(initialGameState);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [victory, setVictory] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  
  const { data: category } = useQuery<any>({
    queryKey: ['/api/categories', categoryId],
    enabled: !!categoryId
  });
  
  const { data: scores } = useQuery<{
    id: number;
    bestScore: number;
    wordsSolved: number;
    memorySetsCompleted: number;
    numberSequencesSolved: number;
    crosswordsCompleted: number;
    categoryProgress: Record<string, any>;
  }>({
    queryKey: ['/api/scores'],
  });
  
  const { toast } = useToast();
  
  const updateScoreMutation = useMutation({
    mutationFn: async (score: number) => {
      return apiRequest('/api/scores', 'PATCH', { 
        crosswordsCompleted: (scores?.crosswordsCompleted || 0) + 1,
        bestScore: Math.max(scores?.bestScore || 0, score)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
    }
  });
  
  // Initialize game state when category is loaded
  useEffect(() => {
    if (category) {
      setGameState(prev => ({
        ...prev,
        currentCategory: category.name,
        categoryId: category.id,
        gameStatus: 'playing'
      }));
      
      // Start the timer
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [category]);
  
  // Start the game timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeElapsed + 1;
        
        // Check for time limit
        if (newTime >= prev.timeLimit) {
          clearInterval(timerRef.current as number);
          return {
            ...prev,
            timeElapsed: prev.timeLimit,
            gameStatus: 'timeup'
          };
        }
        
        return {
          ...prev,
          timeElapsed: newTime
        };
      });
    }, 1000);
  };
  
  // Format time as minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState.grid[row][col].isBlack || gameState.gameStatus !== 'playing') {
      return;
    }
    
    setSelectedCell({ row, col });
    
    // Determine which clue this cell belongs to
    const cellClue = findClueForCell(row, col);
    if (cellClue) {
      setGameState(prev => ({
        ...prev,
        currentClue: cellClue
      }));
    }
  };
  
  // Find clue for a given cell position
  const findClueForCell = (row: number, col: number): {direction: ClueDirection, number: number} | null => {
    // Check if cell is part of an across clue
    const acrossClue = gameState.clues.across.find(clue => 
      clue.row === row && col >= clue.col && col < clue.col + clue.length
    );
    
    // Check if cell is part of a down clue
    const downClue = gameState.clues.down.find(clue => 
      clue.col === col && row >= clue.row && row < clue.row + clue.length
    );
    
    // If both, prefer the current direction, or across by default
    if (acrossClue && downClue) {
      if (gameState.currentClue.direction === 'down') {
        return { direction: 'down', number: downClue.number };
      } else {
        return { direction: 'across', number: acrossClue.number };
      }
    } else if (acrossClue) {
      return { direction: 'across', number: acrossClue.number };
    } else if (downClue) {
      return { direction: 'down', number: downClue.number };
    }
    
    return null;
  };
  
  // Get current clue text
  const getCurrentClue = () => {
    const { direction, number } = gameState.currentClue;
    const clue = gameState.clues[direction].find(c => c.number === number);
    return clue ? clue.clue : '';
  };
  
  // Handle keyboard input
  useEffect(() => {
    if (!selectedCell || gameState.gameStatus !== 'playing') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      
      const { row, col } = selectedCell;
      
      // Handle letter input (A-Z, a-z)
      if (/^[a-zA-Z]$/.test(e.key)) {
        const letter = e.key.toUpperCase();
        handleLetterInput(row, col, letter);
      }
      // Handle backspace
      else if (e.key === 'Backspace') {
        handleLetterInput(row, col, '');
      }
      // Handle arrows to navigate
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        handleArrowNavigation(e.key);
      }
      // Switch direction with Tab
      else if (e.key === 'Tab') {
        e.preventDefault();
        toggleDirection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, gameState.grid, gameState.currentClue]);
  
  // Handle letter input
  const handleLetterInput = (row: number, col: number, letter: string) => {
    setGameState(prev => {
      const newGrid = [...prev.grid];
      const cell = newGrid[row][col];
      
      // Update the cell
      newGrid[row][col] = {
        ...cell,
        letter,
        filled: letter !== '',
      };
      
      // Check clue completion
      const newClues = checkClueCompletion(newGrid, {...prev.clues});
      
      // Check for victory
      const allSolved = [...newClues.across, ...newClues.down].every(clue => clue.solved);
      if (allSolved) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Calculate final score
        const timeBonus = Math.max(0, prev.timeLimit - prev.timeElapsed);
        const finalScore = 1000 + timeBonus - (3 - prev.hints) * 50;
        
        setTimeout(() => {
          setVictory(true);
          playSound('success');
          updateScoreMutation.mutate(finalScore);
        }, 300);
        
        return {
          ...prev,
          grid: newGrid,
          clues: newClues,
          gameStatus: 'won',
          score: finalScore
        };
      }
      
      // Move to next cell based on direction
      moveToNextCell();
      
      return {
        ...prev,
        grid: newGrid,
        clues: newClues
      };
    });
  };
  
  // Move to the next cell based on current direction
  const moveToNextCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const { direction } = gameState.currentClue;
    
    if (direction === 'across') {
      // Try to move right
      if (col + 1 < gameState.grid[0].length && !gameState.grid[row][col + 1].isBlack) {
        setSelectedCell({ row, col: col + 1 });
      }
    } else {
      // Try to move down
      if (row + 1 < gameState.grid.length && !gameState.grid[row + 1][col].isBlack) {
        setSelectedCell({ row: row + 1, col });
      }
    }
  };
  
  // Handle arrow key navigation
  const handleArrowNavigation = (key: string) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;
    
    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(gameState.grid.length - 1, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(gameState.grid[0].length - 1, col + 1);
        break;
    }
    
    if (!gameState.grid[newRow][newCol].isBlack) {
      setSelectedCell({ row: newRow, col: newCol });
    }
  };
  
  // Toggle between across and down
  const toggleDirection = () => {
    setGameState(prev => ({
      ...prev,
      currentClue: {
        ...prev.currentClue,
        direction: prev.currentClue.direction === 'across' ? 'down' : 'across'
      }
    }));
  };
  
  // Check if clues are completed
  const checkClueCompletion = (grid: CellType[][], clues: {across: ClueType[], down: ClueType[]}) => {
    // Check across clues
    clues.across.forEach(clue => {
      let word = '';
      for (let i = 0; i < clue.length; i++) {
        const col = clue.col + i;
        if (col < grid[clue.row].length) {
          word += grid[clue.row][col].letter;
        }
      }
      clue.solved = word === clue.answer;
    });
    
    // Check down clues
    clues.down.forEach(clue => {
      let word = '';
      for (let i = 0; i < clue.length; i++) {
        const row = clue.row + i;
        if (row < grid.length) {
          word += grid[row][clue.col].letter;
        }
      }
      clue.solved = word === clue.answer;
    });
    
    return clues;
  };
  
  // Use hint to reveal a random letter
  const useHint = () => {
    if (gameState.hints <= 0 || !selectedCell || gameState.gameStatus !== 'playing') {
      return;
    }
    
    const { row, col } = selectedCell;
    const { direction, number } = gameState.currentClue;
    const clue = gameState.clues[direction].find(c => c.number === number);
    
    if (!clue) return;
    
    // Find the correct letter for this cell
    let correctLetter = '';
    
    if (direction === 'across') {
      const cellIndex = col - clue.col;
      if (cellIndex >= 0 && cellIndex < clue.answer.length) {
        correctLetter = clue.answer[cellIndex];
      }
    } else {
      const cellIndex = row - clue.row;
      if (cellIndex >= 0 && cellIndex < clue.answer.length) {
        correctLetter = clue.answer[cellIndex];
      }
    }
    
    if (correctLetter) {
      playSound('hint');
      
      setGameState(prev => {
        const newGrid = [...prev.grid];
        newGrid[row][col] = {
          ...newGrid[row][col],
          letter: correctLetter,
          filled: true,
          isRevealed: true
        };
        
        // Check clue completion after hint
        const newClues = checkClueCompletion(newGrid, {...prev.clues});
        
        return {
          ...prev,
          grid: newGrid,
          clues: newClues,
          hints: prev.hints - 1
        };
      });
      
      // Move to next cell
      moveToNextCell();
    }
  };
  
  // Restart the game
  const restartGame = () => {
    // Reset the grid
    const freshGrid = setupGrid(sampleCrossword);
    
    // Reset the clues
    const freshClues = JSON.parse(JSON.stringify(sampleCrossword.clues));
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameState({
      ...initialGameState,
      currentCategory: category?.name || '',
      categoryId: category?.id || 0,
      grid: freshGrid,
      clues: freshClues,
      gameStatus: 'playing'
    });
    
    setSelectedCell(null);
    setVictory(false);
    startTimer();
  };
  
  // Go back to category selection
  const goToCategories = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setLocation('/');
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-primary p-4 text-white relative">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={goToCategories} className="hover:bg-white/10">
          &larr; Categories
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xl">🎯</span>
            <span>{gameState.score}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl">💡</span>
            <span>{gameState.hints}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl">⏱️</span>
            <span>{formatTime(gameState.timeElapsed)}</span>
          </div>
        </div>
      </header>
      
      <h1 className="text-2xl font-bold mb-2 text-center">Crossword Challenge</h1>
      <h2 className="text-xl opacity-80 mb-4 text-center">{category?.name}</h2>
      
      {/* Current Clue */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline">
            {gameState.currentClue.number} {gameState.currentClue.direction}
          </Badge>
          <Button variant="ghost" size="sm" onClick={toggleDirection} className="h-6 px-2 text-xs">
            Switch
          </Button>
        </div>
        <p className="text-md">{getCurrentClue()}</p>
      </div>
      
      {/* Crossword Grid */}
      <div 
        ref={gridRef}
        className="grid grid-cols-10 gap-0.5 mb-6 mx-auto"
        style={{ maxWidth: '90vw' }}
      >
        {gameState.grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`relative w-8 h-8 flex items-center justify-center text-sm font-bold
                ${cell.isBlack ? 'bg-black' : 'bg-white/10 cursor-pointer'} 
                ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'bg-blue-500/50' : ''}
                ${gameState.currentClue.direction === 'across' && selectedCell?.row === rowIndex && 
                  findClueForCell(rowIndex, colIndex)?.number === gameState.currentClue.number ? 
                  'bg-blue-500/20' : ''}
                ${gameState.currentClue.direction === 'down' && selectedCell?.col === colIndex && 
                  findClueForCell(rowIndex, colIndex)?.number === gameState.currentClue.number ? 
                  'bg-blue-500/20' : ''}
                ${cell.isRevealed ? 'text-yellow-400' : 'text-white'}
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell.isBlack ? null : (
                <>
                  {cell.number && (
                    <span className="absolute top-0 left-0.5 text-[8px] text-gray-300">{cell.number}</span>
                  )}
                  {cell.letter}
                </>
              )}
            </div>
          ))
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex gap-2 w-full max-w-md justify-center mb-4">
        <Button
          variant="outline"
          onClick={useHint}
          disabled={gameState.hints <= 0 || gameState.gameStatus !== 'playing'}
          className="flex-1"
        >
          Use Hint ({gameState.hints})
        </Button>
        <Button
          variant="outline"
          onClick={restartGame}
          className="flex-1"
        >
          Restart
        </Button>
      </div>
      
      {/* Clue Lists */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-2">
        <div>
          <h3 className="text-lg font-semibold mb-2">Across</h3>
          <div className="text-sm space-y-2">
            {gameState.clues.across.map(clue => (
              <div 
                key={`across-${clue.number}`}
                className={`p-2 rounded ${clue.solved ? 'bg-green-800/40' : 'bg-white/5'} ${
                  gameState.currentClue.direction === 'across' && 
                  gameState.currentClue.number === clue.number ? 'border border-blue-500' : ''
                }`}
                onClick={() => {
                  setGameState(prev => ({
                    ...prev,
                    currentClue: { direction: 'across', number: clue.number }
                  }));
                  setSelectedCell({ row: clue.row, col: clue.col });
                }}
              >
                <span className="font-bold">{clue.number}.</span> {clue.clue}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Down</h3>
          <div className="text-sm space-y-2">
            {gameState.clues.down.map(clue => (
              <div 
                key={`down-${clue.number}`}
                className={`p-2 rounded ${clue.solved ? 'bg-green-800/40' : 'bg-white/5'} ${
                  gameState.currentClue.direction === 'down' && 
                  gameState.currentClue.number === clue.number ? 'border border-blue-500' : ''
                }`}
                onClick={() => {
                  setGameState(prev => ({
                    ...prev,
                    currentClue: { direction: 'down', number: clue.number }
                  }));
                  setSelectedCell({ row: clue.row, col: clue.col });
                }}
              >
                <span className="font-bold">{clue.number}.</span> {clue.clue}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Victory Modal */}
      {gameState.gameStatus === 'won' && (
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
            <h2 className="text-2xl font-bold mb-4 text-center">Crossword Completed! 🎉</h2>
            
            <div className="text-center mb-6">
              <p className="text-xl mb-2">Final Score: {gameState.score}</p>
              <p>Time: {formatTime(gameState.timeElapsed)}</p>
              <p>Hints Used: {3 - gameState.hints}</p>
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
      
      {/* Time's Up Modal */}
      {gameState.gameStatus === 'timeup' && (
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
            <h2 className="text-2xl font-bold mb-4 text-center">Time's Up! ⏱️</h2>
            
            <div className="text-center mb-6">
              <p>You ran out of time before completing the crossword.</p>
              <p className="mt-2">Don't worry, you can try again!</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={restartGame} className="bg-indigo-600 hover:bg-indigo-700">
                Try Again
              </Button>
              <Button variant="outline" onClick={goToCategories}>
                Return to Categories
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}