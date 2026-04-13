import { useEffect, useState, useMemo } from "react";

interface OpeningPageProps {
  onComplete: () => void;
}

const OpeningPage = ({ onComplete }: OpeningPageProps) => {
  const [visible, setVisible] = useState(true);

  const petals = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 8,
        size: 10 + Math.random() * 16,
        opacity: 0.3 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 60,
      })),
    []
  );

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
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes op-petal-fall {
          0%   { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.7; }
          100% { transform: translateY(110vh) translateX(var(--op-drift)) rotate(540deg); opacity: 0; }
        }
        @keyframes op-sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50%      { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Falling petals */}
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.left}%`,
            animationName: "op-petal-fall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
            ["--op-drift" as string]: `${p.drift}px`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="none"
            style={{ opacity: p.opacity }}
          >
            <ellipse
              cx="12"
              cy="10"
              rx="8"
              ry="10"
              fill="hsl(342, 82%, 56%)"
              opacity="0.7"
              transform="rotate(15 12 10)"
            />
          </svg>
        </div>
      ))}

      {/* Sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute text-primary"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            animationName: "op-sparkle",
            animationDuration: "2s",
            animationDelay: `${s.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            zIndex: 2,
          }}
        >
          💕
        </div>
      ))}

      {/* Text */}
      <div className="relative z-20 text-center px-6">
        <h1
          className="font-cursive text-primary animate-heartbeat whitespace-nowrap"
          style={{
            fontSize: "clamp(1.8rem, 5.5vw, 5rem)",
            textShadow:
              "0 0 30px hsla(342, 82%, 56%, 0.4), 0 0 60px hsla(342, 82%, 56%, 0.2)",
            marginBottom: "2rem",
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