import { useEffect, useRef } from "react";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Autoplay with user interaction fallback
    const playAudio = () => {
      audio.play().catch(() => {
        // Browser blocked autoplay — play on first click
        const handleClick = () => {
          audio.play();
          document.removeEventListener("click", handleClick);
        };
        document.addEventListener("click", handleClick);
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
      className="hidden"
    />
  );
};

export default BackgroundMusic;
