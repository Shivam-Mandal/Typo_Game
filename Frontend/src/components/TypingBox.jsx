// import React, { useState, useEffect } from 'react';

// const TypingBox = ({ socket, roomId, sampleText, disabled, startTime }) => {
//   const [input, setInput] = useState('');
//   const [timer, setTimer] = useState(null);
//   const [wordCount, setWordCount] = useState(0);
//   const [remainingTime,setRemainingTime] = useState(startTime)
//   const [wordPerMin,setWordPerMin] = useState(0);
//   useEffect(() => {
//     setTimer(Date.now());
//     setInput('');
//     setWordCount(0);
//     setRemainingTime(startTime)
//     setWordPerMin(0)
//     const rem = setInterval(()=>{
//       setRemainingTime(prevtime=>{
//         if(prevtime<=1){
//           clearInterval(rem);
//           return 0;
//         }
//         return prevtime - 1;
//       })
//     },1000)
//     return ()=>clearInterval(rem)
//   }, [sampleText]);


//   const handleChange = (e) => {
//     const value = e.target.value;
//     const expectedWords = sampleText.split(' ');
//     const currentWord = expectedWords[wordCount] || '';

//     if (value.endsWith(' ')) {
//       const typedWord = value.trim();

//       if (typedWord === currentWord) {
//         if (wordCount === 0) {
//           setTimer(Date.now());
//         }

//         const newWordCount = wordCount + 1;
//         setWordCount(newWordCount);

//         const elapsed = (Date.now() - timer) / 1000 / 60; 
//         const wpm = Math.round(newWordCount / elapsed);
//         setWordPerMin(wpm)
//         const progress = Math.min(100, Math.round((newWordCount / expectedWords.length) * 100));

//         socket.emit('updateWPM', { roomId, wpm, progress });
//         setInput('');
//       } else {
//         setInput(value);
//       }
//     } else {
//       setInput(value);
//     }
//   };
//   const renderColoredSampleText = () => {
//     const typedWords = input.trim().split(' ');
//     const expectedWords = sampleText.trim().split(' ');

//     return expectedWords.map((word, index) => {
//       let colorClass = 'text-gray-300'; 
//       // console.log('index',index)
//       // console.log('wordcount',wordCount)
//       // console.log('word',word)
//       if (index < wordCount) {
//         colorClass = 'text-green-600'; 
//       } else if (index === wordCount) {
//         const currentTyped = input.trim();
//         if (word.startsWith(currentTyped)) {
//           colorClass = 'text-yellow-400'; 
//         } else {
//           colorClass = 'text-red-500'; 
//         }
//       }

//       return (
//         <span key={index} className={`${colorClass} mr-2`}>
//           {word}
//         </span>
//       );
//     });
//   };

//   return (
//     <div className="mt-4">
//       <p className='my-3 text-center font-mono text-yellow-600'>Time: {remainingTime}</p>
//       <div className="bg-gray-800/50 rounded-lg shadow-md p-6 backdrop-blur mb-5">
//       <p className="mb-2 font-mono text-lg leading-relaxed flex flex-wrap gap-x-2">{renderColoredSampleText()}</p>
//       </div>
//       <textarea
//         value={input}
//         onChange={handleChange}
//         rows="6"
//         className="w-full border p-2 font-mono text-white bg-gray-800 border-gray-600 rounded"
//         disabled={disabled || wordCount >= sampleText.split(' ').length || remainingTime===0}
//         placeholder='Start typing here...'
//       />
//     </div>
//   );
// };

// export default TypingBox;



import React, { useState, useEffect } from 'react';

const TypingBox = ({ socket, roomId, sampleText, disabled, startTime }) => {
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(startTime);
  const [wordPerMin, setWordPerMin] = useState(0);

  // Reset everything when new text starts
  useEffect(() => {
    setInput('');
    setWordCount(0);
    setWordPerMin(0);
    setRemainingTime(startTime);
    setTimer(null);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sampleText, startTime]);

  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - timer) / 1000 / 60;
      const wpm = Math.round(wordCount / elapsed);
      setWordPerMin(wpm);
      const progress = Math.min(100, Math.round((wordCount / sampleText.trim().split(' ').length) * 100));
      socket.emit('updateWPM', { roomId, wpm, progress });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, wordCount]);

  const handleChange = (e) => {
    const value = e.target.value;
    const expectedWords = sampleText.trim().split(' ');
    const typedWords = value.trim().split(' ');

    const correctWords = typedWords.filter((word, idx) => word === expectedWords[idx]);
    const newWordCount = correctWords.length;

    if (!timer && value.length > 0) {
      setTimer(Date.now());
    }


    setInput(value);

    setWordCount(newWordCount);
  };

  const renderColoredSampleText = () => {
    const expectedWords = sampleText.trim().split(' ');
    const typedWords = input.trim().split(' ');

    return expectedWords.map((word, index) => {
      let colorClass = 'text-gray-300';

      if (index < wordCount) {
        colorClass = 'text-green-600';
        // setInput('')
      } else if (index === wordCount) {
        const currentTyped = typedWords[index] || '';
        if (word.startsWith(currentTyped)) {
          colorClass = 'text-yellow-400';
        } else {
          colorClass = 'text-red-500';
        }
      }

      return (
        <span key={index} className={`${colorClass} mr-2`}>
          {word}
        </span>
      );
    });
  };

  return (
    <div className="mt-4">
      <div className="flex justify-center">
        <div className="px-4 py-2 bg-gray-800 rounded text-center mx-auto mb-3 inline-block">
          <p className="text-xl font-bold font-mono text-green-500">Time: {remainingTime}</p>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg shadow-md p-6 backdrop-blur mb-5">
        <p className="mb-2 font-mono text-lg leading-relaxed flex flex-wrap gap-x-2">
          {renderColoredSampleText()}
        </p>
      </div>
      <textarea
        value={input}
        onChange={handleChange}
        rows="6"
        className="w-full border p-2 font-mono text-white bg-gray-800 border-gray-600 rounded"
        disabled={disabled || wordCount >= sampleText.split(' ').length || remainingTime === 0}
        placeholder="Start typing here..."
      />
    </div>
  );
};

export default TypingBox;
