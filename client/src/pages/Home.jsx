import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    api.get('/rooms')
      .then(({ data }) => setRecentRooms(data.rooms))
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    setError('');
    try {
      const { data } = await api.post('/rooms', { name: roomName || undefined });
      navigate(`/room/${data.room.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    if (!roomId.trim()) return;
    try {
      await api.post(`/rooms/join/${roomId.trim()}`);
      navigate(`/room/${roomId.trim()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Room not found');
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
              <img src="/logo3.png" alt="MeetFlow" className="h-5 w-5 brightness-0 invert" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">MeetFlow</span>
              <span className="text-[10px] text-gray-400 block leading-none">dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Welcome */}
      <section className="px-6 pt-10 pb-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-gray-500 mt-1">Start or join a meeting instantly</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/25 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Meeting
            </button>
            <button
              onClick={() => document.getElementById('joinInput')?.focus()}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Join
            </button>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-6 pb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Meeting</h2>
                <p className="text-gray-500 text-sm">Start a new video room</p>
              </div>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Meeting name (optional)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
              <button
                onClick={handleCreate}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/20"
              >
                Create Room
              </button>
            </div>
          </div>

          {/* Join card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-emerald-100">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Join Meeting</h2>
                <p className="text-gray-500 text-sm">Enter a room code</p>
              </div>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                id="joinInput"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-600/20"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="px-6 pb-4 max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm text-center">
            {error}
          </div>
        </section>
      )}

      {/* Recent meetings */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Meetings</h2>
          {recentRooms.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {recentRooms.length} room{recentRooms.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {recentRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRooms.map((room) => (
              <div
                key={room._id}
                className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => navigate(`/room/${room.roomId}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-gray-400">{room.roomId}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(room.roomId); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    title="Copy room ID"
                  >
                    {copiedId === room.roomId ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <h3 className="text-gray-900 font-semibold mb-1 truncate">{room.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{room.host?.name || 'Unknown'}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{new Date(room.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">No meetings yet</p>
            <p className="text-gray-400 text-sm mt-1">Create or join a meeting to get started</p>
          </div>
        )}
      </section>

      {/* Promo / Advertisement */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-8 md:p-12">
              <span className="text-blue-200 text-sm font-semibold tracking-wide uppercase">Premium</span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-3">MeetFlow Pro</h2>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Unlock HD recording, custom backgrounds, breakout rooms, and priority support. 
                Experience meetings like never before.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                  Upgrade Now
                </button>
                <button className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20">
                  Learn More
                </button>
              </div>
              <div className="flex items-center gap-6 mt-6 text-blue-200 text-sm">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  HD Recording
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  No limits
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  24/7 Support
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center p-8">
              <img
                src="/mobile.png"
                alt="MeetFlow Pro"
                className="h-64 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <img src="/logo192.png" alt="" className="h-10 mx-auto mb-3 opacity-80" />
            <p className="text-sm font-semibold text-gray-700">Cross Platform</p>
            <p className="text-xs text-gray-400 mt-1">Works on all devices</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <img src="/logo512.png" alt="" className="h-10 mx-auto mb-3 opacity-80" />
            <p className="text-sm font-semibold text-gray-700">HD Quality</p>
            <p className="text-xs text-gray-400 mt-1">Crystal clear video</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <img src="/logo192.png" alt="" className="h-10 mx-auto mb-3 opacity-80" />
            <p className="text-sm font-semibold text-gray-700">Secure</p>
            <p className="text-xs text-gray-400 mt-1">End-to-end encrypted</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <img src="/logo512.png" alt="" className="h-10 mx-auto mb-3 opacity-80" />
            <p className="text-sm font-semibold text-gray-700">Free</p>
            <p className="text-xs text-gray-400 mt-1">No hidden charges</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <img src="/logo3.png" alt="" className="h-4 w-4 brightness-0 invert" />
                </div>
                <span className="font-bold text-gray-900">MeetFlow</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                High-quality video meetings for everyone. No download required, start instantly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-blue-600 transition-colors">Features</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Pricing</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Integrations</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Changelog</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-blue-600 transition-colors">About</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Blog</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Careers</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-blue-600 transition-colors">Privacy</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Terms</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Security</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Cookies</button></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-4">
            <p className="text-xs text-gray-400">&copy; 2026 MeetFlow. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="GitHub">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
