
import React, { useEffect, useRef, useState } from 'react';

const AmbientSound: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
      audioRef.current.loop = true;
    }
  }, []);

  const toggleSound = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play blocked"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed top-8 right-8 z-[100]">
      <audio 
        ref={audioRef} 
        src="https://www.soundjay.com/nature/sounds/rain-03.mp3" 
      />
      <button 
        onClick={toggleSound}
        className="relative p-4 rounded-full border border-white/5 bg-white/[0.02] text-white/20 hover:text-white/60 transition-all duration-700 backdrop-blur-sm group overflow-hidden"
        title={isPlaying ? "سکوت" : "صدای باران"}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
};

export default AmbientSound;
