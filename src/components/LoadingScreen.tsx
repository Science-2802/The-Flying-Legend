/**
 * Full-Viewport Splash & Loading Screen
 * Displayed before the game runs on any device.
 * Features "CREATED BY SK" heading, the SK Games Mobile logo,
 * real asset preloading, progress bar, and user gesture unlock for audio.
 */

import React, { useState, useEffect } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface LoadingScreenProps {
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing SK Engine...');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload critical assets while showing loading bar
    const charImg = new Image();
    charImg.src = '/assets/aistudio/image_921c49ee.png';

    const cityImg = new Image();
    cityImg.src = '/assets/aistudio/image_f773f1c0.png';

    const skImg = new Image();
    skImg.src = '/assets/aistudio/image_4a61a493.png';

    // Preload and decode user voice recording
    soundEngine.preloadUserVoice();

    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds clean splash duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 25) {
        setStatusText('Loading Character & Flight Assets...');
      } else if (pct < 55) {
        setStatusText('Configuring "Rithik!" Voice Clips...');
      } else if (pct < 85) {
        setStatusText('Synthesizing Obstacle Physics & Levels...');
      } else {
        setStatusText('SK Game Engine Ready!');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsLoaded(true);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const handleEnterGame = () => {
    soundEngine.unlockAudio();
    soundEngine.playBonusStart();
    onFinish();
  };

  return (
    <div
      onClick={isLoaded ? handleEnterGame : undefined}
      className="fixed inset-0 z-[100] w-screen h-screen bg-slate-950 text-white select-none overflow-hidden flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Dynamic Cyber Atmosphere Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Prominent "CREATED BY SK" Heading */}
      <header className="pt-6 sm:pt-10 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-[0.25em] uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          OFFICIAL PRESENTATION
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-wider uppercase font-sans text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400 drop-shadow-[0_4px_20px_rgba(6,182,212,0.6)]">
          CREATED BY SK
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 mt-1 uppercase">
          SK GAMES MOBILE · ORIGINAL ARCADE
        </p>
      </header>

      {/* Center Section: SK Games Mobile Emblem */}
      <main className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-sm mx-auto">
        <div
          className={`relative p-5 sm:p-6 rounded-3xl bg-white shadow-[0_0_50px_rgba(6,182,212,0.4)] border-2 border-cyan-400 transition-all duration-500 ${
            isLoaded ? 'scale-105 shadow-[0_0_60px_rgba(6,182,212,0.6)]' : 'scale-100'
          }`}
        >
          {/* Cyber Accent Marks */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          <img
            src="/assets/aistudio/image_4a61a493.png"
            alt="SK Games Mobile Logo"
            className="w-56 sm:w-64 h-auto object-contain drop-shadow"
          />
        </div>

        <span className="mt-5 text-xs font-black tracking-[0.2em] text-cyan-400/90 uppercase">
          POWERED BY SK MOBILE ENGINE
        </span>
      </main>

      {/* Bottom Section: Progress Bar or Enter Button */}
      <footer className="w-full max-w-sm mx-auto z-10 pb-6 sm:pb-10 flex flex-col items-center">
        {!isLoaded ? (
          <div className="w-full flex flex-col items-center">
            {/* Status Text and Percentage */}
            <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 mb-2">
              <span className="text-xs font-mono text-cyan-300 truncate max-w-[240px]">
                {statusText}
              </span>
              <span className="font-mono font-bold tabular-nums text-cyan-400">
                {progress}%
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2.5 bg-slate-900 border border-cyan-500/30 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={handleEnterGame}
              className="mt-3 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition py-1 px-3 rounded-full hover:bg-white/5"
            >
              Skip Loading →
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
            <button
              onClick={handleEnterGame}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-98 transition flex items-center justify-center gap-2.5 border border-white/40"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              ENTER GAME
            </button>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              Tap anywhere or press Space to start
            </span>
          </div>
        )}
      </footer>
    </div>
  );
};
