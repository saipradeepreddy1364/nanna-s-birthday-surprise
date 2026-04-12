import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import OpeningPage from "@/components/OpeningPage";
import GallerySection from "@/components/GallerySection";
import ScrollingText from "@/components/ScrollingText";
import HeartScene from "@/components/HeartScene";
import BackgroundMusic from "@/components/BackgroundMusic";
import FinalPage from "@/components/FinalPage";

type Section = "opening" | "gallery" | "text" | "heart" | "final";

const Index = () => {
  const [section, setSection] = useState<Section>("opening");

  const goToGallery = useCallback(() => setSection("gallery"), []);
  const goToText = useCallback(() => setSection("text"), []);
  const goToHeart = useCallback(() => setSection("heart"), []);
  const goToFinal = useCallback(() => setSection("final"), []);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-romantic)" }}>
      <AnimatePresence mode="wait">
        {section === "opening" && <OpeningPage onComplete={goToGallery} />}
        {section === "gallery" && <GallerySection onComplete={goToText} />}
        {section === "text" && <ScrollingText onComplete={goToHeart} />}
        {section === "heart" && <HeartScene onComplete={goToFinal} />}
        {section === "final" && <FinalPage />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
