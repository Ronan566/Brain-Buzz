import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/lib/sound';

interface FireworksProps {
  isVisible: boolean;
  count?: number;
  duration?: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

function createFireworks(count: number): Firework[] {
  const colors = ['#FF5555', '#5FAAE5', '#9CE855', '#E86DE2', '#E8E55E', '#FF9955'];
  return Array.from({ length: count }).map((_, index) => ({
    id: index,
    x: Math.random() * 100, // Random x position (percentage)
    y: 30 + Math.random() * 40, // Random y position between 30-70% from top
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 0.5 + Math.random() * 1.5, // Random size between 0.5-2
  }));
}

export default function Fireworks({ isVisible, count = 15, duration = 2000 }: FireworksProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Create new fireworks when the component becomes visible
      setFireworks(createFireworks(count));
      
      // Play firework sound
      playSound('correct');
      
      // Clean up fireworks after animation completes
      const timer = setTimeout(() => {
        setFireworks([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, count, duration]);
  
  // Particles for each firework
  const renderParticles = (firework: Firework) => {
    const particleCount = 12; // Number of particles per firework
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i * (360 / particleCount)) * (Math.PI / 180);
      const distance = 40 + Math.random() * 20;
      
      return (
        <motion.div
          key={`particle-${firework.id}-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: firework.color,
            originX: '50%',
            originY: '50%',
          }}
          initial={{ 
            x: 0, 
            y: 0,
            opacity: 1,
            scale: firework.size
          }}
          animate={{ 
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
        />
      );
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {fireworks.map((firework) => (
            <motion.div
              key={firework.id}
              className="absolute"
              style={{ 
                left: `${firework.x}%`, 
                top: `${firework.y}%`,
                width: '4px',
                height: '4px',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 1.2, 0.8],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 0.5,
                times: [0, 0.3, 0.5, 1],
                delay: Math.random() * 0.5,
              }}
            >
              {renderParticles(firework)}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}