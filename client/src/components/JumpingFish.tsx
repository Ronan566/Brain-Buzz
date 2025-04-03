import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createJumpingFish, JumpingFish as JumpingFishType } from '@/lib/animations';
import { playSound } from '@/lib/sound';

interface JumpingFishProps {
  isVisible: boolean;
  count?: number;
}

export default function JumpingFish({ isVisible, count = 5 }: JumpingFishProps) {
  const [fish, setFish] = useState<JumpingFishType[]>([]);
  
  useEffect(() => {
    if (isVisible) {
      // Create new fish when the component becomes visible
      setFish(createJumpingFish(count));
      
      // Play the water splash sound
      playSound('splash');
      // Also play the success sound for extra effect
      setTimeout(() => playSound('correct'), 200);
      
      // Clean up fish after they complete their animation
      const timer = setTimeout(() => {
        setFish([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, count]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {fish.map((f) => (
            <motion.div
              key={f.id}
              className="absolute text-4xl"
              initial={{ 
                bottom: "-50px", 
                left: `${f.x}%`, 
                scale: f.scale,
                rotate: -15
              }}
              animate={{ 
                bottom: ["0%", "40%", "30%", "45%", "35%", "0%"],
                rotate: [-15, 10, -5, 15, -10, -15],
                x: [0, -20, 20, -10, 0]
              }}
              exit={{ 
                bottom: "-50px" 
              }}
              transition={{
                duration: f.duration,
                delay: f.delay,
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                ease: "easeInOut"
              }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}