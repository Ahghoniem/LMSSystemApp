import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const VoiceMessage = ({ audioSrc , senderid,tokenId}) => {
  const audioRef = useRef(new Audio(audioSrc));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    audio.currentTime = Number(e.target.value);
    setCurrentTime(audio.currentTime);
  };

  const handleSpeedChange = () => {
    const audio = audioRef.current;
    const speeds = [0.5, 1, 1.5, 2];
    const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
    audio.playbackRate = speeds[nextIndex];
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
    <button
        onClick={togglePlay}
        className={`flex items-center justify-center w-12 h-12   ${senderid === tokenId ? 'text-white':'text-gray-500'} rounded-full cursor-pointer transition`}
      >
        {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
      </button>

      <div className="flex flex-1 flex-col voiceNote">
        <input
          type="range"
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 rounded-xl  -mb-4 bg-white cursor-pointer voiceMessageInput"
        />
      <div className={`text-xs ${senderid === tokenId ? 'text-white':'text-gray-700'} relative -bottom-8 text-right `}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <button
        onClick={handleSpeedChange}
        className={`text-sm px-3 py-1 border-0 border-gray-100  rounded-full ${senderid === tokenId ? 'text-white':'text-gray-700'}`}
      >
        {speed}x
      </button>
    </>
  );
};

export default VoiceMessage;
