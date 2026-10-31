/**
 * Title Screen: Full-viewport Game Shell start menu
 * Displays hero character centerpiece, quick start CTA, and feature buttons
 */

import React from 'react';
import { Play, User, Gift, Award, ShoppingBag, Volume2, Sparkles } from 'lucide-react';
import { PlayerProfile, LevelConfig } from '../types';
import { soundEngine } from '../utils/audio';

interface TitleScreenProps {
  profile: PlayerProfile;
  currentLevel: LevelConfig;
  hasUnclaimedDaily: boolean;
  onStartGame: () => void;
  onOpenProfile: () => void;
  onOpenDailyRewards: () => void;
  onOpenAchievements: () => void;
  onOpenShop: () => void;
  onShowLoadingScreen: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  hasUnclaimedDaily,
  onStartGame,
  onOpenProfile,
  onOpenDailyRewards,
  onOpenAchievements,
  onOpenShop,
  onShowLoadingScreen,
}) => {
  const handleTestVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.unlockAudio();
    soundEngine.triggerBarrierQuip();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 bg-gradient-to-b from-black/60 via-black/40 to-black/80 backdrop-blur-xs select-none">
      {/* Top Header info */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-lg">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400">
            <img
              src="/assets/aistudio/image_921c49ee.png"
              alt="Rithik"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <span className="text-xs font-bold text-amber-300">
            {profile.username}
          </span>
          <span className="text-xs text-white/40">·</span>
          <span className="text-xs font-mono text-amber-200">
            💰 {profile.coins}
          </span>
        </div>

        {/* High Score Pill */}
        <div className="bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl text-right">
          <span className="text-[10px] uppercase font-bold text-white/60 block">Best Record</span>
          <span className="text-sm font-black font-mono tabular-nums text-white">
            {profile.highScore} PTS
          </span>
        </div>
      </div>

      {/* Hero Centerpiece: Game Title & Avatar */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-sm mx-auto">
        {/* Animated Flying Avatar Preview */}
        <div className="relative mb-4 group cursor-pointer" onClick={handleTestVoice}>
          {/* Radiant Halo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 to-rose-500/30 rounded-full blur-xl animate-pulse" />

          {/* Character Avatar */}
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-400 to-amber-200 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-white">
              <img
                src="/assets/aistudio/image_921c49ee.png"
                alt="Rithik Primary Character"
                className="w-full h-full object-cover scale-110 object-top"
              />
            </div>
            {/* Crown badge */}
            <span className="absolute -top-2 -right-1 text-xl animate-bounce">
              👑
            </span>
          </div>

          <button
            onClick={handleTestVoice}
            className="mt-2 text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1 mx-auto hover:text-amber-200 bg-black/50 px-2 py-0.5 rounded-full border border-amber-500/20"
          >
            <Volume2 className="w-3 h-3" />
            Say "Rithik!"
          </button>
        </div>

        {/* Game Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] font-sans">
          THE FLYING <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">LEGEND</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-200/90 mt-1 max-w-xs">
          Fly through obstacles, hear the iconic voice clips, and claim daily glory!
        </p>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          className="mt-6 w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold text-base tracking-wide shadow-[0_10px_25px_rgba(244,63,94,0.4)] active:scale-98 transition flex items-center justify-center gap-2 border border-white/20"
        >
          <Play className="w-5 h-5 fill-white" />
          START FLAPPING
        </button>

        <span className="text-[11px] font-medium text-white/60 mt-2">
          Tap Screen · Spacebar Jump · Esc Pause
        </span>
      </div>

      {/* Bottom Hub Actions: Profile, Daily, Challenges, Shop */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-md mx-auto pt-2">
        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/10 text-white transition active:scale-95 group"
        >
          <User className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
          <span className="text-[11px] font-bold mt-1 text-slate-200">Profile</span>
        </button>

        {/* Daily Rewards */}
        <button
          onClick={onOpenDailyRewards}
          className="relative flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/10 text-white transition active:scale-95 group"
        >
          {hasUnclaimedDaily && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          )}
          {hasUnclaimedDaily && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border border-white" />
          )}
          <Gift className="w-5 h-5 text-rose-400 group-hover:scale-110 transition" />
          <span className="text-[11px] font-bold mt-1 text-slate-200">Daily Gift</span>
        </button>

        {/* Seasonal Challenges */}
        <button
          onClick={onOpenAchievements}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/10 text-white transition active:scale-95 group"
        >
          <Award className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
          <span className="text-[11px] font-bold mt-1 text-slate-200">Quests</span>
        </button>

        {/* Wardrobe / Shop */}
        <button
          onClick={onOpenShop}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/10 text-white transition active:scale-95 group"
        >
          <ShoppingBag className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
          <span className="text-[11px] font-bold mt-1 text-slate-200">Wings Shop</span>
        </button>
      </div>

      {/* SK Games Studio Watermark Badge */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onShowLoadingScreen}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold tracking-widest uppercase transition group shadow-sm active:scale-95"
          title="View Studio Intro"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:animate-ping" />
          CREATED BY SK · SK GAMES MOBILE
        </button>
      </div>
    </div>
  );
};
