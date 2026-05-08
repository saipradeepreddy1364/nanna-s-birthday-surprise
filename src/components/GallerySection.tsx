import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_IMAGES = [
  "/placeholder.svg"
];

const FINAL_IMAGE = "/gallery/final.jpeg";

interface GallerySectionProps {
  onComplete: () => void;
}

const GallerySection = ({ onComplete }: GallerySectionProps) => {
  const [gridStep, setGridStep] = useState(0);
  const [isFinal, setIsFinal] = useState(false);
  const [scrollStep, setScrollStep] = useState(0);

  const ALL_LINES = [
    "I honestly don’t know what my presence means to you or how important this connection is in your life.",
    "But I know one thing for certain…",
    "When you entered my life, you brought back the smiles, trust, and happiness I had once lost.",
    "A world I thought had disappeared somehow came back just through knowing you.",
    "So even if this may be just a normal acquaintance to you, to me it is something very special.",
    "Something that brought life back into my world.",
    "In a time where many girls cross all boundaries without restraint,",
    "she is like a moonlight beauty who has gracefully set her own limits —",
    "soft, serene, and rare… a soul that shines with quiet dignity and self-respect.",
    "Forever grateful to you Nanna"
  ];

  // Split lines into groups of 2
  const TEXT_GROUPS: string[][] = [];
  for (let i = 0; i < ALL_LINES.length; i += 2) {
    TEXT_GROUPS.push(ALL_LINES.slice(i, i + 2));
  }

  // Grid reveal logic
  useEffect(() => {
    if (!isFinal) {
      const timer = setInterval(() => {
        setGridStep(prev => {
          if (prev >= 9) {
            clearInterval(timer);
            setTimeout(() => setIsFinal(true), 1500);
            return 9;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [isFinal]);

  // Step-wise scroll logic
  useEffect(() => {
    if (isFinal && scrollStep < TEXT_GROUPS.length) {
      const timer = setTimeout(() => {
        setScrollStep(prev => prev + 1);
      }, 12000); // 12s pause per 2 lines
      return () => clearTimeout(timer);
    } else if (isFinal && scrollStep === TEXT_GROUPS.length) {
      const timer = setTimeout(onComplete, 5000);
      return () => clearTimeout(timer);
    }
  }, [isFinal, scrollStep, onComplete, TEXT_GROUPS.length]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-romantic)" }}
    >
      <div className="relative w-full max-w-6xl px-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFinal ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="grid grid-cols-3 grid-rows-3 gap-4 w-full max-w-2xl aspect-square"
            >
              {[...Array(9)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index < gridStep ? 1 : 0 }}
                  className="relative rounded-md overflow-hidden aspect-square bg-pink-900/10 flex items-center justify-center border border-pink-500/20"
                >
                  {index < gridStep && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-8 h-8 bg-pink-500/30 rotate-45 transform origin-center">
                          <div className="absolute top-0 left-0 w-full h-full bg-pink-500/30 -translate-x-1/2 rounded-full" />
                          <div className="absolute top-0 left-0 w-full h-full bg-pink-500/30 -translate-y-1/2 rounded-full" />
                       </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full"
            >
              {/* Left Side: Portrait */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-1/2 flex justify-center"
              >
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden !shadow-none !border-none">
                  <img
                    src={FINAL_IMAGE}
                    alt="Final Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Right Side: Card with 2-point-at-a-time text */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/5] max-w-md flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
              >
                <img 
                  src="/gallery/card.png" 
                  alt="Message Card" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />

                <div className="relative z-10 w-full h-full flex items-center justify-center p-8 text-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={scrollStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="space-y-6"
                    >
                      {TEXT_GROUPS[scrollStep]?.map((line, idx) => (
                        <p
                          key={idx}
                          className="text-white font-elegant text-xl sm:text-2xl leading-relaxed drop-shadow-lg text-pink-50"
                        >
                          {line}
                        </p>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GallerySection;
