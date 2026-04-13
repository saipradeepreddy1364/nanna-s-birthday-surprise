import { useEffect, useState, useMemo } from "react";
import FallingPetals from "./FallingPetals";

interface OpeningPageProps {
  onComplete: () => void;
}

const OpeningPage = ({ onComplete }: OpeningPageProps) => {
  const [visible, setVisible] = useState(true);

  // Keep sparkle positions stable (no re-render jitter)
  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: 15 + Math.random() * 70,
        top: 15 + Math.random() * 70,
        delay: Math.random() * 3,
        size: 10 + Math.random() * 14,
      })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(340, 40%, 95%) 0%, hsl(340, 30%, 88%) 50%, hsl(342, 50%, 75%) 100%)",
      }}
    >
      {/* Falling petals */}
      <FallingPetals count={30} />

      {/* Sparkle particles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute animate-sparkle text-primary"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            fontSize: `${s.size}px`,
          }}
        >
          💕
        </div>
      ))}

      {/* Text */}
      <div className="relative z-20 text-center px-6">
        <h1
          className="font-cursive text-5xl sm:text-7xl md:text-8xl text-primary animate-heartbeat whitespace-nowrap"
          style={{
            fontSize: "clamp(1.8rem, 5.5vw, 5rem)",
            textShadow:
              "0 0 30px hsla(342, 82%, 56%, 0.4), 0 0 60px hsla(342, 82%, 56%, 0.2)",
          }}
        >
          Harshi's B'day Memories
        </h1>

        <p
          className="font-elegant text-xl italic mt-4"
          style={{ color: "black" }}
        >
          A journey through 21 beautiful years...
        </p>
      </div>
    </div>
  );
};

export default OpeningPage;