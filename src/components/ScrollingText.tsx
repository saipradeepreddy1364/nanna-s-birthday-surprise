import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MESSAGES = [
  "To the most amazing person I know...",
  "Every moment with you is a treasure 💕",
  "Your smile lights up the darkest days",
  "Your laughter is the sweetest melody 🎵",
  "You make the world a more beautiful place",
  "21 years of pure magic ✨",
  "Here's to endless adventures together",
  "You deserve all the happiness in the world 🌸",
  "May your dreams always come true",
  "Forever grateful for you 💝",
];

interface ScrollingTextProps {
  onComplete: () => void;
}

const ScrollingText = ({ onComplete }: ScrollingTextProps) => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < MESSAGES.length) {
      const timer = setTimeout(() => setVisibleLines((prev) => prev + 1), 2000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, onComplete]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-romantic)" }}
    >
      {/* Floating hearts background */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-float"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.15,
          }}
        >
          💕
        </div>
      ))}

      <div className="max-w-xl mx-auto px-8 space-y-6">
        {MESSAGES.map((msg, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            animate={
              i < visibleLines
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: i % 2 === 0 ? -50 : 50 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-elegant text-xl sm:text-2xl text-center italic"
            style={{
              color: i % 2 === 0 ? "hsl(340, 20%, 85%)" : "hsl(38, 60%, 70%)",
            }}
          >
            {msg}
          </motion.p>
        ))}
      </div>

      {/* Decorative line */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary/30"
        initial={{ width: 0 }}
        animate={{ width: `${(visibleLines / MESSAGES.length) * 60}vw` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export default ScrollingText;
