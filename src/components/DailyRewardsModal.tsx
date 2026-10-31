/**
 * Daily Rewards Calendar Modal
 * Encourages player retention with 7-day streak bonuses, coins, and exclusive skins
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Check, Flame, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types';
import { DAILY_REWARDS_DATA, getTodayDateString } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface DailyRewardsModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onClaimDay: (day: number, coins: number) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  profile,
  onClose,
  onClaimDay,
}) => {
  const today = getTodayDateString();
  const canClaimToday = profile.lastClaimDate !== today;

  // The next day to claim in cycle 1..7
  const nextDayToClaim = (profile.claimedDailyDays.length % 7) + 1;

  const handleClaim = (day: number, rewardCoins: number) => {
    soundEngine.playBonusStart();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {}

    onClaimDay(day, rewardCoins);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-black text-white tracking-tight">
              DAILY REWARDS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streak Banner */}
        <div className="flex items-center justify-between p-3 my-3 rounded-2xl bg-gradient-to-r from-rose-950/60 to-amber-950/60 border border-rose-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-400/40">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {profile.streakDays} Day Flying Streak!
              </span>
              <span className="text-[11px] text-slate-300">
                Log in daily to unlock bonus gold and wings
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Rewards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 my-2">
          {DAILY_REWARDS_DATA.map(item => {
            const isClaimed = profile.claimedDailyDays.includes(item.day);
            const isCurrentTarget = item.day === nextDayToClaim && canClaimToday;
            const isSpecialDay7 = item.day === 7;

            return (
              <div
                key={item.day}
                className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition ${
                  isSpecialDay7 ? 'col-span-3 sm:col-span-2' : ''
                } ${
                  isClaimed
                    ? 'bg-slate-900/40 border-white/5 opacity-70'
                    : isCurrentTarget
                    ? 'bg-rose-500/20 border-rose-400 ring-2 ring-rose-500/40 animate-pulse'
                    : 'bg-slate-800/50 border-white/5'
                }`}
              >
                {/* Day Tag */}
                <span className="text-[10px] font-black uppercase text-slate-400 mb-1">
                  Day {item.day}
                </span>

                {/* Reward Graphic */}
                <span className="text-2xl my-1">
                  {item.day === 7 ? '👑' : item.day === 3 ? '🛡️' : item.day === 5 ? '🧲' : '💰'}
                </span>

                {/* Reward Label */}
                <span className="text-xs font-extrabold text-amber-300">
                  +{item.rewardCoins}
                </span>
                <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
                  {item.label}
                </span>

                {/* State Button */}
                {isClaimed ? (
                  <div className="mt-2 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Claimed
                  </div>
                ) : isCurrentTarget ? (
                  <button
                    onClick={() => handleClaim(item.day, item.rewardCoins)}
                    className="mt-2 py-1 px-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-black text-[11px] shadow transition active:scale-95"
                  >
                    CLAIM!
                  </button>
                ) : (
                  <span className="mt-2 text-[10px] font-medium text-slate-500">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Status Message */}
        <div className="pt-3 border-t border-white/5 text-center">
          <p className="text-xs text-slate-300">
            {canClaimToday ? (
              <span className="text-emerald-400 font-bold">
                🎁 You have a daily gift ready to claim!
              </span>
            ) : (
              <span className="text-slate-400">
                ✅ Today's reward claimed. Return tomorrow for Day {nextDayToClaim}!
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
