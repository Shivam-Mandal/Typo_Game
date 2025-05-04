import React, { useState, useEffect } from 'react';

const TypingBox = ({ socket, roomId, sampleText, disabled, startTime }) => {
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [remainingTime,setRemainingTime] = useState(startTime)
  useEffect(() => {
    setTimer(Date.now());
    setInput('');
    setWordCount(0);
    setRemainingTime(startTime)
    const rem = setInterval(()=>{
      setRemainingTime(prevtime=>{
        if(prevtime<=1){
          clearInterval(rem);
          return 0;
        }
        return prevtime - 1;
      })
    },1000)
    return ()=>clearInterval(rem)
  }, [sampleText]);
  

  const handleChange = (e) => {
    const value = e.target.value;
    const expectedWords = sampleText.split(' ');
    const currentWord = expectedWords[wordCount] || '';

    if (value.endsWith(' ')) {
      const typedWord = value.trim();

      if (typedWord === currentWord) {
        if (wordCount === 0) {
          setTimer(Date.now());
        }

        const newWordCount = wordCount + 1;
        setWordCount(newWordCount);

        const elapsed = (Date.now() - timer) / 1000 / 60; 
        const wpm = Math.round(newWordCount / elapsed);
        const progress = Math.min(100, Math.round((newWordCount / expectedWords.length) * 100));

        socket.emit('updateWPM', { roomId, wpm, progress });
        setInput('');
      } else {
        setInput(value);
      }
    } else {
      setInput(value);
    }
  };
  const renderColoredSampleText = () => {
    const typedWords = input.trim().split(' ');
    const expectedWords = sampleText.trim().split(' ');

    return expectedWords.map((word, index) => {
      let colorClass = 'text-gray-300'; 
      // console.log('index',index)
      // console.log('wordcount',wordCount)
      // console.log('word',word)
      if (index < wordCount) {
        colorClass = 'text-green-600'; 
      } else if (index === wordCount) {
        const currentTyped = input.trim();
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
      <p className='my-3 text-center font-mono text-yellow-600'>{remainingTime}</p>
      <div className="bg-gray-800/50 rounded-lg shadow-md p-6 backdrop-blur mb-5">
      <p className="mb-2 font-mono text-lg leading-relaxed flex flex-wrap gap-x-2">{renderColoredSampleText()}</p>
      </div>
      <textarea
        value={input}
        onChange={handleChange}
        rows="6"
        className="w-full border p-2 font-mono text-white bg-gray-800 border-gray-600 rounded"
        disabled={disabled || wordCount >= sampleText.split(' ').length || remainingTime===0}
        placeholder='Start typing here...'
      />
    </div>
  );
};

export default TypingBox;
