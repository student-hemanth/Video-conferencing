import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function GuestRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState([]);
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const joinRoom = async () => {
    if (!username.trim()) return;

    socketRef.current = io({
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', {
        roomId,
        user: { id: 'guest_' + socketRef.current.id, name: username.trim() },
      });
      setJoined(true);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        window.localStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Media error:', err);
      });
  };

  const handleLeave = () => {
    if (window.localStream) {
      window.localStream.getTracks().forEach((t) => t.stop());
    }
    if (socketRef.current) socketRef.current.disconnect();
    navigate('/');
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
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={joinRoom}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Join
          </button>
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
            <div key={i} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
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
