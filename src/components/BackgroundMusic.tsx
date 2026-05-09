import { useEffect, useRef } from "react";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Autoplay with user interaction fallback
    const playAudio = () => {
      audio.play().catch(() => {
        // Browser blocked autoplay — play on first click or touch
        const handleClick = () => {
          audio.play();
          document.removeEventListener("click", handleClick);
          document.removeEventListener("touchstart", handleClick);
        };
        document.addEventListener("click", handleClick);
        document.addEventListener("touchstart", handleClick, { once: true });
      });
    };

    playAudio();
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/audio/song.mp3"
      loop
      autoPlay
      preload="auto"
      className="hidden"
    />
  );
};

export default BackgroundMusic;
