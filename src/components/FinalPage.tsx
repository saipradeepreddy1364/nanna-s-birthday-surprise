import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const FinalPage = () => {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; left: number; color: string; delay: number; size: number }>
  >([]);

  useEffect(() => {
    setConfetti(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ["#ee5282", "#d4a843", "#f5c6d0", "#ffd700", "#ff69b4", "#ff1493"][
          Math.floor(Math.random() * 6)
        ],
        delay: Math.random() * 4,
        size: 6 + Math.random() * 10,
      }))
    );
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-romantic)" }}
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 rounded-sm animate-confetti"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animationIterationCount: "infinite",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, stiffness: 80, delay: 0.3 }}
        className="text-8xl sm:text-9xl mb-8 animate-heartbeat"
      >
        🎉
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.2 }}
        className="font-cursive text-5xl sm:text-7xl md:text-8xl text-center px-4 glow-gold animate-text-glow"
        style={{ color: "hsl(38, 70%, 55%)" }}
      >
        Happy 21st Birthday
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="font-cursive text-4xl sm:text-6xl mt-4 text-primary glow-pink"
      >
        Nanna 💝
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="font-elegant text-xl sm:text-2xl mt-8 text-muted-foreground italic"
      >
        Wishing you all the love & happiness in the world ✨
      </motion.p>

      {/* Replay button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 1 }}
        onClick={() => window.location.reload()}
        className="mt-12 px-8 py-3 rounded-full font-elegant text-lg border transition-all duration-300 hover:scale-105"
        style={{
          borderColor: "hsl(342, 82%, 56%, 0.5)",
          color: "hsl(342, 82%, 56%)",
          background: "hsl(342, 82%, 56%, 0.1)",
        }}
      >
        Replay ✨
      </motion.button>
    </div>
  );
};

export default FinalPage;
