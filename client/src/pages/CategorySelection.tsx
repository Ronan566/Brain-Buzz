import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import CategoryCard from "@/components/CategoryCard";
import { preloadSounds } from "@/lib/sound";

export default function CategorySelection() {
  const [, setLocation] = useLocation();
  
  // Preload sounds when the component mounts
  useEffect(() => {
    preloadSounds();
  }, []);

  // Fetch categories
  const { data: categories = [], isLoading, error } = useQuery<any[]>({ 
    queryKey: ['/api/categories'],
  });

  // Fetch user score
  const { data: userScore = { bestScore: 0, wordsSolved: 0 } } = useQuery<any>({ 
    queryKey: ['/api/scores'],
  });

  // Handle category selection
  const handleCategorySelect = (category: any) => {
    // Route to different game types based on the category's gameType
    switch (category.gameType) {
      case "memory":
        setLocation(`/memory/${category.id}`);
        break;
      case "number":
        setLocation(`/number/${category.id}`);
        break;
      case "crossword":
        setLocation(`/crossword/${category.id}`);
        break;
      case "word":
      default:
        setLocation(`/game/${category.id}`);
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading categories...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col p-6 items-center justify-center">
        <div className="text-white text-xl font-semibold">Error loading categories</div>
        <p className="text-white/70 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 text-white">
      <header className="text-center mb-8 mt-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-2 tracking-wide"
        >
          Brain Buzz
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-white/90"
        >
          Challenge your brain and have fun!
        </motion.p>

      </header>
      
      <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto pb-20">
        {categories?.map((category: any, index: number) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onSelect={() => handleCategorySelect(category)}
          />
        ))}
      </div>
      

    </div>
  );
}
