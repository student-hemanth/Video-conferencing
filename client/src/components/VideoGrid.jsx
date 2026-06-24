import VideoPlayer from './VideoPlayer.jsx';

export default function VideoGrid({ peers, localStream, user }) {
  const allVideos = [
    { stream: localStream, userName: user?.name, isLocal: true, muted: true, id: 'local' },
    ...peers.map((p) => ({
      stream: p.stream,
      userName: p.userName,
      isLocal: false,
      muted: false,
      id: p.peerId,
    })),
  ].filter((v) => v.stream);

  const count = allVideos.length;

  const gridClass =
    count <= 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : count === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : count <= 4
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-4 p-4 w-full h-full auto-rows-fr`}>
      {allVideos.map((v) => (
        <VideoPlayer key={v.id} {...v} />
      ))}
    </div>
  );
}
