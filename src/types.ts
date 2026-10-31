/**
 * Game Types & Interfaces for Flappy Rithik
 */

export type GameStatus = 'LOADING' | 'TITLE' | 'PLAYING' | 'BONUS_ROUND' | 'PAUSED' | 'GAME_OVER';

export type PowerUpType = 'SHIELD' | 'MAGNET' | 'SLOW_MO' | 'TURBO' | 'BONUS_PORTAL';

export type WingSkinId = 'classic_wings' | 'phoenix_wings' | 'cyber_wings' | 'angel_wings';
export type TrailId = 'gold_sparkles' | 'rainbow_stardust' | 'neon_flame' | 'pink_hearts';

export interface LevelConfig {
  level: number;
  name: string;
  theme: string;
  minScore: number;
  pipeSpeed: number;
  pipeGap: number;
  pipeInterval: number; // spawn distance
  movingPipes: boolean;
  skyGradient: [string, string];
  pipeColor: string;
  pipeRimColor: string;
  groundColor: string;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  velocity: number;
  rotation: number;
  gravity: number;
  jumpStrength: number;
  scaleX: number;
  scaleY: number;
  wingAngle: number;
  wingDir: number;
  hasShield: boolean;
  hasMagnet: boolean;
  hasSlowMo: boolean;
  isTurbo: boolean;
  turboRemaining: number;
  slowMoRemaining: number;
  magnetRemaining: number;
}

export interface Pipe {
  id: number;
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  passed: boolean;
  moving: boolean;
  moveSpeed: number;
  initialTopHeight: number;
  moveRange: number;
  movePhase: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  value: number;
  rotation: number;
  isSpecial?: boolean;
}

export interface PowerUpItem {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  collected: boolean;
  pulsePhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'heart' | 'sparkle';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  scale: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  level: number;
  avatar: string;
  isUser?: boolean;
  badge?: string;
  isFriend?: boolean;
}

export interface SeasonalChallenge {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardCoins: number;
  claimed: boolean;
  icon: string;
}

export interface DailyReward {
  day: number;
  rewardCoins: number;
  label: string;
  icon: string;
  claimed: boolean;
}

export interface PlayerProfile {
  username: string;
  highScore: number;
  coins: number;
  totalGames: number;
  totalPipesPassed: number;
  totalCoinsCollected: number;
  bonusRoundsPlayed: number;
  equippedSkin: WingSkinId;
  unlockedSkins: WingSkinId[];
  equippedTrail: TrailId;
  unlockedTrails: TrailId[];
  streakDays: number;
  lastClaimDate: string; // YYYY-MM-DD
  claimedDailyDays: number[];
  challenges: Record<string, { current: number; claimed: boolean }>;
}
