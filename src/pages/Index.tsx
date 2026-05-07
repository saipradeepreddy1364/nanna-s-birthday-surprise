import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OpeningPage from "@/components/OpeningPage";
import GallerySection from "@/components/GallerySection";
import HeartScene from "@/components/HeartScene";
import BackgroundMusic from "@/components/BackgroundMusic";
import FinalPage from "@/components/FinalPage";

type Section = "opening" | "gallery" | "heart" | "final";

const Index = () => {
  const [section, setSection] = useState<Section>("opening");

  const goToGallery = useCallback(() => setSection("gallery"), []);
  const goToHeart = useCallback(() => setSection("heart"), []);
  const goToFinal = useCallback(() => setSection("final"), []);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-romantic)" }}>
      <BackgroundMusic />
      <AnimatePresence mode="wait">
        {section === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <OpeningPage onComplete={goToGallery} />
          </motion.div>
        )}
        {section === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GallerySection onComplete={goToHeart} />
          </motion.div>
        )}
        {section === "heart" && (
          <motion.div
            key="heart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeartScene onComplete={goToFinal} />
          </motion.div>
        )}
        {section === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FinalPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
