/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GameStatus,
  PlayerProfile,
  LevelConfig,
  WingSkinId,
  TrailId,
} from './types';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { LoadingScreen } from './components/LoadingScreen';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { ProfileModal } from './components/ProfileModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ShopModal } from './components/ShopModal';
import { LEVELS } from './utils/levels';
import {
  loadPlayerProfile,
  savePlayerProfile,
  getTodayDateString,
} from './utils/storage';
import { soundEngine } from './utils/audio';

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('LOADING');
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [coinsThisRun, setCoinsThisRun] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<
    'profile' | 'daily' | 'achievements' | 'shop' | null
  >(null);
  const [, setAudioTick] = useState(0);

  // Sync profile to localStorage on every change
  useEffect(() => {
    savePlayerProfile(profile);
  }, [profile]);

  // Check if daily reward is available today
  const today = getTodayDateString();
  const hasUnclaimedDaily = profile.lastClaimDate !== today;

  // Handle Score Updates from Canvas
  const handleScoreUpdate = useCallback((score: number, level: LevelConfig) => {
    setCurrentScore(score);
    setCurrentLevel(level);

    // Update challenge progress in real-time
    setProfile(prev => {
      const nextCh = { ...prev.challenges };

      // First Flight: Pass 5 barriers
      const ff = nextCh['first_flight'] || { current: 0, claimed: false };
      if (score > ff.current) {
        nextCh['first_flight'] = { ...ff, current: score };
      }

      // High Flyer Champion: Score 30+
      const hf = nextCh['high_flyer'] || { current: 0, claimed: false };
      if (score > hf.current) {
        nextCh['high_flyer'] = { ...hf, current: score };
      }

      // Speed Demon: Reach Level 3+
      const sd = nextCh['speed_demon'] || { current: 0, claimed: false };
      if (level.level > sd.current) {
        nextCh['speed_demon'] = { ...sd, current: level.level };
      }

      return {
        ...prev,
        challenges: nextCh,
      };
    });
  }, []);

  // Handle Coins Collected
  const handleCoinsUpdate = useCallback((amount: number) => {
    setCoinsThisRun(prev => prev + amount);
    setProfile(prev => {
      const nextCh = { ...prev.challenges };
      const cm = nextCh['coin_magnate'] || { current: 0, claimed: false };
      nextCh['coin_magnate'] = {
        ...cm,
        current: (cm.current || 0) + amount,
      };

      return {
        ...prev,
        coins: prev.coins + amount,
        totalCoinsCollected: prev.totalCoinsCollected + amount,
        challenges: nextCh,
      };
    });
  }, []);

  // Handle Barrier Count for "Rithik's Echo"
  const handlePipesPassedStat = useCallback((count: number) => {
    setProfile(prev => {
      const nextCh = { ...prev.challenges };
      const re = nextCh['rithik_echo'] || { current: 0, claimed: false };
      nextCh['rithik_echo'] = {
        ...re,
        current: (re.current || 0) + count,
      };

      return {
        ...prev,
        totalPipesPassed: prev.totalPipesPassed + count,
        challenges: nextCh,
      };
    });
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(
    (finalScore: number, coinsEarned: number, level: LevelConfig) => {
      setGameStatus('GAME_OVER');
      setCurrentScore(finalScore);
      setCoinsThisRun(coinsEarned);
      setCurrentLevel(level);

      setProfile(prev => {
        const newHigh = Math.max(prev.highScore, finalScore);
        const nextCh = { ...prev.challenges };

        // Never Give Up challenge (Play 10 games)
        const ngu = nextCh['vittu_pogatha_legend'] || { current: 0, claimed: false };
        nextCh['vittu_pogatha_legend'] = {
          ...ngu,
          current: (ngu.current || 0) + 1,
        };

        return {
          ...prev,
          highScore: newHigh,
          totalGames: prev.totalGames + 1,
          challenges: nextCh,
        };
      });
    },
    []
  );

  // Bonus Round Callbacks
  const handleBonusRoundStart = useCallback(() => {
    setGameStatus('BONUS_ROUND');
    setProfile(prev => {
      const nextCh = { ...prev.challenges };
      const br = nextCh['bonus_rush'] || { current: 0, claimed: false };
      nextCh['bonus_rush'] = {
        ...br,
        current: (br.current || 0) + 1,
      };

      return {
        ...prev,
        bonusRoundsPlayed: prev.bonusRoundsPlayed + 1,
        challenges: nextCh,
      };
    });
  }, []);

  const handleBonusRoundEnd = useCallback(() => {
    setGameStatus('PLAYING');
  }, []);

  // Start Game
  const handleStartGame = () => {
    soundEngine.unlockAudio();
    soundEngine.playClick();
    setCurrentScore(0);
    setCoinsThisRun(0);
    setCurrentLevel(LEVELS[0]);
    setIsPaused(false);
    setActiveModal(null);
    setGameStatus('PLAYING');
  };

  // Restart after Game Over
  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentScore(0);
    setCoinsThisRun(0);
    setCurrentLevel(LEVELS[0]);
    setIsPaused(false);
    setGameStatus('PLAYING');
  };

  // Return to Home / Title
  const handleHome = () => {
    soundEngine.playClick();
    setGameStatus('TITLE');
    setIsPaused(false);
  };

  // Pause toggle
  const handleTogglePause = () => {
    if (gameStatus === 'PLAYING' || gameStatus === 'BONUS_ROUND') {
      setIsPaused(true);
      setGameStatus('PAUSED');
    } else if (gameStatus === 'PAUSED') {
      setIsPaused(false);
      setGameStatus('PLAYING');
    }
  };

  // Claim Daily Day
  const handleClaimDay = (day: number, rewardCoins: number) => {
    setProfile(prev => {
      const isAlreadyClaimed = prev.claimedDailyDays.includes(day);
      if (isAlreadyClaimed) return prev;

      const newClaimed = [...prev.claimedDailyDays, day];
      const newSkins = [...prev.unlockedSkins];
      // Day 7 unlocks Phoenix Wings!
      if (day === 7 && !newSkins.includes('phoenix_wings')) {
        newSkins.push('phoenix_wings');
      }

      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        streakDays: prev.streakDays + 1,
        lastClaimDate: today,
        claimedDailyDays: newClaimed,
        unlockedSkins: newSkins,
      };
    });
  };

  // Claim Seasonal Challenge
  const handleClaimChallengeReward = (challengeId: string, rewardCoins: number) => {
    setProfile(prev => {
      const nextCh = { ...prev.challenges };
      const currentCh = nextCh[challengeId] || { current: 0, claimed: false };
      nextCh[challengeId] = {
        ...currentCh,
        claimed: true,
      };

      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        challenges: nextCh,
      };
    });
  };

  // Wardrobe / Shop handlers
  const handleEquipSkin = (skinId: WingSkinId) => {
    setProfile(prev => ({
      ...prev,
      equippedSkin: skinId,
    }));
  };

  const handleBuySkin = (skinId: WingSkinId, price: number) => {
    setProfile(prev => ({
      ...prev,
      coins: prev.coins - price,
      unlockedSkins: [...prev.unlockedSkins, skinId],
      equippedSkin: skinId,
    }));
  };

  const handleEquipTrail = (trailId: TrailId) => {
    setProfile(prev => ({
      ...prev,
      equippedTrail: trailId,
    }));
  };

  const handleBuyTrail = (trailId: TrailId, price: number) => {
    setProfile(prev => ({
      ...prev,
      coins: prev.coins - price,
      unlockedTrails: [...prev.unlockedTrails, trailId],
      equippedTrail: trailId,
    }));
  };

  const handleUpdateUsername = (newUsername: string) => {
    setProfile(prev => ({
      ...prev,
      username: newUsername,
    }));
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Full-Device Loading Page: Displayed before the game runs */}
      {gameStatus === 'LOADING' && (
        <LoadingScreen onFinish={() => setGameStatus('TITLE')} />
      )}

      {/* Ambient Atmospheric Background for Desktop Viewports */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      {/* Flappy Arcade Mobile Frame Container */}
      <main className="relative w-full h-full sm:max-w-[440px] sm:max-h-[820px] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col bg-slate-900">
        {/* Canvas Engine - only runs after loading completes */}
        {gameStatus !== 'LOADING' && (
          <GameCanvas
            gameStatus={gameStatus}
            equippedSkin={profile.equippedSkin}
            equippedTrail={profile.equippedTrail}
            onScoreUpdate={handleScoreUpdate}
            onCoinsUpdate={handleCoinsUpdate}
            onGameOver={handleGameOver}
            onBonusRoundStart={handleBonusRoundStart}
            onBonusRoundEnd={handleBonusRoundEnd}
            onPipesPassedStat={handlePipesPassedStat}
          />
        )}

        {/* In-Game HUD (Visible during PLAYING, BONUS_ROUND, PAUSED) */}
        {(gameStatus === 'PLAYING' ||
          gameStatus === 'BONUS_ROUND' ||
          gameStatus === 'PAUSED') && (
          <HUD
            score={currentScore}
            coins={profile.coins}
            currentLevel={currentLevel}
            isPaused={isPaused}
            isBonusRound={gameStatus === 'BONUS_ROUND'}
            onTogglePause={handleTogglePause}
            onAudioChange={() => setAudioTick(t => t + 1)}
          />
        )}

        {/* Title Screen Overlay */}
        {gameStatus === 'TITLE' && (
          <TitleScreen
            profile={profile}
            currentLevel={currentLevel}
            hasUnclaimedDaily={hasUnclaimedDaily}
            onStartGame={handleStartGame}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenDailyRewards={() => setActiveModal('daily')}
            onOpenAchievements={() => setActiveModal('achievements')}
            onOpenShop={() => setActiveModal('shop')}
            onShowLoadingScreen={() => setGameStatus('LOADING')}
          />
        )}

        {/* Custom Game Over Screen with character crying and saying 'Vittu pogatha rithik' */}
        {gameStatus === 'GAME_OVER' && (
          <GameOverModal
            score={currentScore}
            highScore={profile.highScore}
            coinsEarned={coinsThisRun}
            level={currentLevel}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        )}

        {/* Pause Modal */}
        {gameStatus === 'PAUSED' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
            <div className="w-full max-w-xs p-6 rounded-3xl bg-slate-900 border border-white/10 text-center flex flex-col items-center">
              <h2 className="text-2xl font-black text-white">GAME PAUSED</h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Take a breath! Rithik is waiting for your return.
              </p>
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={handleTogglePause}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                >
                  RESUME FLIGHT
                </button>
                <button
                  onClick={handleHome}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  QUIT TO TITLE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile & Levels Modal */}
        {activeModal === 'profile' && (
          <ProfileModal
            profile={profile}
            currentLevel={currentLevel}
            onClose={() => setActiveModal(null)}
            onUpdateUsername={handleUpdateUsername}
          />
        )}

        {/* Daily Rewards Modal */}
        {activeModal === 'daily' && (
          <DailyRewardsModal
            profile={profile}
            onClose={() => setActiveModal(null)}
            onClaimDay={handleClaimDay}
          />
        )}

        {/* Seasonal Achievements Modal */}
        {activeModal === 'achievements' && (
          <AchievementsModal
            profile={profile}
            onClose={() => setActiveModal(null)}
            onClaimReward={handleClaimChallengeReward}
          />
        )}

        {/* Wings & Trails Shop Modal */}
        {activeModal === 'shop' && (
          <ShopModal
            profile={profile}
            onClose={() => setActiveModal(null)}
            onEquipSkin={handleEquipSkin}
            onBuySkin={handleBuySkin}
            onEquipTrail={handleEquipTrail}
            onBuyTrail={handleBuyTrail}
          />
        )}
      </main>
    </div>
  );
}
