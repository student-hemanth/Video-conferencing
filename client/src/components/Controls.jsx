import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Controls({
  toggleAudio,
  toggleVideo,
  startScreenShare,
  stopScreenShare,
  onToggleChat,
  chatOpen,
  onShowDebug,
  showDebug,
}) {
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const navigate = useNavigate();

  const handleAudio = () => {
    const enabled = toggleAudio();
    setAudioOn(enabled);
  };

  const handleVideo = () => {
    const enabled = toggleVideo();
    setVideoOn(enabled);
  };

  const handleScreenShare = async () => {
    if (screenOn) {
      stopScreenShare();
      setScreenOn(false);
    } else {
      const ok = await startScreenShare();
      if (ok) setScreenOn(true);
    }
  };

  const handleLeave = () => {
    if (window.confirm('Leave this room?')) {
      navigate('/home');
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-800 border-t border-gray-700">
      <button
        onClick={handleAudio}
        className={`p-3 rounded-full transition-colors ${
          audioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
        }`}
        title={audioOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        {audioOn ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>

      <button
        onClick={handleVideo}
        className={`p-3 rounded-full transition-colors ${
          videoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
        }`}
        title={videoOn ? 'Turn off camera' : 'Turn on camera'}
      >
        {videoOn ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
          </svg>
        )}
      </button>

      <button
        onClick={handleScreenShare}
        className={`p-3 rounded-full transition-colors ${
          screenOn ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title={screenOn ? 'Stop sharing screen' : 'Share screen'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      <button
        onClick={onToggleChat}
        className={`p-3 rounded-full transition-colors ${
          chatOpen ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title="Toggle chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <button
        onClick={onShowDebug}
        className={`p-3 rounded-full transition-colors ${
          showDebug ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title="Toggle debug"
      >
        <span className="text-white text-sm font-bold">DBG</span>
      </button>

      <button
        onClick={handleLeave}
        className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
        title="Leave room"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
        </svg>
      </button>
    </div>
  );
}
