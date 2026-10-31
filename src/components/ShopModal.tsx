/**
 * Wardrobe / Shop Modal
 * Allows players to equip and purchase custom Wing Skins and Trail Effects using game coins
 */

import React, { useState } from 'react';
import { X, ShoppingBag, Check, Sparkles, Feather, Coins } from 'lucide-react';
import { PlayerProfile, WingSkinId, TrailId } from '../types';
import { WING_SKINS, TRAIL_EFFECTS } from '../utils/storage';
import { soundEngine } from '../utils/audio';

interface ShopModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onEquipSkin: (skinId: WingSkinId) => void;
  onBuySkin: (skinId: WingSkinId, price: number) => void;
  onEquipTrail: (trailId: TrailId) => void;
  onBuyTrail: (trailId: TrailId, price: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  profile,
  onClose,
  onEquipSkin,
  onBuySkin,
  onEquipTrail,
  onBuyTrail,
}) => {
  const [category, setCategory] = useState<'wings' | 'trails'>('wings');

  const handleBuySkin = (skin: (typeof WING_SKINS)[0]) => {
    if (profile.coins >= skin.price) {
      soundEngine.playPowerUp();
      onBuySkin(skin.id, skin.price);
    }
  };

  const handleBuyTrail = (trail: (typeof TRAIL_EFFECTS)[0]) => {
    if (profile.coins >= trail.price) {
      soundEngine.playPowerUp();
      onBuyTrail(trail.id, trail.price);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-white tracking-tight">
              WINGS & TRAILS WARDROBE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Coin Balance Banner */}
        <div className="flex items-center justify-between p-3 my-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-amber-950/60 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Balance</span>
              <span className="text-base font-black font-mono text-amber-300">
                {profile.coins} Gold Coins
              </span>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-950 rounded-xl mb-3 border border-white/5">
          <button
            onClick={() => setCategory('wings')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              category === 'wings'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            Wing Styles
          </button>
          <button
            onClick={() => setCategory('trails')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              category === 'trails'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Trail Particles
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar max-h-72">
          {category === 'wings' &&
            WING_SKINS.map(skin => {
              const isUnlocked = profile.unlockedSkins.includes(skin.id);
              const isEquipped = profile.equippedSkin === skin.id;
              const canAfford = profile.coins >= skin.price;

              return (
                <div
                  key={skin.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isEquipped
                      ? 'bg-purple-950/40 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-slate-800/50 border-white/5 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-inner"
                      style={{
                        backgroundColor: `${skin.color}20`,
                        borderColor: `${skin.color}60`,
                      }}
                    >
                      🪽
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {skin.name}
                        {isEquipped && (
                          <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-black">
                            EQUIPPED
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {skin.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onEquipSkin(skin.id);
                        }}
                        className="py-1 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuySkin(skin)}
                        disabled={!canAfford}
                        className={`py-1 px-3 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3 h-3" />
                        {skin.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {category === 'trails' &&
            TRAIL_EFFECTS.map(trail => {
              const isUnlocked = profile.unlockedTrails.includes(trail.id);
              const isEquipped = profile.equippedTrail === trail.id;
              const canAfford = profile.coins >= trail.price;

              return (
                <div
                  key={trail.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isEquipped
                      ? 'bg-purple-950/40 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-slate-800/50 border-white/5 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-inner"
                      style={{
                        backgroundColor: `${trail.color}20`,
                        borderColor: `${trail.color}60`,
                      }}
                    >
                      ✨
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {trail.name}
                        {isEquipped && (
                          <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-black">
                            EQUIPPED
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {trail.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onEquipTrail(trail.id);
                        }}
                        className="py-1 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyTrail(trail)}
                        disabled={!canAfford}
                        className={`py-1 px-3 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3 h-3" />
                        {trail.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/5 text-center">
          <span className="text-[11px] text-slate-400">
            Coins are earned by passing obstacles, collecting coins, and claiming daily rewards!
          </span>
        </div>
      </div>
    </div>
  );
};
