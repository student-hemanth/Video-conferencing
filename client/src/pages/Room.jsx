import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useSocket from '../hooks/useSocket.js';
import useWebRTC from '../hooks/useWebRTC.js';
import VideoGrid from '../components/VideoGrid.jsx';
import Controls from '../components/Controls.jsx';
import Chat from '../components/Chat.jsx';

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket(roomId);
  const {
    peers,
    localStream,
    streamReady,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC(socket, roomId, user);
  const [chatOpen, setChatOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center overflow-hidden relative">
            {localStream ? (
              <VideoGrid peers={peers} localStream={localStream} user={user} />
            ) : (
              <div className="text-gray-400 text-center px-4">
                <p className="text-lg">Requesting camera & microphone access...</p>
                <p className="text-sm mt-2 text-gray-500">
                  {mediaError || 'Please allow camera and microphone permissions when prompted.'}
                </p>
              </div>
            )}

            {/* Debug overlay */}
            {showDebug && (
              <div className="absolute top-4 left-4 bg-black/80 text-green-400 text-xs font-mono p-4 rounded-lg max-w-xs z-10">
                <p>Socket: {connected ? 'connected' : 'disconnected'}</p>
                <p>Stream: {localStream ? 'active' : 'waiting'}</p>
                <p>Stream ready: {String(streamReady)}</p>
                <p>Peers: {peers.length}</p>
                <p>Room: {roomId}</p>
              </div>
            )}
          </div>
          <Controls
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            startScreenShare={startScreenShare}
            stopScreenShare={stopScreenShare}
            onToggleChat={() => setChatOpen(!chatOpen)}
            chatOpen={chatOpen}
            onShowDebug={() => setShowDebug(!showDebug)}
            showDebug={showDebug}
          />
        </div>

        {chatOpen && (
          <div className="w-80 flex-shrink-0 hidden md:block">
            <Chat socket={socket} roomId={roomId} user={user} />
          </div>
        )}
      </div>

      {chatOpen && (
        <div className="md:hidden h-80 border-t border-gray-700">
          <Chat socket={socket} roomId={roomId} user={user} />
        </div>
      )}
    </div>
  );
}
