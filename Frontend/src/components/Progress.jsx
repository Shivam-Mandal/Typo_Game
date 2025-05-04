import React, { useEffect, useState } from "react";

const Progress = ({ players,progress, startTime }) => {
  const [resetProgress, setResetProgress] = useState(false);

  // Check if startTime is 0 and reset progress when necessary
  useEffect(() => {
    if (startTime === 0) {
      setResetProgress(true);
    } else {
      setResetProgress(false);
    }
  }, [startTime]);

  return (
    <div className="mt-6 space-y-4">
      {players.map((player) => (
        <div
          key={player.id}
          className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-white font-semibold text-lg">{player.username}</p>
            <span className="text-green-400 font-bold">{player.wpm} WPM</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${player.progress}%`,
              }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-400 mt-1">
            {resetProgress ? 0 : `${player.progress}%`}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Progress;
