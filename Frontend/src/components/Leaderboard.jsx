import React from 'react';

const Leaderboard = ({ leaderboard,showLeaderboard, startTime }) => {
  console.log(leaderboard)
  if (!leaderboard || leaderboard.length === 0) {
    return <p>No leaderboard data available.</p>;
  }
  return (
    <>
      {showLeaderboard && (
        <div className="mt-6 p-6 border-2 border-gray-700 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">🏆 Leaderboard Table</h2>
          <ul className="list-none p-0">
            {leaderboard.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center justify-between py-3 px-6 mb-3 rounded-lg bg-gray-800 text-white shadow-md hover:scale-105 transform transition duration-300"
              >
                <span className="text-lg font-medium">{index + 1}. {player.username}</span>
                <span className="text-lg font-semibold text-yellow-400">{player.wpm} WPM</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Leaderboard;
