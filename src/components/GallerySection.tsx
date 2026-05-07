import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_IMAGES = [
  "/gallery/g1.jpg",
  "/gallery/g2.jpg",
  "/gallery/g3.jpg",
  "/gallery/g4.jpg",
  "/gallery/g5.jpg",
  "/gallery/card.png"
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
      const timer = setTimeout(() => {
        onComplete();
      }, 15000); // Show final image for 15 seconds
      return () => clearTimeout(timer);
    }
  }, [isFinal, onComplete]);

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
                <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10">
                  <img
                    src={FINAL_IMAGE}
                    alt="Final Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              {/* Right Side: Butterfly Background with Animated Text */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/5] flex items-center justify-center p-8 rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Background Image */}
                <img 
                  src="/gallery/image.png" 
                  alt="Message Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* Animated Text Lines */}
                <div className="relative z-10 space-y-4 max-w-lg">
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
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 + idx * 0.8, duration: 0.6 }}
                      className={`text-white font-cursive leading-relaxed drop-shadow-md ${
                        line === "---" ? "opacity-0 h-2" : 
                        idx < 5 ? "text-lg sm:text-xl text-pink-100" : "text-lg sm:text-xl text-yellow-100 italic"
                      }`}
                    >
                      {line === "---" ? "" : line}
                    </motion.p>
                  ))}
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
