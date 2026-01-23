import React, { useEffect, useRef } from 'react';
import { useSocketStore } from '../../store/socket.store';

// You can use a free sound URL or import a local mp3
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const SocketManager: React.FC = () => {
  const { connect, disconnect } = useSocketStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Connect on mount
    connect();

    // 2. Setup Sound Listener
    const handlePlaySound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));
      }
    };

    window.addEventListener('play-order-sound', handlePlaySound);

    // 3. Cleanup on unmount
    return () => {
      disconnect();
      window.removeEventListener('play-order-sound', handlePlaySound);
    };
  }, [connect, disconnect]);

  return (
    <audio ref={audioRef} src={NOTIFICATION_SOUND} hidden />
  );
};

export default SocketManager;