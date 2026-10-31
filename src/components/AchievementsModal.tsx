/**
 * Seasonal Achievement Challenges Modal
 * Competitive milestone challenges with coin prizes and special unlocks
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { X, Award, Check, Sparkles, Trophy, Zap, Shield, Feather, Volume2, Coins, Heart } from 'lucide-react';
import { PlayerProfile, SeasonalChallenge } from '../types';
import { INITIAL_SEASONAL_CHALLENGES } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface AchievementsModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onClaimReward: (challengeId: string, rewardCoins: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  profile,
  onClose,
  onClaimReward,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Feather': return <Feather className="w-4 h-4 text-emerald-400" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-cyan-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Coins': return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Trophy':
      default: return <Trophy className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleClaim = (ch: SeasonalChallenge) => {
    soundEngine.playBonusStart();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    onClaimReward(ch.id, ch.rewardCoins);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-black text-white tracking-tight leading-none">
                SEASON 1 CHALLENGES
              </h2>
              <span className="text-[11px] text-slate-400">
                Monsoon Flight Season · Ends in 24 days
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Challenge List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1 custom-scrollbar">
          {INITIAL_SEASONAL_CHALLENGES.map(ch => {
            const savedState = profile.challenges[ch.id];
            const current = savedState ? savedState.current : 0;
            const isClaimed = savedState ? savedState.claimed : false;
            const isCompleted = current >= ch.target;
            const progressPct = Math.min(100, Math.round((current / ch.target) * 100));

            return (
              <div
                key={ch.id}
                className={`p-3 rounded-2xl border transition ${
                  isClaimed
                    ? 'bg-slate-900/40 border-white/5 opacity-60'
                    : isCompleted
                    ? 'bg-cyan-950/40 border-cyan-500/40 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-800/50 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 border border-white/10 shrink-0 mt-0.5">
                      {getIcon(ch.icon)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {ch.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward & Button */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-black font-mono text-amber-300">
                      +{ch.rewardCoins} 🪙
                    </span>

                    {isClaimed ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-1.5">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleClaim(ch)}
                        className="mt-1.5 py-1 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] shadow transition active:scale-95 animate-bounce"
                      >
                        CLAIM!
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                        {current} / {ch.target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? 'bg-cyan-400' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/5 text-center">
          <span className="text-[11px] text-slate-400">
            Complete challenges to unlock rare wings and dominate the leaderboard!
          </span>
        </div>
      </div>
    </div>
  );
};
