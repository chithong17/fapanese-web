// src/components/AudioPlayer.tsx
import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  base64Data: string;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Data, autoPlay = true }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (base64Data) {
      // Chuyển Base64 thành URL có thể phát
      const audioUrl = `data:audio/wav;base64,${base64Data}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        if (autoPlay) {
          audioRef.current.play().catch(e => console.error("Lỗi khi cố gắng phát audio:", e));
        }
      }
    }
  }, [base64Data, autoPlay]);

  if (!base64Data) return null;

  return (
    <audio ref={audioRef} controls className="w-full mt-2">
      Your browser does not support the audio element.
    </audio>
  );
};

export default AudioPlayer;