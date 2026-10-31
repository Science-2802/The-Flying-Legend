/**
 * Custom Game Over Screen
 * Features the character crying/dizzy avatar with comic dialogue balloon saying
 * 'Vittu pogatha rithik ' in a funny tone, score breakdown, and quick restart.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Volume2, Trophy, Coins, Zap } from 'lucide-react';
import { LevelConfig } from '../types';
import { soundEngine } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  coinsEarned: number;
  level: LevelConfig;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  coinsEarned,
  level,
  onRestart,
  onHome,
}) => {
  const isNewHighScore = score > 0 && score >= highScore;

  // Trigger high score celebration confetti
  useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isNewHighScore]);

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.unlockAudio();
    soundEngine.triggerGameOverQuip();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Comic Dialogue Balloon */}
        <div className="relative mb-3 bg-white text-slate-900 py-2 px-4 rounded-2xl shadow-lg border-2 border-rose-400 animate-bounce">
          <p className="text-base sm:text-lg font-black tracking-tight text-rose-600">
            "Vittu pogatha Rithik! 😭💔"
          </p>
          <span className="text-[11px] font-medium text-slate-500 block">
            (Don't leave me, Rithik!)
          </span>
          {/* Comic balloon tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-rose-400 rotate-45" />
        </div>

        {/* Character Avatar with Comical Crying Animation */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-amber-400 to-rose-400 shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-white relative">
              <img
                src="/assets/aistudio/image_921c49ee.png"
                alt="Rithik"
                className="w-full h-full object-cover scale-125 object-top grayscale-25"
              />
              {/* Comical Tear Emoji Overlay */}
              <span className="absolute bottom-1 right-1 text-xl animate-pulse">
                💧
              </span>
            </div>
          </div>
          {/* Replay Voice button */}
          <button
            onClick={handleReplayVoice}
            className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-800 border border-white/20 text-amber-300 hover:text-amber-200 transition shadow"
            title="Hear voice again"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Game Over Title */}
        <h2 className="text-2xl font-black text-white tracking-tight mt-1">
          {isNewHighScore ? '🎉 NEW BEST RECORD!' : 'GAME OVER!'}
        </h2>
        <p className="text-xs text-slate-400">
          Stopped by the obstacles! Ready for another flight?
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full my-4">
          {/* Run Score */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/5 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Score
            </span>
            <span className="text-3xl font-black font-mono tabular-nums text-white mt-0.5">
              {score}
            </span>
          </div>

          {/* Best Record */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Best
              </span>
            </div>
            <span className="text-3xl font-black font-mono tabular-nums text-amber-400 mt-0.5">
              {highScore}
            </span>
          </div>

          {/* Coins Earned */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between px-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Coins
            </span>
            <span className="text-sm font-bold font-mono text-amber-300">
              +{coinsEarned}
            </span>
          </div>

          {/* Level Reached */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between px-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Level
            </span>
            <span className="text-xs font-bold text-slate-200">
              Lvl {level.level}
            </span>
          </div>
        </div>

        {/* Actions: Restart & Menu */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold text-sm tracking-wide shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            FLY AGAIN (SPACE / TAP)
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-white/10 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
