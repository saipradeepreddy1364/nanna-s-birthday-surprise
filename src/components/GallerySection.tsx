import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_IMAGES = [
  "/gallery/g1.jpg",
  "/gallery/g2.jpg",
  "/gallery/g3.jpg",
  "/gallery/g4.jpg",
  "/gallery/g5.jpg"
];

const FINAL_IMAGE = "/gallery/final.jpeg";

interface GallerySectionProps {
  onComplete: () => void;
}

const GallerySection = ({ onComplete }: GallerySectionProps) => {
  const [gridStep, setGridStep] = useState(0); // 0 to 9
  const [isFinal, setIsFinal] = useState(false);

  useEffect(() => {
    if (gridStep < 9) {
      const timer = setTimeout(() => {
        setGridStep((prev) => prev + 1);
      }, 1000); // 1 second per image reveal
      return () => clearTimeout(timer);
    } else {
      // All grid images revealed, wait a bit then show final image
      const timer = setTimeout(() => {
        setIsFinal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gridStep]);

  useEffect(() => {
    if (isFinal) {
      // The transition is now handled by onAnimationComplete in the scroll container
      return;
    }
  }, [isFinal]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-romantic)" }}
    >
      <div className="relative w-full max-w-4xl px-4 aspect-square sm:aspect-video flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFinal ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full"
            >
              {[...Array(9)].map((_, index) => {
                const src = GRID_IMAGES[index % GRID_IMAGES.length];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: index < gridStep ? 1 : 0,
                      backgroundColor: "transparent"
                    }}
                    className="relative rounded-md overflow-hidden aspect-square"
                  >
                    {index < gridStep && (
                      <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={src}
                        alt={`Memory ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-7xl px-4"
            >
              {/* Left Side: Portrait */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="w-full lg:w-1/2 flex justify-center"
              >
                <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                  <img
                    src={FINAL_IMAGE}
                    alt="Final Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Right Side: Card with Scrolling Text */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }} // Removed delay to start immediately
                className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/5] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Background Card Image */}
                <img 
                  src="/gallery/card.png" 
                  alt="Message Card" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* Auto-scrolling Text Container */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-8 sm:p-12 overflow-hidden">
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: "-100%" }}
                    transition={{ 
                      duration: 100, // Even slower
                      ease: "linear" 
                    }}
                    onAnimationComplete={onComplete} // Navigate immediately after scroll
                    className="space-y-8 text-center"
                  >
                    {[
                      "I honestly don’t know what my presence means to you or how important this connection is in your life.",
                      "But I know one thing for certain…",
                      "When you entered my life, you brought back the smiles, trust, and happiness I had once lost.",
                      "A world I thought had disappeared somehow came back just through knowing you.",
                      "So even if this may be just a normal acquaintance to you, to me it is something very special—something that brought life back into my world.",
                      "---",
                      "In a time where many girls cross all boundaries without restraint,",
                      "she is like a moonlight beauty who has gracefully set her own limits —",
                      "soft, serene, and rare… a soul that shines with quiet dignity and self-respect",
                      "Forever grateful to you Nanna"
                    ].map((line, idx) => (
                      <p
                        key={idx}
                        className={`text-white font-elegant leading-relaxed drop-shadow-lg ${
                          line === "---" ? "opacity-0 h-4" : 
                          idx < 5 ? "text-xl sm:text-2xl md:text-3xl text-pink-50" : "text-xl sm:text-2xl md:text-3xl text-yellow-50 italic"
                        }`}
                      >
                        {line === "---" ? "" : line}
                      </p>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative floating petals/sparkles could be added here if needed */}
    </div>
  );
};

export default GallerySection;
