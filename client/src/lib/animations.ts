import { Variants } from "framer-motion";

// Category card animations
export const categoryCardVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: (index: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: index * 0.1,
      duration: 0.4,
      ease: "easeOut" 
    }
  }),
  hover: { 
    scale: 1.05,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95 
  }
};

// Letter tile animations
export const letterTileVariants: Variants = {
  initial: { 
    scale: 0.8,
    opacity: 0
  },
  animate: (index: number) => ({ 
    scale: 1,
    opacity: 1,
    transition: { 
      delay: index * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  correct: { 
    rotateX: [0, 90, 0],
    backgroundColor: "#10B981",
    transition: { 
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  hint: {
    rotateX: [0, 90, 0],
    backgroundColor: "#F59E0B",
    scale: [1, 1.1, 1],
    transition: { 
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Keyboard animations
export const keyboardKeyVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: (index: number) => ({ 
    opacity: 1,
    y: 0,
    transition: { 
      delay: 0.2 + (index * 0.01),
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  correct: { 
    backgroundColor: "#10B981",
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  },
  incorrect: { 
    backgroundColor: "#EF4444",
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  },
  hover: { 
    scale: 1.1,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.9 
  }
};

// Modal animations
export const modalVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    transition: { 
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Backdrop animations
export const backdropVariants: Variants = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.3 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      delay: 0.1,
      duration: 0.2 
    }
  }
};

// Generate confetti particles
export function generateConfetti(count: number) {
  const particles = [];
  const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF'];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100,
      y: -20 - (Math.random() * 10),
      size: 5 + (Math.random() * 10),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      duration: 1 + (Math.random() * 2),
      delay: Math.random() * 0.5,
    });
  }
  
  return particles;
}
