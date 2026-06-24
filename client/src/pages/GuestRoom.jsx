import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

export default function GuestRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState([]);
  const [mediaError, setMediaError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const userInfoRef = useRef({});
  const localStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach((p) => p.peer.destroy());
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const createPeer = useCallback((targetSocketId, initiator) => {
    const stream = localStreamRef.current;
    if (!stream) return null;

    const peer = new Peer({
      initiator,
      stream,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peersRef.current[targetSocketId] = { peer, stream: null, socketId: targetSocketId };

    peer.on('signal', (signal) => {
      socketRef.current?.emit('signal', { to: targetSocketId, signal });
    });

    peer.on('stream', (remoteStream) => {
      const entry = peersRef.current[targetSocketId];
      if (entry) {
        entry.stream = remoteStream;
        setPeers(Object.values(peersRef.current));
      }
    });

    peer.on('error', (err) => {
      console.error('[Guest] Peer error:', err);
    });

    peer.on('close', () => {
      delete peersRef.current[targetSocketId];
      setPeers(Object.values(peersRef.current));
    });

    return peer;
  }, []);

  const joinRoom = async () => {
    if (!username.trim()) return;
    setConnecting(true);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setMediaError(err.message);
      setConnecting(false);
      return;
    }

    const socket = io({
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', {
        roomId,
        user: { id: 'guest_' + socket.id, name: username.trim() },
      });
      setJoined(true);
      setConnecting(false);
    });

    socket.on('room-users', ({ users }) => {
      users.forEach((u) => {
        if (u.socketId !== socket.id) {
          userInfoRef.current[u.socketId] = { userId: u.id, name: u.name };
          if (!peersRef.current[u.socketId]) {
            createPeer(u.socketId, true);
          }
        }
      });
    });

    socket.on('user-joined', ({ userId, name, socketId }) => {
      userInfoRef.current[socketId] = { userId, name };
      if (!peersRef.current[socketId]) {
        createPeer(socketId, false);
      }
    });

    socket.on('signal', ({ from, signal, user }) => {
      if (user) {
        userInfoRef.current[from] = { userId: user.id, name: user.name };
      }
      const peerData = peersRef.current[from];
      if (!peerData) {
        const peer = createPeer(from, false);
        if (peer) peer.signal(signal);
      } else {
        peerData.peer.signal(signal);
      }
    });

    socket.on('user-left', ({ userId, socketId }) => {
      const peerData = peersRef.current[socketId];
      if (peerData) {
        peerData.peer.destroy();
        delete peersRef.current[socketId];
        setPeers(Object.values(peersRef.current));
      }
      delete userInfoRef.current[socketId];
    });
  };

  const handleLeave = () => {
    Object.values(peersRef.current).forEach((p) => p.peer.destroy());
    peersRef.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (socketRef.current) socketRef.current.disconnect();
    navigate('/');
  };

  const retryMedia = () => {
    setMediaError(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center">
          <img src="/logo3.png" alt="" className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Join as Guest</h2>
          <p className="text-gray-400 text-sm mb-6">Room: {roomId}</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            disabled={connecting}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 disabled:opacity-50"
          />
          {mediaError ? (
            <div className="mb-4">
              <p className="text-sm text-red-400 mb-2">{mediaError}</p>
              <button
                onClick={retryMedia}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Retry Camera & Microphone
              </button>
            </div>
          ) : (
            <button
              onClick={joinRoom}
              disabled={connecting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Join'}
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 mt-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full max-w-4xl">
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
            <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg">
              <span className="text-white text-sm">{username} (You)</span>
            </div>
          </div>
          {peers.map((p, i) => (
            <div key={p.socketId || i} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
              <video ref={(el) => { if (el && p.stream) el.srcObject = p.stream; }} autoPlay className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-gray-800 border-t border-gray-700">
        <button
          onClick={handleLeave}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
