import { useState, useRef, useEffect } from 'react';

export default function Chat({ socket, roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receive-message', handler);
    return () => socket.off('receive-message', handler);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('send-message', { roomId, message: input.trim() });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-white font-semibold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">
            No messages yet
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.userId === user?.id ? 'items-end' : 'items-start'
            }`}
          >
            <span className="text-xs text-gray-400 mb-1">{msg.name}</span>
            <div
              className={`px-3 py-2 rounded-lg max-w-[80%] break-words ${
                msg.userId === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
