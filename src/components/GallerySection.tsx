import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_IMAGES = [
  "/nanna-potrait.jpeg",
  "/gallery/final.jpeg",
  "/gallery/card.png",
  "/nanna-potrait.jpeg",
  "/gallery/final.jpeg"
];

const FINAL_IMAGE = "/gallery/final.jpeg";

interface GallerySectionProps {
  onComplete: () => void;
}

const GallerySection = ({ onComplete }: GallerySectionProps) => {
  const [gridStep, setGridStep] = useState(0);
  const [isFinal, setIsFinal] = useState(false);
  const [scrollStep, setScrollStep] = useState(0);
  const totalSteps = 4;

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
    if (isFinal && scrollStep < totalSteps) {
      const timer = setTimeout(() => {
        setScrollStep(prev => prev + 1);
      }, scrollStep === 0 ? 8000 : 7000); // 8s first pause, then 7s
      return () => clearTimeout(timer);
    } else if (isFinal && scrollStep === totalSteps) {
      const timer = setTimeout(onComplete, 5000);
      return () => clearTimeout(timer);
    }
  }, [isFinal, scrollStep, onComplete]);

  const TEXT_GROUPS = [
    [
      "I honestly don’t know what my presence means to you or how important this connection is in your life.",
      "But I know one thing for certain…"
    ],
    [
      "When you entered my life, you brought back the smiles, trust, and happiness I had once lost.",
      "A world I thought had disappeared somehow came back just through knowing you."
    ],
    [
      "So even if this may be just a normal acquaintance to you, to me it is something very special—something that brought life back into my world."
    ],
    [
      "In a time where many girls cross all boundaries without restraint,",
      "she is like a moonlight beauty who has gracefully set her own limits —",
      "soft, serene, and rare… a soul that shines with quiet dignity and self-respect",
      "Forever grateful to you Nanna"
    ]
  ];

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
                    animate={{ opacity: index < gridStep ? 1 : 0 }}
                    className="relative rounded-md overflow-hidden aspect-square"
                  >
                    {index < gridStep && (
                      <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={src}
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
                className="w-full lg:w-1/2 flex justify-center"
              >
                <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
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
                className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/5] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Background Card Image */}
                <img 
                  src="/gallery/card.png" 
                  alt="Message Card" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* Step-wise Scrolling Text Container */}
                <div className="relative z-10 w-full h-full flex items-start justify-center p-8 sm:p-12 overflow-hidden">
                  <motion.div 
                    animate={{ y: `-${scrollStep * 100}%` }}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-full"
                  >
                    {[...TEXT_GROUPS, ["---"]].map((group, groupIdx) => (
                      <div key={groupIdx} className="h-full w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center px-4">
                        {group.map((line, lineIdx) => (
                          <p
                            key={lineIdx}
                            className={`text-white font-elegant leading-relaxed drop-shadow-lg ${
                              line === "---" ? "opacity-0" : 
                              groupIdx < 3 ? "text-lg sm:text-xl md:text-2xl text-pink-50" : "text-lg sm:text-xl md:text-2xl text-yellow-50 italic"
                            }`}
                          >
                            {line === "---" ? "" : line}
                          </p>
                        ))}
                      </div>
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
