import { useRef, useEffect } from 'react';

export default function VideoPlayer({ stream, muted, userName, isLocal }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    return () => {
      el.srcObject = null;
    };
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg">
        <span className="text-white text-sm font-medium">
          {userName} {isLocal ? '(You)' : ''}
        </span>
      </div>
    </div>
  );
}
