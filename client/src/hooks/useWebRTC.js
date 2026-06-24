import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'simple-peer';

export default function useWebRTC(socket, roomId, user) {
  const [peers, setPeers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [streamReady, setStreamReady] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const peersRef = useRef({});
  const userInfoRef = useRef({});
  const localStreamRef = useRef(null);

  useEffect(() => {
    console.log('[useWebRTC] Starting media...');
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log('[useWebRTC] Got local stream, tracks:', stream.getTracks().length);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setStreamReady(true);
      } catch (err) {
        console.error('[useWebRTC] Failed to get media devices:', err.message);
      }
    };
    startMedia();

    return () => {
      console.log('[useWebRTC] Media cleanup');
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const createPeer = useCallback(
    (targetSocketId, initiator) => {
      const stream = localStreamRef.current;
      if (!stream) {
        console.error('[createPeer] No stream available');
        return null;
      }

      console.log('[createPeer] Creating peer for', targetSocketId, 'initiator:', initiator);
      const peer = new Peer({
        initiator,
        stream,
        trickle: false,
      });

      peer.on('signal', (signal) => {
        console.log('[createPeer] Sending signal to', targetSocketId);
        socket.emit('signal', { to: targetSocketId, signal });
      });

      peer.on('stream', (remoteStream) => {
        console.log('[createPeer] Got remote stream from', targetSocketId);
        const info = userInfoRef.current[targetSocketId] || {};
        peersRef.current[targetSocketId] = {
          peer,
          stream: remoteStream,
          peerId: targetSocketId,
          userId: info.userId,
          userName: info.name || 'Unknown',
        };
        setPeers(Object.values(peersRef.current));
      });

      peer.on('error', (err) => {
        console.error('[createPeer] Peer error:', err);
      });

      peer.on('close', () => {
        console.log('[createPeer] Peer closed:', targetSocketId);
        delete peersRef.current[targetSocketId];
        setPeers(Object.values(peersRef.current));
      });

      return peer;
    },
    [socket]
  );

  useEffect(() => {
    if (!socket) {
      console.log('[useWebRTC] Waiting for socket...');
      return;
    }
    if (!streamReady) {
      console.log('[useWebRTC] Waiting for stream...');
      return;
    }
    if (!roomId || !user) {
      console.log('[useWebRTC] Waiting for room/user...');
      return;
    }

    console.log('[useWebRTC] All ready, joining room:', roomId, 'user:', user.name);
    socket.emit('join-room', { roomId, user });

    const handleRoomUsers = ({ users }) => {
      console.log('[useWebRTC] room-users:', users.map(u => u.name));
      users.forEach((u) => {
        if (u.socketId !== socket.id) {
          userInfoRef.current[u.socketId] = { userId: u.id, name: u.name };
          if (!peersRef.current[u.socketId]) {
            createPeer(u.socketId, true);
          }
        }
      });
      setPeerIds(users.filter(u => u.socketId !== socket.id).map(u => u.socketId));
    };

    const handleUserJoined = ({ userId, name, socketId }) => {
      console.log('[useWebRTC] user-joined:', name, socketId);
      userInfoRef.current[socketId] = { userId, name };
      if (!peersRef.current[socketId]) {
        createPeer(socketId, false);
      }
    };

    const handleSignal = ({ from, signal, user: signalUser }) => {
      console.log('[useWebRTC] signal from:', from, 'user:', signalUser?.name);
      if (signalUser) {
        userInfoRef.current[from] = {
          userId: signalUser.id,
          name: signalUser.name,
        };
      }

      let peerData = peersRef.current[from];
      if (!peerData) {
        console.log('[useWebRTC] No peer for', from, 'creating non-initiator');
        const peer = createPeer(from, false);
        if (peer) {
          peer.signal(signal);
        }
      } else {
        console.log('[useWebRTC] Signaling existing peer for', from);
        peerData.peer.signal(signal);
      }
    };

    const handleUserLeft = ({ userId, socketId }) => {
      console.log('[useWebRTC] user-left:', socketId);
      const peerData = peersRef.current[socketId];
      if (peerData) {
        peerData.peer.destroy();
        delete peersRef.current[socketId];
        setPeers(Object.values(peersRef.current));
      }
      delete userInfoRef.current[socketId];
      setPeerIds(prev => prev.filter(id => id !== socketId));
    };

    socket.on('room-users', handleRoomUsers);
    socket.on('user-joined', handleUserJoined);
    socket.on('signal', handleSignal);
    socket.on('user-left', handleUserLeft);

    return () => {
      console.log('[useWebRTC] Cleaning up socket handlers');
      socket.off('room-users', handleRoomUsers);
      socket.off('user-joined', handleUserJoined);
      socket.off('signal', handleSignal);
      socket.off('user-left', handleUserLeft);

      Object.values(peersRef.current).forEach((p) => p.peer.destroy());
      peersRef.current = {};
      userInfoRef.current = {};
      setPeerIds([]);
    };
  }, [socket, streamReady, roomId, user, createPeer]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const enabled = !audioTrack.enabled;
        audioTrack.enabled = enabled;
        socket.emit('toggle-audio', { roomId, enabled });
        return enabled;
      }
    }
  }, [socket, roomId]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const enabled = !videoTrack.enabled;
        videoTrack.enabled = enabled;
        socket.emit('toggle-video', { roomId, enabled });
        return enabled;
      }
    }
  }, [socket, roomId]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      videoTrack.onended = () => stopScreenShare();

      Object.values(peersRef.current).forEach((p) => {
        p.peer.replaceTrack(
          localStreamRef.current.getVideoTracks()[0],
          videoTrack,
          localStreamRef.current
        );
      });

      localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
      localStreamRef.current.addTrack(videoTrack);

      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      socket.emit('screen-share', { roomId, enabled: true });

      return true;
    } catch (err) {
      console.error('Screen share failed:', err);
      return false;
    }
  }, [socket, roomId]);

  const stopScreenShare = useCallback(() => {
    if (!localStreamRef.current) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((cameraStream) => {
      const videoTrack = cameraStream.getVideoTracks()[0];

      Object.values(peersRef.current).forEach((p) => {
        p.peer.replaceTrack(
          localStreamRef.current.getVideoTracks()[0],
          videoTrack,
          localStreamRef.current
        );
      });

      localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0]);
      localStreamRef.current.addTrack(videoTrack);

      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      socket.emit('screen-share', { roomId, enabled: false });
    });
  }, [socket, roomId]);

  return {
    peers,
    localStream,
    peerIds,
    streamReady,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
}
