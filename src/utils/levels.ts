/**
 * Level Configurations and Difficulty Curves for Flappy Rithik
 */

import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Green Meadows',
    theme: 'Sunny Daylight',
    minScore: 0,
    pipeSpeed: 2.3,
    pipeGap: 165,
    pipeInterval: 240,
    movingPipes: false,
    skyGradient: ['#48c6ef', '#6f86d6'],
    pipeColor: '#22c55e',
    pipeRimColor: '#16a34a',
    groundColor: '#78350f',
  },
  {
    level: 2,
    name: 'Sunset Coast',
    theme: 'Golden Hour',
    minScore: 8,
    pipeSpeed: 2.8,
    pipeGap: 152,
    pipeInterval: 230,
    movingPipes: true,
    skyGradient: ['#f97316', '#db2777'],
    pipeColor: '#ea580c',
    pipeRimColor: '#c2410c',
    groundColor: '#7c2d12',
  },
  {
    level: 3,
    name: 'Midnight Neon',
    theme: 'Cyber City',
    minScore: 18,
    pipeSpeed: 3.3,
    pipeGap: 142,
    pipeInterval: 220,
    movingPipes: true,
    skyGradient: ['#0f172a', '#3b0764'],
    pipeColor: '#06b6d4',
    pipeRimColor: '#0891b2',
    groundColor: '#1e1b4b',
  },
  {
    level: 4,
    name: 'Stormy Highlands',
    theme: 'Thunderstorm',
    minScore: 30,
    pipeSpeed: 3.9,
    pipeGap: 132,
    pipeInterval: 215,
    movingPipes: true,
    skyGradient: ['#1e293b', '#475569'],
    pipeColor: '#8b5cf6',
    pipeRimColor: '#7c3aed',
    groundColor: '#0f172a',
  },
  {
    level: 5,
    name: 'Inferno Volcano',
    theme: 'Molten Core',
    minScore: 45,
    pipeSpeed: 4.5,
    pipeGap: 122,
    pipeInterval: 210,
    movingPipes: true,
    skyGradient: ['#450a0a', '#b91c1c'],
    pipeColor: '#f59e0b',
    pipeRimColor: '#d97706',
    groundColor: '#292524',
  },
  {
    level: 6,
    name: 'Godspeed Dimension',
    theme: 'Hyper Space',
    minScore: 65,
    pipeSpeed: 5.1,
    pipeGap: 116,
    pipeInterval: 200,
    movingPipes: true,
    skyGradient: ['#030712', '#1e1b4b'],
    pipeColor: '#ec4899',
    pipeRimColor: '#db2777',
    groundColor: '#030712',
  },
];

export function getLevelForScore(score: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}
