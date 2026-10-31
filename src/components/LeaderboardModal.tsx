/**
 * Leaderboard Modal
 * Shows how the player stacks up against friends and global competitors
 */

import React, { useState } from 'react';
import { X, Trophy, Users, Globe, Edit2, Check } from 'lucide-react';
import { PlayerProfile, LeaderboardEntry } from '../types';
import { getLeaderboard } from '../utils/storage';

interface LeaderboardModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onUpdateUsername: (newUsername: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  profile,
  onClose,
  onUpdateUsername,
}) => {
  const [tab, setTab] = useState<'friends' | 'global'>('friends');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);

  const entries: LeaderboardEntry[] = getLeaderboard(tab, profile);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateUsername(nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white tracking-tight">
              LEADERBOARD
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Profile strip with Editable Name */}
        <div className="flex items-center justify-between p-3 my-3 rounded-2xl bg-slate-800/80 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/60 bg-slate-700">
              <img
                src="/assets/aistudio/image_921c49ee.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={15}
                    className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-amber-400/50 outline-none w-28"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {profile.username}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Change Name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <span className="text-[11px] text-slate-400">
                Personal Best: <strong className="text-amber-300 font-mono">{profile.highScore} pts</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
            <span className="text-xs font-bold text-amber-400">
              {profile.highScore >= 30 ? 'Elite Aviator' : 'Challenger'}
            </span>
          </div>
        </div>

        {/* Tab Switcher: Friends vs Global */}
        <div className="flex p-1 bg-slate-950 rounded-xl mb-3 border border-white/5">
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'friends'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Friends ({entries.length})
          </button>
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'global'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Global Hall of Fame
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-72">
          {entries.map(entry => {
            const isTop3 = entry.rank <= 3;
            const rankBadge =
              entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  entry.isUser
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-800/40 border-white/5 text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 text-center font-black font-mono text-sm ${
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank === 2
                        ? 'text-slate-300'
                        : entry.rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {rankBadge}
                  </span>

                  <span className="text-lg">{entry.avatar}</span>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold flex items-center gap-1">
                      {entry.name}
                      {entry.isUser && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-black">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Lvl {entry.level} · {entry.badge}
                    </span>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right">
                  <span className="text-base font-black font-mono tabular-nums text-white">
                    {entry.score}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-1">
                    PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-white/5 text-center">
          <span className="text-[11px] text-slate-400">
            Scores update dynamically as you beat barriers in runs!
          </span>
        </div>
      </div>
    </div>
  );
};
