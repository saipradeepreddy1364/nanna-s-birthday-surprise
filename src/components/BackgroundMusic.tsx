import { useEffect, useRef } from "react";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = () => {
      // Try immediate play
      audio.play().catch(() => {
        const startAudio = () => {
          audio.play()
            .then(() => {
              // Once playing, remove all listeners
              ["click", "touchstart", "mousedown", "pointerdown"].forEach(ev => 
                document.removeEventListener(ev, startAudio)
              );
            })
            .catch(err => console.log("Audio play failed:", err));
        };

        // Add multiple listeners for reliability
        ["click", "touchstart", "mousedown", "pointerdown"].forEach(ev => 
          document.addEventListener(ev, startAudio, { once: true })
        );
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
