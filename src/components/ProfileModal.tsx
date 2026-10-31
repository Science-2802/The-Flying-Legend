/**
 * Profile & Levels Modal
 * Allows players to edit their nickname, view level progression,
 * track career flight milestones, and inspect equipped gear.
 */

import React, { useState } from 'react';
import { X, User, Check, Zap, Trophy, Coins, Flame, Sparkles, Feather, Edit3 } from 'lucide-react';
import { PlayerProfile, LevelConfig } from '../types';
import { LEVELS, getLevelForScore } from '../utils/levels';
import { soundEngine } from '../utils/audio';

interface ProfileModalProps {
  profile: PlayerProfile;
  currentLevel: LevelConfig;
  onClose: () => void;
  onUpdateUsername: (newUsername: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onUpdateUsername,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeLevel = getLevelForScore(profile.highScore);
  const nextLevel = LEVELS.find(l => l.level === activeLevel.level + 1);

  const currentScore = profile.highScore;
  const currentLevelMin = activeLevel.minScore;
  const nextLevelMin = nextLevel ? nextLevel.minScore : activeLevel.minScore;
  const levelProgress = nextLevel
    ? Math.min(100, Math.round(((currentScore - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100))
    : 100;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      soundEngine.playClick();
      onUpdateUsername(nameInput.trim());
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[92vh] rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white tracking-tight uppercase">
              PILOT PROFILE & LEVELS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1 custom-scrollbar">
          {/* Pilot Identity Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-amber-500/30 flex items-center gap-4 relative">
            <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-400 to-amber-200 shadow-xl shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-white">
                <img
                  src="/assets/aistudio/image_921c49ee.png"
                  alt="Player Avatar"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-sm bg-slate-900 border border-amber-400/50 rounded-full px-1">
                ⭐
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={16}
                    placeholder="Enter Pilot Name"
                    className="bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg border border-amber-400 outline-none w-full font-bold"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white truncate">
                    {profile.username}
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setNameInput(profile.username);
                    }}
                    className="p-1 text-amber-300 hover:text-white transition"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {savedSuccess && (
                    <span className="text-[10px] text-emerald-400 font-bold">Saved!</span>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-300 mt-0.5">
                Current Rank: <strong className="text-amber-400">Lvl {activeLevel.level} - {activeLevel.name}</strong>
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                <span>Best: <strong className="text-white">{profile.highScore} PTS</strong></span>
                <span>·</span>
                <span>Coins: <strong className="text-amber-300">{profile.coins} 🪙</strong></span>
              </div>
            </div>
          </div>

          {/* Level Progression Progress Card */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Level {activeLevel.level} Progression
              </span>
              <span className="font-mono text-cyan-300">
                {nextLevel ? `${profile.highScore} / ${nextLevel.minScore} PTS` : 'MAX LEVEL ACHIEVED'}
              </span>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>

            <span className="text-[10px] text-slate-400">
              {nextLevel
                ? `Fly ${nextLevel.minScore - profile.highScore} more points to reach Level ${nextLevel.level}: ${nextLevel.name}!`
                : 'You are at the pinnacle speed of Godspeed Dimension!'}
            </span>
          </div>

          {/* All Levels Tier Map */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
              Flight Stages & Worlds
            </h4>
            <div className="space-y-1.5">
              {LEVELS.map(lvl => {
                const isUnlocked = profile.highScore >= lvl.minScore;
                const isCurrent = activeLevel.level === lvl.level;

                return (
                  <div
                    key={lvl.level}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/30'
                        : isUnlocked
                        ? 'bg-slate-800/40 border-white/5 text-slate-200'
                        : 'bg-slate-900/50 border-white/5 opacity-50 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-xs text-white border"
                        style={{
                          backgroundColor: lvl.pipeColor,
                          borderColor: lvl.pipeRimColor,
                        }}
                      >
                        {lvl.level}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {lvl.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lvl.theme} · Speed {lvl.pipeSpeed}x
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-300 block">
                        {lvl.minScore} PTS
                      </span>
                      <span className="text-[9px] font-bold uppercase">
                        {isCurrent ? (
                          <span className="text-amber-400">Current</span>
                        ) : isUnlocked ? (
                          <span className="text-emerald-400">Unlocked</span>
                        ) : (
                          <span className="text-slate-500">Locked</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Stats Grid */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
              Career Flight Stats
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                  <Trophy className="w-3 h-3 text-amber-400" /> High Score
                </span>
                <span className="text-xl font-black font-mono text-white mt-0.5">
                  {profile.highScore}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                  <Coins className="w-3 h-3 text-amber-400" /> Gold Earned
                </span>
                <span className="text-xl font-black font-mono text-amber-300 mt-0.5">
                  {profile.totalCoinsCollected || profile.coins}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3 text-rose-400" /> Daily Streak
                </span>
                <span className="text-xl font-black font-mono text-white mt-0.5">
                  {profile.streakDays} Days
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Barriers Passed
                </span>
                <span className="text-xl font-black font-mono text-white mt-0.5">
                  {profile.totalPipesPassed}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-98"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
