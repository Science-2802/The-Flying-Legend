/**
 * Storage and Profile Management for Flappy Rithik
 * Manages High Scores, Coins, Daily Rewards, Seasonal Achievements, Skins, and Friends Leaderboard
 */

import { PlayerProfile, SeasonalChallenge, DailyReward, LeaderboardEntry, WingSkinId, TrailId } from '../types';

const STORAGE_KEY = 'flappy_rithik_profile_v1';

export const INITIAL_SEASONAL_CHALLENGES: SeasonalChallenge[] = [
  {
    id: 'first_flight',
    title: 'First Flight',
    description: 'Pass 5 barriers in any single run',
    current: 0,
    target: 5,
    rewardCoins: 50,
    claimed: false,
    icon: 'Feather',
  },
  {
    id: 'rithik_echo',
    title: "Rithik's Echo",
    description: 'Hear "Rithik!" 20 times in total',
    current: 0,
    target: 20,
    rewardCoins: 120,
    claimed: false,
    icon: 'Volume2',
  },
  {
    id: 'shield_guardian',
    title: 'Shield Guardian',
    description: 'Collect 3 shields in your career',
    current: 0,
    target: 3,
    rewardCoins: 100,
    claimed: false,
    icon: 'Shield',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Reach Level 3: Midnight Neon',
    current: 0,
    target: 3,
    rewardCoins: 200,
    claimed: false,
    icon: 'Zap',
  },
  {
    id: 'coin_magnate',
    title: 'Coin Magnate',
    description: 'Collect 50 gold coins',
    current: 0,
    target: 50,
    rewardCoins: 150,
    claimed: false,
    icon: 'Coins',
  },
  {
    id: 'bonus_rush',
    title: 'Bonus Rush Master',
    description: 'Enter and complete a Bonus Round',
    current: 0,
    target: 1,
    rewardCoins: 250,
    claimed: false,
    icon: 'Sparkles',
  },
  {
    id: 'vittu_pogatha_legend',
    title: 'Never Give Up!',
    description: 'Play 10 games without quitting',
    current: 0,
    target: 10,
    rewardCoins: 100,
    claimed: false,
    icon: 'Heart',
  },
  {
    id: 'high_flyer',
    title: 'High Flyer Champion',
    description: 'Score 30 or higher in a single run',
    current: 0,
    target: 30,
    rewardCoins: 500,
    claimed: false,
    icon: 'Trophy',
  },
];

export const DAILY_REWARDS_DATA: Omit<DailyReward, 'claimed'>[] = [
  { day: 1, rewardCoins: 50, label: '50 Gold Coins', icon: 'Coins' },
  { day: 2, rewardCoins: 80, label: '80 Gold Coins', icon: 'Coins' },
  { day: 3, rewardCoins: 120, label: '120 Gold Coins + Shield Token', icon: 'Shield' },
  { day: 4, rewardCoins: 160, label: '160 Gold Coins', icon: 'Coins' },
  { day: 5, rewardCoins: 200, label: '200 Gold Coins + Magnet Boost', icon: 'Zap' },
  { day: 6, rewardCoins: 250, label: '250 Gold Coins', icon: 'Coins' },
  { day: 7, rewardCoins: 500, label: '500 Coins + Phoenix Wings!', icon: 'Crown' },
];

export const WING_SKINS: { id: WingSkinId; name: string; price: number; description: string; color: string }[] = [
  { id: 'classic_wings', name: 'Golden Angel Wings', price: 0, description: 'The signature radiant feathered wings', color: '#F59E0B' },
  { id: 'phoenix_wings', name: 'Phoenix Fire Wings', price: 250, description: 'Blazing phoenix flames that burn bright', color: '#EF4444' },
  { id: 'cyber_wings', name: 'Cyber Neon Wings', price: 400, description: 'Holographic cyan energy wings with pulse', color: '#06B6D4' },
  { id: 'angel_wings', name: 'Crystal Seraph Wings', price: 600, description: 'Pure amethyst crystal wings of legend', color: '#A855F7' },
];

export const TRAIL_EFFECTS: { id: TrailId; name: string; price: number; description: string; color: string }[] = [
  { id: 'gold_sparkles', name: 'Golden Sparkles', price: 0, description: 'Glittering stardust dust in your wake', color: '#FCD34D' },
  { id: 'rainbow_stardust', name: 'Rainbow Stardust', price: 200, description: 'Prismatic multi-color light stream', color: '#EC4899' },
  { id: 'neon_flame', name: 'Inferno Flames', price: 350, description: 'Fiery jet booster trail sparks', color: '#F97316' },
  { id: 'pink_hearts', name: 'Floating Hearts', price: 500, description: 'Sweet romantic floating heart particles', color: '#F43F5E' },
];

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function loadPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') {
    return createDefaultProfile();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = createDefaultProfile();
    savePlayerProfile(fresh);
    return fresh;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultProfile(),
      ...parsed,
    };
  } catch {
    return createDefaultProfile();
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}

function createDefaultProfile(): PlayerProfile {
  return {
    username: 'Rithik',
    highScore: 0,
    coins: 100, // starting gift coins
    totalGames: 0,
    totalPipesPassed: 0,
    totalCoinsCollected: 0,
    bonusRoundsPlayed: 0,
    equippedSkin: 'classic_wings',
    unlockedSkins: ['classic_wings'],
    equippedTrail: 'gold_sparkles',
    unlockedTrails: ['gold_sparkles'],
    streakDays: 1,
    lastClaimDate: '',
    claimedDailyDays: [],
    challenges: {},
  };
}

// Friends and Global Leaderboard Data
const DEFAULT_FRIENDS: Omit<LeaderboardEntry, 'rank'>[] = [
  { id: 'f1', name: 'Karthik Tamil', score: 38, level: 4, avatar: '👑', badge: 'Pro Flapper', isFriend: true },
  { id: 'f2', name: 'Priya M.', score: 29, level: 3, avatar: '🌸', badge: 'Sky Queen', isFriend: true },
  { id: 'f3', name: 'Arun V.', score: 22, level: 3, avatar: '⚡', badge: 'Speedster', isFriend: true },
  { id: 'f4', name: 'Divya S.', score: 17, level: 2, avatar: '🌟', badge: 'Barrier Dodger', isFriend: true },
  { id: 'f5', name: 'Sanjay K.', score: 14, level: 2, avatar: '🔥', badge: 'Wingman', isFriend: true },
  { id: 'f6', name: 'Meena R.', score: 9, level: 1, avatar: '🎵', badge: 'Rookie Flap', isFriend: true },
];

const DEFAULT_GLOBAL: Omit<LeaderboardEntry, 'rank'>[] = [
  { id: 'g1', name: 'Anand_Titan', score: 84, level: 6, avatar: '🏆', badge: 'World #1' },
  { id: 'g2', name: 'Deepa_Flyer', score: 71, level: 5, avatar: '🦅', badge: 'Grandmaster' },
  { id: 'g3', name: 'Vignesh_99', score: 58, level: 5, avatar: '🚀', badge: 'Ace Aviator' },
  { id: 'g4', name: 'Karthik Tamil', score: 38, level: 4, avatar: '👑', badge: 'Master' },
  { id: 'g5', name: 'Priya M.', score: 29, level: 3, avatar: '🌸', badge: 'Diamond' },
  { id: 'g6', name: 'Suresh_Ultra', score: 26, level: 3, avatar: '🎯', badge: 'Platinum' },
];

export function getLeaderboard(type: 'friends' | 'global', profile: PlayerProfile): LeaderboardEntry[] {
  const baseList = type === 'friends' ? [...DEFAULT_FRIENDS] : [...DEFAULT_GLOBAL];

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    id: 'user_self',
    name: `${profile.username} (You)`,
    score: profile.highScore,
    level: Math.min(6, Math.max(1, Math.floor(profile.highScore / 8) + 1)),
    avatar: '👸',
    isUser: true,
    badge: profile.highScore >= 40 ? 'Legendary' : profile.highScore >= 20 ? 'Sky Master' : 'Challenger',
    isFriend: type === 'friends',
  };

  const combined = [...baseList, userEntry];
  combined.sort((a, b) => b.score - a.score);

  return combined.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
