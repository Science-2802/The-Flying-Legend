/**
 * World-matched, low-occlusion perimeter HUD
 * Overlays score, level badges, coin balance, and audio controls
 */

import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Pause, Play, Coins } from 'lucide-react';
import { LevelConfig } from '../types';
import { soundEngine } from '../utils/audio';

interface HUDProps {
  score: number;
  coins: number;
  currentLevel: LevelConfig;
  isPaused: boolean;
  isBonusRound: boolean;
  onTogglePause: () => void;
  onAudioChange: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  coins,
  currentLevel,
  isPaused,
  isBonusRound,
  onTogglePause,
  onAudioChange,
}) => {
  const isMuted = soundEngine.getIsMuted();
  const isVoiceMuted = soundEngine.getIsVoiceMuted();

  const handleToggleSFX = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.setMuted(!isMuted);
    onAudioChange();
  };

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.setVoiceMuted(!isVoiceMuted);
    onAudioChange();
  };

  const handlePauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePause();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3.5 sm:p-5 select-none">
      {/* Top Bar: Level, Score, Controls */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Level Pill & Theme */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isBonusRound ? '⭐ BONUS RUSH' : `LVL ${currentLevel.level}`}
            </span>
            <span className="text-xs text-white/60">·</span>
            <span className="text-xs font-medium text-amber-300">
              {isBonusRound ? 'Coin Storm' : currentLevel.name}
            </span>
          </div>

          {/* Coin Counter */}
          <div className="flex items-center gap-1.5 bg-slate-900/70 border border-white/10 px-2.5 py-1 rounded-lg w-fit">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold font-mono tabular-nums text-amber-300">
              {coins}
            </span>
          </div>
        </div>

        {/* Center: Big Flappy Score */}
        <div className="flex flex-col items-center">
          <span
            className="text-5xl sm:text-6xl font-black font-mono tabular-nums text-white tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] stroke-black"
            style={{
              WebkitTextStroke: '2px #0f172a',
            }}
          >
            {score}
          </span>
          {isBonusRound && (
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
              Golden Coins Shower
            </span>
          )}
        </div>

        {/* Right: Sound & Pause Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* SFX Mute */}
          <button
            onClick={handleToggleSFX}
            title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-white hover:bg-slate-800 transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Voice Quips Mute */}
          <button
            onClick={handleToggleVoice}
            title={isVoiceMuted ? 'Enable "Rithik" Voice' : 'Mute Voice Quips'}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-white hover:bg-slate-800 transition active:scale-95"
          >
            {isVoiceMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={handlePauseClick}
            title={isPaused ? 'Resume' : 'Pause'}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-white hover:bg-slate-800 transition active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* Bottom Hint on Mobile */}
      <div className="flex justify-center pb-2">
        <span className="text-[11px] font-medium text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
          Tap anywhere or press Space to fly
        </span>
      </div>
    </div>
  );
};
