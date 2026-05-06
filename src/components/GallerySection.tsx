import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_IMAGES = [
  "/gallery/g1.jpg", 
  "/gallery/g2.jpg", 
  "/gallery/g3.jpg",
  "/gallery/g4.jpg", 
  "/gallery/g5.jpg"
];

const FINAL_IMAGE = "/gallery/final.jpg";

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
      }, 5000); // Show final image for 5 seconds
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
                      backgroundColor: index < gridStep ? "transparent" : "rgba(0,0,0,1)"
                    }}
                    className="relative rounded-md overflow-hidden aspect-square border border-white/10"
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
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border-4 border-white/20"
              style={{ boxShadow: "var(--glow-pink)" }}
            >
              <img
                src={FINAL_IMAGE}
                alt="Final Memory"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-0 right-0 text-center"
              >
                <p className="text-white font-cursive text-2xl sm:text-4xl drop-shadow-lg">
                  Every moment with you is a treasure...
                </p>
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