import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const TEXT_GROUPS: string[][] = [];
  for (let i = 0; i < ALL_LINES.length; i += 2) {
    TEXT_GROUPS.push(ALL_LINES.slice(i, i + 2));
  }

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

  useEffect(() => {
    if (isFinal && scrollStep < TEXT_GROUPS.length) {
      const timer = setTimeout(() => {
        setScrollStep(prev => prev + 1);
      }, 12000); 
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full max-w-4xl px-4 flex flex-col items-center justify-center"
            >
              {/* Centered Large 3x3 Grid Reveal with 5% overlap */}
              <div className="w-full max-w-3xl mx-auto flex flex-col">
                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-0 w-full relative z-0">
                  {[...Array(3)].map((_, i) => (
                    <motion.div key={i} animate={{ opacity: i < gridStep ? 1 : 0 }} className="aspect-square bg-pink-900/15 border border-pink-500/10" />
                  ))}
                </div>
                {/* Row 2 - 5% overlap */}
                <div className="grid grid-cols-3 gap-0 w-full relative z-10 -mt-[5%]">
                  {[...Array(3)].map((_, i) => (
                    <motion.div key={i+3} animate={{ opacity: (i+3) < gridStep ? 1 : 0 }} className="aspect-square bg-pink-900/15 border border-pink-500/10" />
                  ))}
                </div>
                {/* Row 3 - 5% overlap */}
                <div className="grid grid-cols-3 gap-0 w-full relative z-20 -mt-[5%]">
                  {[...Array(3)].map((_, i) => (
                    <motion.div key={i+6} animate={{ opacity: (i+6) < gridStep ? 1 : 0 }} className="aspect-square bg-pink-900/15 border border-pink-500/10" />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col lg:flex-row items-center justify-center gap-0 w-full max-w-5xl"
            >
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-1/2 flex justify-center"
              >
                <div className="relative w-full max-w-sm aspect-[4/5] overflow-hidden">
                  <img
                    src={FINAL_IMAGE}
                    alt="Final Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-1/2 relative max-w-sm aspect-[4/5] flex items-center justify-center overflow-hidden shadow-2xl"
              >
                <img 
                  src="/gallery/card.png" 
                  alt="Message Card" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />

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
