import { motion } from "framer-motion";
import { useState } from "react";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    // Play sound trigger
    const audio = new Audio("/audio/song.mp3");
    audio.play().then(() => {
        audio.pause(); // Just to trigger the user interaction permission
    }).catch(() => {});
    
    setTimeout(onStart, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0520] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center px-6 w-full max-w-lg mx-auto"
      >
        <h1 className="font-cursive text-3xl sm:text-4xl text-primary mb-12 glow-pink">
          Nanna, I have a suprice for u... 💝
        </h1>

        <motion.div
          animate={isOpening ? { 
            scale: [1, 1.2, 0],
            rotate: [0, 10, -10, 0],
            opacity: [1, 1, 0]
          } : {
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: isOpening ? 1.5 : 3,
            repeat: isOpening ? 0 : Infinity,
            ease: "easeInOut"
          }}
          onClick={handleOpen}
          className="relative cursor-pointer group flex items-center justify-center mx-auto"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          
          <img 
            src="/gift.png" 
            alt="Gift Box" 
            className="w-64 sm:w-80 h-auto relative z-10 drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
          />
          
          {!isOpening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-12 left-0 right-0 text-white font-elegant italic text-xl"
            >
              Tap the gift to open ✨
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StartScreen;
