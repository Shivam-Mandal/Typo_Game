import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

function Lobby({ setUsername, setInGame }) {
  const [name, setName] = useState('');
  const socket = useSocket();

  const handleJoin = () => {
    if (name.trim() && socket) {
      socket.emit('join_game', { username: name });
      setUsername(name);
      setInGame(true);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('player_joined', (data) => {
      console.log(`${data.username} joined the lobby`);
    });
    return () => socket.off('player_joined');
  }, [socket]);

  return (
    <div className="flex flex-col gap-4 p-4 items-center">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your name"
        className="p-2 border rounded"
      />
      <button onClick={handleJoin} className="bg-blue-500 px-4 py-2 text-white rounded">
        Join Game
      </button>
    </div>
  );
}

export default Lobby;