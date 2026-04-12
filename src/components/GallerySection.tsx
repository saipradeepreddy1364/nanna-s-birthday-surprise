import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Placeholder images - replace with real ones
const GALLERY_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: "/placeholder.svg",
  alt: `Memory ${i + 1}`,
}));

type AnimEffect = {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  transition: Record<string, unknown>;
  style?: Record<string, string>;
};

const effects: AnimEffect[] = [
  // 1. Zoom In
  {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.2, ease: "easeOut" },
  },
  // 2. Zoom Out
  {
    initial: { scale: 1.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.2, ease: "easeOut" },
  },
  // 3. Blur to clear
  {
    initial: { filter: "blur(20px)", opacity: 0 },
    animate: { filter: "blur(0px)", opacity: 1 },
    transition: { duration: 1.5, ease: "easeOut" },
  },
  // 4. Circular reveal (scale from point)
  {
    initial: { scale: 0, borderRadius: "50%", opacity: 0 },
    animate: { scale: 1, borderRadius: "12px", opacity: 1 },
    transition: { duration: 1.3, ease: "easeOut" },
  },
  // 5. Fall from top
  {
    initial: { y: -600, opacity: 0, rotate: -15 },
    animate: { y: 0, opacity: 1, rotate: 0 },
    transition: { type: "spring", damping: 15, stiffness: 80 },
  },
  // 6. Slide from right
  {
    initial: { x: 600, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
  // 7. Slide from left
  {
    initial: { x: -600, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
  // 8. Rotate in
  {
    initial: { rotate: 180, scale: 0, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    transition: { duration: 1.2, ease: "easeOut" },
  },
  // 9. Flip in
  {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    transition: { duration: 1, ease: "easeOut" },
  },
  // 10. Rise from bottom with bounce
  {
    initial: { y: 500, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: "spring", damping: 10, stiffness: 100 },
  },
  // 11. Scale + blur combo
  {
    initial: { scale: 2, filter: "blur(15px)", opacity: 0 },
    animate: { scale: 1, filter: "blur(0px)", opacity: 1 },
    transition: { duration: 1.4, ease: "easeOut" },
  },
  // 12. Diagonal slide
  {
    initial: { x: -400, y: -400, opacity: 0, rotate: -30 },
    animate: { x: 0, y: 0, opacity: 1, rotate: 0 },
    transition: { type: "spring", damping: 18, stiffness: 90 },
  },
];

interface GallerySectionProps {
  onComplete: () => void;
}

const GallerySection = ({ onComplete }: GallerySectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const advanceImage = useCallback(() => {
    if (currentIndex < GALLERY_IMAGES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setTimeout(onComplete, 1500);
    }
  }, [currentIndex, onComplete]);

  useEffect(() => {
    const timer = setTimeout(advanceImage, 3000);
    return () => clearTimeout(timer);
  }, [currentIndex, advanceImage]);

  const effect = effects[currentIndex % effects.length];
  const image = GALLERY_IMAGES[currentIndex];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-romantic)" }}
    >
      {/* Counter */}
      <div className="absolute top-6 right-6 z-20 font-elegant text-muted-foreground text-lg">
        {currentIndex + 1} / {GALLERY_IMAGES.length}
      </div>

      {/* Decorative border frame */}
      <div
        className="absolute inset-8 sm:inset-16 border rounded-lg pointer-events-none z-10"
        style={{ borderColor: "hsl(342, 82%, 56%, 0.15)" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={image.id}
          initial={effect.initial as any}
          animate={effect.animate as any}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={effect.transition as any}
          className="relative w-[80vw] h-[60vh] sm:w-[60vw] sm:h-[70vh] max-w-2xl rounded-xl overflow-hidden"
          style={{
            boxShadow: "var(--glow-pink)",
            ...effect.style,
          }}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, hsl(340, 30%, 8%, 0.5) 0%, transparent 40%)",
            }}
          />
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="font-cursive text-2xl sm:text-3xl text-primary-foreground glow-pink">
              {image.alt}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {GALLERY_IMAGES.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i === currentIndex
                  ? "hsl(342, 82%, 56%)"
                  : i < currentIndex
                  ? "hsl(38, 70%, 55%, 0.6)"
                  : "hsl(340, 20%, 30%)",
              transform: i === currentIndex ? "scale(1.5)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GallerySection;
