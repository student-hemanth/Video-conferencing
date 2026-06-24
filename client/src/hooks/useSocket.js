import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(_roomId) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io({ transports: ['websocket', 'polling'] });
    socketRef.current = s;

    s.on('connect', () => {
      setConnected(true);
    });

    s.on('connect_error', (err) => {
      console.error('[Socket] connect_error:', err.message);
    });

    s.on('disconnect', (reason) => {
      setConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, connected };
}
