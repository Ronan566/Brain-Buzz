import { motion } from "framer-motion";
import { modalVariants, backdropVariants } from "@/lib/animations";
import { playSound } from "@/lib/sound";

interface HintModalProps {
  remainingHints: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function HintModal({ remainingHints, onCancel, onConfirm }: HintModalProps) {
  
  const handleCancelClick = () => {
    playSound('click');
    onCancel();
  };
  
  const handleConfirmClick = () => {
    playSound('click');
    onConfirm();
  };
  
  return (
    <motion.div
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-10/12 max-w-sm bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl"
      >
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
          <i className="fas fa-lightbulb text-2xl text-amber-500"></i>
        </div>
        
        <h2 className="text-xl font-bold mb-4">Use a Hint?</h2>
        
        <div className="bg-white/10 rounded-lg p-4 w-full mb-6">
          <p className="text-center font-medium">
            This will reveal one letter and reduce your potential score
            {remainingHints === 1 && <span className="block mt-2 text-white font-bold">This is your last hint!</span>}
          </p>
        </div>
        
        <div className="flex gap-3 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelClick}
            className="flex-1 bg-white/20 hover:bg-white/30 transition py-3 rounded-lg font-semibold"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirmClick}
            className="flex-1 bg-white text-amber-600 hover:bg-white/90 transition py-3 rounded-lg font-semibold"
          >
            Use Hint
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
