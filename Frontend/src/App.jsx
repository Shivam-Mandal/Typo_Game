import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TypingBox from './components/TypingBox';
import Progress from './components/Progress';
import Leaderboard from './components/Leaderboard';

// const socket = io('http://localhost:5000');
// const socket = io('https://typospeed.vercel.app');
const socket = io('https://typospeedpro.onrender.com', {
  transports: ["websocket", "polling"],
  withCredentials: true
});


const App = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [action, setAction] = useState(null);  
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [start, setStart] = useState(false);
  const [sampleText, setSampleText] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [startTime, setStartTime] = useState(60);
  const [userId, setUserId] = useState('');
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let storedId = localStorage.getItem('userId');
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem('userId', storedId);
    }
    setUserId(storedId);
  }, []);

  useEffect(() => {
    const savedRoom = localStorage.getItem('roomId');
    const savedUser = localStorage.getItem('username');
    const savedUserId = localStorage.getItem('userId')

    if (savedRoom && savedUser) {
      if (socket.connected) {
        socket.emit('joinRoom', { roomId: savedRoom, username: savedUser, userId: savedUserId });
        setRoomId(savedRoom);
        setUsername(savedUser);
        setJoined(true);
      } else {
        socket.on('connect', () => {
          socket.emit('joinRoom', { roomId: savedRoom, username: savedUser, userId: savedUserId });
          setRoomId(savedRoom);
          setUsername(savedUser);
          setJoined(true);
        });
      }
    }
    socket.on('finishTime', (time) => setStartTime(time))
    socket.on('countdown', (time) => setCountdown(time));
    socket.on('roomUpdate', (updatePlayers) => setPlayers(updatePlayers));
    socket.on('startTyping', ({ text }) => {
      setProgress(0)
      setSampleText(text);
      setCountdown(null);
      setStart(true);
      setShowLeaderboard(false);
    });
    socket.on('createRoom', ({ roomId, userId }) => {
      setRoomId(roomId);
      setJoined(true);
      setIsHost(true);
      localStorage.setItem('roomId', roomId);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
    });
    socket.on('endMatch', (finalLeaderboard) => {
      setStart(false);
      setShowLeaderboard(true);
      console.log(finalLeaderboard)
      setLeaderboard(finalLeaderboard);
      setProgress(0)

    });
    socket.on('errorMsg', (msg) => {
      alert(msg);
      setJoined(false);
      localStorage.removeItem('username');
      localStorage.removeItem('roomId');
    });
    socket.on('disconnect', () => {
      console.log('User disconnected. Attempting reconnect...');
    });
    socket.on('updateStartTime', (time) => {
      console.log(time);
      setStartTime(time);
    })

    return () => {
      socket.off('roomUpdate');
      socket.off('startTyping');
      socket.off('countdown');
      socket.off('errorMsg');
      socket.off('disconnect');
      socket.off('connect');
      socket.off('createRoom');
      socket.off('updateStartTime');
      socket.off('finishTime');
      socket.off('endMatch')
    };
  }, []);

  const handleJoin = () => {
    const trimmedRoomId = roomId.trim();
    const trimmedUsername = username.trim();
    if (trimmedRoomId && trimmedUsername) {
      localStorage.setItem('roomId', trimmedRoomId);
      localStorage.setItem('username', trimmedUsername);
      socket.emit('joinRoom', { roomId: trimmedRoomId, username: trimmedUsername, userId });
      setJoined(true);
      setIsHost(false);
    } else {
      alert('Please enter room ID and username');
    }
  };

  const startMatch = () => {
    if (!isHost) return alert('Only host can start the match');
    socket.emit('startMatch', roomId);
    setStartTime(startTime)
    setProgress(0)
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { roomId });
    localStorage.removeItem('roomId');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setJoined(false);
    setStart(false);
    setPlayers([]);
    setRoomId('');
    setUsername('');
  };

  const handleCreateRoom = () => {
    if (!username.trim()) return alert('Please enter username first');
    socket.emit('createRoom', { username: username.trim(), userId });
  };

  const handleButtonClicked = (time) => {
    setStartTime(time)
    socket.emit('startTime', { roomId, time })
    // console.log(time);

  }
  return (
    <div className="  bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen font-sans bg-no-repeat w-full bg-cover overflow-hidden scroll-smooth absolute" style={{ backgroundImage: `url('bg_img_2.jpg')` }}>
      <div className="bg-gray-800/40 backdrop-blur shadow-md pt-5 px-4 pb-4 md:px-16 md:pb-16 text-white min-h-screen">

        {/* <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest mb-7 text-center text-cyan-700"> */}
        <img src="typo_bg.png" alt="" className='mx-auto w-30 md:w-30 object-contain mb-5' />
        {/* </h1> */}
        {!joined && (<div className="text-center font-extrabold text-7xl mb-10">
          <span className="inline-block mb-4  text-white">Increase your typing speed while playing Games...</span>
          <div className="flex justify-center gap-8">
            {/* <img src=".\src\assets\typing_game_icon.png" alt="Typing Speed" className="w-24 h-24 md:w-32 md:h-32 transition-all transform hover:scale-110" /> */}
            <div className="text-center">
              <p className="text-2xl font-semibold  text-white">Challenge yourself and compete with players around the world!</p>
              <p className="mt-2 text-lg  text-white">Start typing fast and test your limits. Let's see if you can beat the best!</p>
            </div>
          </div>
        </div>)}
        {!joined ? (
          <div className="max-w-md mx-auto bg-gray-800/70 rounded-xl shadow-xl p-8 space-y-6 backdrop-blur">
            {action === null ? (

              <div className="flex flex-col gap-4">

                <button
                  onClick={() => setAction('create')}
                  className="bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200 px-6 py-3 rounded-lg font-semibold cursor-pointer"
                >
                  Create Room or Play Individual
                </button>
                <button
                  onClick={() => setAction('join')}
                  className="bg-emerald-600 hover:bg-emerald-500 transition-colors duration-200 px-6 py-3 rounded-lg font-semibold cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {action !== 'create' && (
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                )}
                <input
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {action === 'create' ? (
                  <button
                    onClick={handleCreateRoom}
                    className="bg-purple-600 hover:bg-purple-500 transition px-6 py-2 rounded-md w-full cursor-pointer"
                  >
                    Create Room or Play Individual
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="bg-green-600 hover:bg-green-500 transition px-6 py-2 rounded-md w-full cursor-pointer"
                  >
                    Join Room
                  </button>
                )}
                <button
                  onClick={() => setAction(null)}
                  className="bg-gray-700 hover:bg-gray-600 transition px-6 py-2 rounded-md w-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gray-800/20 rounded-lg shadow-md p-6 backdrop-blur">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-lg">Room ID: <span className="font-semibold text-yellow-300">{roomId}</span></p>
                  <p className="text-sm text-gray-300">(Invite others with this ID)</p>
                  <p className="text-md mt-2">You are {isHost ? 'Host' : 'Player'}: <strong className="text-green-300">{username}</strong></p>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="bg-gray-700 hover:bg-red-500 transition px-5 py-2 rounded-md font-medium cursor-pointer"
                >
                  Leave Room
                </button>
              </div>
            </div>

            {isHost && (
              <>
                <div className="flex justify-center gap-4 flex-wrap">
                  {[10, 30, 60].map(time => (
                    <button
                      key={time}
                      className={`px-5 py-2 rounded-lg font-semibold transition cursor-pointer
                ${startTime === time ? 'bg-yellow-600 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                      onClick={() => handleButtonClicked(time)}
                    >
                      {time} sec
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <button
                    onClick={startMatch}
                    className="bg-indigo-700 hover:bg-indigo-600 transition px-6 py-2 rounded-lg font-bold tracking-wide cursor-pointer"
                  >
                    Start Match
                  </button>
                </div>
              </>
            )}

            {countdown !== null && (
              <h2 className="text-xl text-center font-bold animate-ping">
                {countdown}
              </h2>
            )}
            {start && (
              <TypingBox socket={socket} roomId={roomId} sampleText={sampleText} disabled={countdown && countdown > 0} startTime={startTime} />
            )}

           {players.length > 1 ? (
              showLeaderboard && startTime ? (
                  <Leaderboard leaderboard={leaderboard} showLeaderboard={showLeaderboard} startTime={startTime} />
            ) : (
              <p className="text-xl">Leaderboard is waiting for match to finish...</p>
            )
          ) : null}
            

          </div>
        )}
      </div>

    </div>

  );
};

export default App;
