import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OpeningPageProps {
  onComplete: () => void;
}

const OpeningPage = ({ onComplete }: OpeningPageProps) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    setSparkles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }))
    );
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-romantic)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute w-2 h-2 rounded-full animate-sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            backgroundColor: "hsl(38, 70%, 55%)",
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      <div className="text-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100, duration: 1 }}
          className="text-7xl sm:text-8xl mb-6"
        >
          🎂
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
          className="font-cursive text-5xl sm:text-7xl md:text-8xl text-primary glow-pink mb-4"
        >
          Harshi's B'day
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
          className="font-cursive text-3xl sm:text-5xl text-secondary glow-gold"
        >
          Memories ✨
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="mt-10"
        >
          <div className="w-16 h-1 mx-auto rounded-full bg-primary/50 overflow-hidden">
            <motion.div
              className="h-full bg-secondary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 3, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OpeningPage;
