/**
 * 60FPS High-Performance Canvas Game Engine
 * Featuring Rithik character avatar, dynamic parallax backgrounds,
 * obstacles with difficulty scaling, power-ups, bonus round, and audio triggers
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  GameStatus,
  Player,
  Pipe,
  Coin,
  PowerUpItem,
  Particle,
  FloatingText,
  LevelConfig,
  WingSkinId,
  TrailId,
} from '../types';
import { soundEngine } from '../utils/audio';
import { getLevelForScore, LEVELS } from '../utils/levels';

interface GameCanvasProps {
  gameStatus: GameStatus;
  equippedSkin: WingSkinId;
  equippedTrail: TrailId;
  onScoreUpdate: (score: number, level: LevelConfig) => void;
  onCoinsUpdate: (coinsGained: number) => void;
  onGameOver: (finalScore: number, coinsEarned: number, level: LevelConfig) => void;
  onBonusRoundStart: () => void;
  onBonusRoundEnd: () => void;
  onPipesPassedStat: (count: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameStatus,
  equippedSkin,
  equippedTrail,
  onScoreUpdate,
  onCoinsUpdate,
  onGameOver,
  onBonusRoundStart,
  onBonusRoundEnd,
  onPipesPassedStat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References to keep game loop 60fps without React re-renders
  const stateRef = useRef<{
    width: number;
    height: number;
    dpr: number;
    status: GameStatus;
    score: number;
    coinsEarnedThisRun: number;
    currentLevel: LevelConfig;
    player: Player;
    pipes: Pipe[];
    coins: Coin[];
    powerUps: PowerUpItem[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    cameraShake: number;
    hitStopFrames: number;
    nextPipeDistance: number;
    pipeCounter: number;
    cloudOffset: number;
    cityOffset: number;
    groundOffset: number;
    bonusRoundTimer: number; // seconds left
    bonusRoundActive: boolean;
    lastTime: number;
    characterImg: HTMLImageElement | null;
    cityImg: HTMLImageElement | null;
    isFlapping: boolean;
    justDied: boolean;
  }>({
    width: 440,
    height: 720,
    dpr: 1,
    status: 'TITLE',
    score: 0,
    coinsEarnedThisRun: 0,
    currentLevel: LEVELS[0],
    player: {
      x: 100,
      y: 300,
      radius: 26,
      velocity: 0,
      rotation: 0,
      gravity: 0.38,
      jumpStrength: -7.2,
      scaleX: 1,
      scaleY: 1,
      wingAngle: 0,
      wingDir: 1,
      hasShield: false,
      hasMagnet: false,
      hasSlowMo: false,
      isTurbo: false,
      turboRemaining: 0,
      slowMoRemaining: 0,
      magnetRemaining: 0,
    },
    pipes: [],
    coins: [],
    powerUps: [],
    particles: [],
    floatingTexts: [],
    cameraShake: 0,
    hitStopFrames: 0,
    nextPipeDistance: 160,
    pipeCounter: 0,
    cloudOffset: 0,
    cityOffset: 0,
    groundOffset: 0,
    bonusRoundTimer: 0,
    bonusRoundActive: false,
    lastTime: 0,
    characterImg: null,
    cityImg: null,
    isFlapping: false,
    justDied: false,
  });

  // Preload assets
  useEffect(() => {
    const charImg = new Image();
    charImg.src = '/assets/aistudio/image_921c49ee.png';
    charImg.onload = () => {
      stateRef.current.characterImg = charImg;
    };

    const cityImg = new Image();
    cityImg.src = '/assets/aistudio/image_f773f1c0.png';
    cityImg.onload = () => {
      stateRef.current.cityImg = cityImg;
    };
  }, []);

  // Sync game status changes
  useEffect(() => {
    stateRef.current.status = gameStatus;

    if (gameStatus === 'PLAYING' && stateRef.current.justDied) {
      resetGame();
    }
  }, [gameStatus]);

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0;
    s.coinsEarnedThisRun = 0;
    s.currentLevel = LEVELS[0];
    s.player.x = 100;
    s.player.y = s.height / 2 - 40;
    s.player.velocity = 0;
    s.player.rotation = 0;
    s.player.hasShield = false;
    s.player.hasMagnet = false;
    s.player.hasSlowMo = false;
    s.player.isTurbo = false;
    s.player.turboRemaining = 0;
    s.player.slowMoRemaining = 0;
    s.player.magnetRemaining = 0;
    s.pipes = [];
    s.coins = [];
    s.powerUps = [];
    s.particles = [];
    s.floatingTexts = [];
    s.cameraShake = 0;
    s.hitStopFrames = 0;
    s.nextPipeDistance = 160;
    s.bonusRoundTimer = 0;
    s.bonusRoundActive = false;
    s.justDied = false;

    onScoreUpdate(0, LEVELS[0]);
  }, [onScoreUpdate]);

  // Jump / Flap handler
  const triggerFlap = useCallback(() => {
    const s = stateRef.current;
    soundEngine.unlockAudio();

    if (s.status === 'TITLE') {
      return;
    }

    if (s.status === 'GAME_OVER') {
      return;
    }

    if (s.status === 'PLAYING' || s.status === 'BONUS_ROUND') {
      s.player.velocity = s.player.jumpStrength;
      s.player.scaleX = 0.85;
      s.player.scaleY = 1.18;
      s.isFlapping = true;
      soundEngine.playFlap();

      // Flap trail burst
      spawnTrailParticles(s.player.x - 10, s.player.y + 12, 6);
    }
  }, []);

  // Spawn trail particles based on equipped skin & trail
  const spawnTrailParticles = (x: number, y: number, count = 2) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      let color = '#FCD34D';
      let shape: Particle['shape'] = 'circle';

      if (equippedTrail === 'rainbow_stardust') {
        const rainbow = ['#F43F5E', '#FB923C', '#FBBF24', '#34D399', '#38BDF8', '#A855F7'];
        color = rainbow[Math.floor(Math.random() * rainbow.length)];
        shape = 'sparkle';
      } else if (equippedTrail === 'neon_flame') {
        color = Math.random() > 0.4 ? '#F97316' : '#EF4444';
        shape = 'star';
      } else if (equippedTrail === 'pink_hearts') {
        color = '#F43F5E';
        shape = 'heart';
      }

      s.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 8 - 4),
        vx: -(Math.random() * 2 + 1),
        vy: (Math.random() - 0.5) * 2,
        color,
        size: Math.random() * 4 + 2,
        alpha: 0.9,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        shape,
      });
    }
  };

  // Spawn impact / coin burst
  const spawnBurstParticles = (x: number, y: number, color: string, count = 16) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 5 + 3,
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 15,
      });
    }
  };

  // Add floating text
  const addFloatingText = (x: number, y: number, text: string, color = '#FBBF24') => {
    stateRef.current.floatingTexts.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
      scale: 1.3,
    });
  };

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stateRef.current.width = rect.width;
      stateRef.current.height = rect.height;
      stateRef.current.dpr = dpr;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = (timestamp: number) => {
      const s = stateRef.current;

      if (!s.lastTime) s.lastTime = timestamp;
      const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05); // clamp delta
      s.lastTime = timestamp;

      // Handle hit-stop freeze frames
      if (s.hitStopFrames > 0) {
        s.hitStopFrames--;
        render(ctx, s);
        animId = requestAnimationFrame(loop);
        return;
      }

      // Update simulation if active
      if (s.status === 'PLAYING' || s.status === 'BONUS_ROUND') {
        update(dt, s);
      } else if (s.status === 'TITLE') {
        // Idle hover animation on Title screen
        s.player.y = s.height / 2 - 30 + Math.sin(timestamp * 0.004) * 12;
        s.player.rotation = Math.sin(timestamp * 0.003) * 0.08;
        s.cloudOffset += 0.4;
        s.groundOffset = (s.groundOffset + 1.2) % 24;
      }

      render(ctx, s);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update Game Logic
  const update = (dt: number, s: typeof stateRef.current) => {
    const groundY = s.height - 70;
    const player = s.player;

    // Power-up timers
    if (player.hasSlowMo) {
      player.slowMoRemaining -= dt;
      if (player.slowMoRemaining <= 0) {
        player.hasSlowMo = false;
        addFloatingText(player.x, player.y - 30, 'Normal Speed', '#94A3B8');
      }
    }

    if (player.hasMagnet) {
      player.magnetRemaining -= dt;
      if (player.magnetRemaining <= 0) {
        player.hasMagnet = false;
      }
    }

    if (player.isTurbo) {
      player.turboRemaining -= dt;
      if (player.turboRemaining <= 0) {
        player.isTurbo = false;
      }
    }

    // Bonus round countdown
    if (s.bonusRoundActive) {
      s.bonusRoundTimer -= dt;
      if (s.bonusRoundTimer <= 0) {
        s.bonusRoundActive = false;
        s.status = 'PLAYING';
        onBonusRoundEnd();
        addFloatingText(s.width / 2, s.height / 2, 'BONUS COMPLETED!', '#F59E0B');
      }
    }

    // Calculate effective speed
    let effectiveSpeed = s.currentLevel.pipeSpeed;
    if (player.hasSlowMo) effectiveSpeed *= 0.6;
    if (player.isTurbo) effectiveSpeed *= 1.8;

    // Camera shake decay
    if (s.cameraShake > 0) {
      s.cameraShake = Math.max(0, s.cameraShake - 25 * dt);
    }

    // Parallax background scroll
    s.cloudOffset += effectiveSpeed * 0.2;
    s.cityOffset += effectiveSpeed * 0.45;
    s.groundOffset = (s.groundOffset + effectiveSpeed * 1.5) % 36;

    // Player physics
    if (!player.isTurbo) {
      player.velocity += player.gravity;
      player.y += player.velocity;
    } else {
      // In Turbo mode, hover steadily through the gaps
      player.y += (s.height / 2 - player.y) * 0.05;
      player.velocity = 0;
    }

    // Smooth rotation
    const targetRot = Math.min(Math.PI / 2.2, Math.max(-Math.PI / 6, (player.velocity * 0.08)));
    player.rotation += (targetRot - player.rotation) * 0.15;

    // Squash and stretch return to 1
    player.scaleX += (1 - player.scaleX) * 0.15;
    player.scaleY += (1 - player.scaleY) * 0.15;

    // Wing flap oscillation
    player.wingAngle += 0.22;

    // Emit trail particles
    if (Math.random() < 0.6 || player.isTurbo) {
      spawnTrailParticles(player.x - 14, player.y + 4, player.isTurbo ? 4 : 1);
    }

    // Ceiling clamp
    if (player.y - player.radius < 0) {
      player.y = player.radius;
      player.velocity = 0;
    }

    // Ground collision
    if (player.y + player.radius >= groundY) {
      player.y = groundY - player.radius;
      handleCollision(s, 'GROUND');
      return;
    }

    // In Bonus Round: no pipes spawn, only coins & gems shower!
    if (s.bonusRoundActive) {
      updateBonusRoundItems(effectiveSpeed, s);
      updateParticlesAndTexts(dt, s);
      return;
    }

    // Regular Mode: Pipe Spawning & Moving
    s.nextPipeDistance -= effectiveSpeed;
    if (s.nextPipeDistance <= 0) {
      spawnPipePair(s);
      s.nextPipeDistance = s.currentLevel.pipeInterval;
    }

    // Update Pipes
    for (let i = s.pipes.length - 1; i >= 0; i--) {
      const pipe = s.pipes[i];
      pipe.x -= effectiveSpeed;

      // Vertical oscillation for higher levels
      if (pipe.moving) {
        pipe.movePhase += 0.035;
        const offset = Math.sin(pipe.movePhase) * pipe.moveRange;
        pipe.topHeight = pipe.initialTopHeight + offset;
        pipe.bottomY = pipe.topHeight + s.currentLevel.pipeGap;
      }

      // Check scoring / passing barrier
      if (!pipe.passed && pipe.x + pipe.width < player.x - player.radius) {
        pipe.passed = true;
        s.score += 1;
        onPipesPassedStat(1);

        // Check level progression
        const newLevel = getLevelForScore(s.score);
        if (newLevel.level !== s.currentLevel.level) {
          s.currentLevel = newLevel;
          soundEngine.triggerLevelUpQuip(newLevel.level, newLevel.name);
          addFloatingText(s.width / 2, s.height / 3, `LEVEL ${newLevel.level}: ${newLevel.name}!`, '#F43F5E');
        }

        // Voice clip saying "Rithik " triggered upon passing each barrier!
        soundEngine.triggerBarrierQuip();
        soundEngine.playScore();

        // Visual floating text popup "+1 RITHIK!"
        addFloatingText(pipe.x + pipe.width / 2, pipe.topHeight + s.currentLevel.pipeGap / 2, '+1 RITHIK!', '#38BDF8');

        onScoreUpdate(s.score, s.currentLevel);
      }

      // Pipe Collision check (unless in Turbo mode)
      if (!player.isTurbo) {
        const inPipeX = player.x + player.radius - 6 > pipe.x && player.x - player.radius + 6 < pipe.x + pipe.width;
        if (inPipeX) {
          // Check top pipe collision or bottom pipe collision
          const hitTop = player.y - player.radius + 6 < pipe.topHeight;
          const hitBottom = player.y + player.radius - 6 > pipe.bottomY;

          if (hitTop || hitBottom) {
            if (player.hasShield) {
              // Shield absorbs the blow!
              player.hasShield = false;
              s.cameraShake = 8;
              soundEngine.playShieldBreak();
              spawnBurstParticles(player.x, player.y, '#38BDF8', 25);
              addFloatingText(player.x, player.y - 40, 'SHIELD BROKE!', '#EF4444');
              // Push pipe away
              pipe.x = -100;
            } else {
              handleCollision(s, 'PIPE');
              return;
            }
          }
        }
      }

      // Remove off-screen pipes
      if (pipe.x + pipe.width < -50) {
        s.pipes.splice(i, 1);
      }
    }

    // Update Coins
    for (let i = s.coins.length - 1; i >= 0; i--) {
      const coin = s.coins[i];
      coin.x -= effectiveSpeed;
      coin.rotation += 0.08;

      // Magnet attraction
      if (player.hasMagnet) {
        const dx = player.x - coin.x;
        const dy = player.y - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          coin.x += (dx / dist) * 7;
          coin.y += (dy / dist) * 7;
        }
      }

      // Check coin collection
      const dist = Math.hypot(player.x - coin.x, player.y - coin.y);
      if (dist < player.radius + coin.radius) {
        coin.collected = true;
        s.coinsEarnedThisRun += coin.value;
        onCoinsUpdate(coin.value);
        soundEngine.playCoin();
        spawnBurstParticles(coin.x, coin.y, '#FBBF24', 12);
        addFloatingText(coin.x, coin.y - 15, `+${coin.value}`, '#F59E0B');
        s.coins.splice(i, 1);
        continue;
      }

      // Remove off-screen coins
      if (coin.x < -30) {
        s.coins.splice(i, 1);
      }
    }

    // Update PowerUps
    for (let i = s.powerUps.length - 1; i >= 0; i--) {
      const pu = s.powerUps[i];
      pu.x -= effectiveSpeed;
      pu.pulsePhase += 0.05;

      const dist = Math.hypot(player.x - pu.x, player.y - pu.y);
      if (dist < player.radius + pu.radius) {
        pu.collected = true;
        applyPowerUp(pu.type, s);
        s.powerUps.splice(i, 1);
        continue;
      }

      if (pu.x < -40) {
        s.powerUps.splice(i, 1);
      }
    }

    updateParticlesAndTexts(dt, s);
  };

  // Bonus round updates
  const updateBonusRoundItems = (effectiveSpeed: number, s: typeof stateRef.current) => {
    // Continuously spawn coins in fun sine wave arcs
    if (Math.random() < 0.25) {
      s.coins.push({
        id: Date.now() + Math.random(),
        x: s.width + 20,
        y: s.height * 0.25 + Math.sin(Date.now() * 0.005) * (s.height * 0.25) + (Math.random() * 40 - 20),
        radius: 14,
        collected: false,
        value: 3,
        rotation: 0,
        isSpecial: true,
      });
    }

    for (let i = s.coins.length - 1; i >= 0; i--) {
      const coin = s.coins[i];
      coin.x -= effectiveSpeed * 1.2;
      coin.rotation += 0.1;

      const dist = Math.hypot(s.player.x - coin.x, s.player.y - coin.y);
      if (dist < s.player.radius + coin.radius + 15) {
        s.coinsEarnedThisRun += coin.value;
        onCoinsUpdate(coin.value);
        soundEngine.playCoin();
        spawnBurstParticles(coin.x, coin.y, '#FBBF24', 10);
        addFloatingText(coin.x, coin.y - 15, `+${coin.value} BONUS!`, '#FBBF24');
        s.coins.splice(i, 1);
        continue;
      }

      if (coin.x < -30) {
        s.coins.splice(i, 1);
      }
    }
  };

  // Apply power-up effects
  const applyPowerUp = (type: PowerUpItem['type'], s: typeof stateRef.current) => {
    soundEngine.playPowerUp();
    soundEngine.triggerPowerUpQuip(type);
    spawnBurstParticles(s.player.x, s.player.y, '#38BDF8', 25);

    switch (type) {
      case 'SHIELD':
        s.player.hasShield = true;
        addFloatingText(s.player.x, s.player.y - 40, 'SHIELD ACTIVATED!', '#38BDF8');
        break;
      case 'MAGNET':
        s.player.hasMagnet = true;
        s.player.magnetRemaining = 8;
        addFloatingText(s.player.x, s.player.y - 40, 'COIN MAGNET 8s!', '#FBBF24');
        break;
      case 'SLOW_MO':
        s.player.hasSlowMo = true;
        s.player.slowMoRemaining = 6;
        addFloatingText(s.player.x, s.player.y - 40, 'SLOW MOTION 6s!', '#A855F7');
        break;
      case 'TURBO':
        s.player.isTurbo = true;
        s.player.turboRemaining = 4;
        addFloatingText(s.player.x, s.player.y - 40, 'ROCKET TURBO 4s!', '#EF4444');
        break;
      case 'BONUS_PORTAL':
        s.bonusRoundActive = true;
        s.bonusRoundTimer = 10;
        s.status = 'BONUS_ROUND';
        soundEngine.playBonusStart();
        soundEngine.triggerBonusRoundQuip();
        onBonusRoundStart();
        addFloatingText(s.width / 2, s.height / 2, 'BONUS COIN RUSH!', '#F59E0B');
        break;
    }
  };

  // Spawn pipe pair with randomized gap height
  const spawnPipePair = (s: typeof stateRef.current) => {
    s.pipeCounter++;
    const minHeight = 60;
    const groundY = s.height - 70;
    const maxTopHeight = groundY - s.currentLevel.pipeGap - minHeight;
    const topHeight = minHeight + Math.random() * (maxTopHeight - minHeight);
    const bottomY = topHeight + s.currentLevel.pipeGap;
    const pipeWidth = 62;

    const newPipe: Pipe = {
      id: s.pipeCounter,
      x: s.width + 10,
      topHeight,
      bottomY,
      width: pipeWidth,
      passed: false,
      moving: s.currentLevel.movingPipes && Math.random() < 0.45,
      moveSpeed: 1.2,
      initialTopHeight: topHeight,
      moveRange: 35,
      movePhase: Math.random() * Math.PI * 2,
    };

    s.pipes.push(newPipe);

    // Spawn coin inside gap (75% chance)
    if (Math.random() < 0.75) {
      s.coins.push({
        id: Date.now() + Math.random(),
        x: newPipe.x + pipeWidth / 2,
        y: topHeight + s.currentLevel.pipeGap / 2,
        radius: 12,
        collected: false,
        value: 1,
        rotation: 0,
      });
    }

    // Spawn rare power-up (every 5-7 pipes)
    if (s.pipeCounter % 6 === 0) {
      const types: PowerUpItem['type'][] = ['SHIELD', 'MAGNET', 'SLOW_MO', 'TURBO', 'BONUS_PORTAL'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      s.powerUps.push({
        id: Date.now() + Math.random(),
        x: newPipe.x + pipeWidth + 70,
        y: minHeight + Math.random() * (groundY - minHeight - 60),
        type: chosenType,
        radius: 16,
        collected: false,
        pulsePhase: 0,
      });
    }
  };

  // Update particles and floating labels
  const updateParticlesAndTexts = (dt: number, s: typeof stateRef.current) => {
    // Particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        s.particles.splice(i, 1);
      }
    }

    // Floating text
    for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
      const t = s.floatingTexts[i];
      t.life += dt;
      t.y -= 35 * dt;
      t.alpha = Math.max(0, 1 - t.life / 1.2);

      if (t.life >= 1.2) {
        s.floatingTexts.splice(i, 1);
      }
    }
  };

  // Handle collision
  const handleCollision = (s: typeof stateRef.current, _type: 'PIPE' | 'GROUND') => {
    s.cameraShake = 16;
    s.hitStopFrames = 4;
    s.justDied = true;
    s.status = 'GAME_OVER';

    soundEngine.playHit();
    // Character saying 'Vittu pogatha rithik' in a funny tone!
    soundEngine.triggerGameOverQuip();

    spawnBurstParticles(s.player.x, s.player.y, '#EF4444', 35);
    onGameOver(s.score, s.coinsEarnedThisRun, s.currentLevel);
  };

  // --- Rendering ---
  const render = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    const { width, height, dpr } = s;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Apply Camera Shake
    if (s.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * s.cameraShake;
      const shakeY = (Math.random() - 0.5) * s.cameraShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Sky & Atmosphere Background
    drawSky(ctx, s);

    // 2. Parallax Skyline & Clouds
    drawParallax(ctx, s);

    // 3. Pipes / Barriers
    drawPipes(ctx, s);

    // 4. Coins & PowerUps
    drawCoinsAndPowerUps(ctx, s);

    // 5. Particles
    drawParticles(ctx, s);

    // 6. Player (Rithik Avatar with Animated Wings & Auras)
    drawPlayer(ctx, s);

    // 7. Ground
    drawGround(ctx, s);

    // 8. Floating Texts
    drawFloatingTexts(ctx, s);

    ctx.restore();
  };

  const drawSky = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    const grad = ctx.createLinearGradient(0, 0, 0, s.height);
    if (s.bonusRoundActive) {
      // Golden Fever Sky for Bonus Round
      grad.addColorStop(0, '#F59E0B');
      grad.addColorStop(0.5, '#FDE047');
      grad.addColorStop(1, '#FEF08A');
    } else {
      grad.addColorStop(0, s.currentLevel.skyGradient[0]);
      grad.addColorStop(1, s.currentLevel.skyGradient[1]);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s.width, s.height);

    // Celestial Sun / Moon glow
    const celestialY = 90;
    const celestialX = s.width - 80;
    const sunGrad = ctx.createRadialGradient(celestialX, celestialY, 5, celestialX, celestialY, 60);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    sunGrad.addColorStop(0.4, 'rgba(253, 230, 138, 0.4)');
    sunGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(celestialX, celestialY, 60, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawParallax = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    const groundY = s.height - 70;

    // Distant soft fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 180 - s.cloudOffset) % (s.width + 180)) - 60;
      const cy = 110 + (i % 2) * 50;
      drawCloud(ctx, cx, cy, 45);
    }

    // City Silhouette (from attached asset or procedural landmarks)
    const cityBaseY = groundY - 10;
    ctx.fillStyle = s.currentLevel.level >= 3 ? 'rgba(15, 23, 42, 0.65)' : 'rgba(30, 58, 138, 0.2)';

    // Draw silhouette skyline buildings
    const buildingWidth = 48;
    const count = Math.ceil(s.width / buildingWidth) + 2;
    for (let i = 0; i < count; i++) {
      const bx = ((i * buildingWidth - s.cityOffset) % (s.width + buildingWidth * 2)) - buildingWidth;
      const seed = (i * 37) % 100;
      const bHeight = 70 + (seed % 65);
      ctx.fillRect(bx, cityBaseY - bHeight, buildingWidth - 6, bHeight);

      // Cute building antenna / tower spire
      if (i % 3 === 0) {
        ctx.fillRect(bx + 18, cityBaseY - bHeight - 16, 4, 16);
      }
    }
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.5, 0, Math.PI * 2);
    ctx.arc(x + r * 0.9, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPipes = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    const pipeColor = s.currentLevel.pipeColor;
    const rimColor = s.currentLevel.pipeRimColor;
    const lipHeight = 24;
    const lipOverhang = 5;

    s.pipes.forEach(pipe => {
      // --- Top Pipe ---
      // Pipe cylinder
      const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      topGrad.addColorStop(0, rimColor);
      topGrad.addColorStop(0.3, pipeColor);
      topGrad.addColorStop(0.7, '#86efac'); // highlight
      topGrad.addColorStop(1, rimColor);

      ctx.fillStyle = topGrad;
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight - lipHeight);

      // Top Lip Cap
      ctx.fillRect(pipe.x - lipOverhang, pipe.topHeight - lipHeight, pipe.width + lipOverhang * 2, lipHeight);

      // Bevel border on cap
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x - lipOverhang, pipe.topHeight - lipHeight, pipe.width + lipOverhang * 2, lipHeight);

      // --- Bottom Pipe ---
      const bottomGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      bottomGrad.addColorStop(0, rimColor);
      bottomGrad.addColorStop(0.3, pipeColor);
      bottomGrad.addColorStop(0.7, '#86efac');
      bottomGrad.addColorStop(1, rimColor);

      // Bottom Lip Cap
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(pipe.x - lipOverhang, pipe.bottomY, pipe.width + lipOverhang * 2, lipHeight);
      ctx.strokeRect(pipe.x - lipOverhang, pipe.bottomY, pipe.width + lipOverhang * 2, lipHeight);

      // Bottom Cylinder down to ground
      ctx.fillRect(pipe.x, pipe.bottomY + lipHeight, pipe.width, s.height - pipe.bottomY - lipHeight);
    });
  };

  const drawCoinsAndPowerUps = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    // Coins
    s.coins.forEach(coin => {
      ctx.save();
      ctx.translate(coin.x, coin.y);
      const widthFactor = Math.abs(Math.cos(coin.rotation));

      ctx.fillStyle = coin.isSpecial ? '#F59E0B' : '#EAB308';
      ctx.beginPath();
      ctx.ellipse(0, 0, coin.radius * Math.max(0.2, widthFactor), coin.radius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shiny rim
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner star symbol if wide enough
      if (widthFactor > 0.5) {
        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
      }

      ctx.restore();
    });

    // Power-ups
    s.powerUps.forEach(pu => {
      ctx.save();
      ctx.translate(pu.x, pu.y + Math.sin(pu.pulsePhase) * 4);

      // Glowing pulse aura
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, pu.radius * 1.5);
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, pu.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Bubble orb
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Icon inside orb
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const iconMap: Record<PowerUpItem['type'], string> = {
        SHIELD: '🛡️',
        MAGNET: '🧲',
        SLOW_MO: '⏱️',
        TURBO: '⚡',
        BONUS_PORTAL: '⭐',
      };
      ctx.fillText(iconMap[pu.type], 0, 1);

      ctx.restore();
    });
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    const p = s.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(p.scaleX, p.scaleY);

    // --- Shield Aura ---
    if (p.hasShield) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // --- Magnet Pulse Aura ---
    if (p.hasMagnet) {
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 15 + Math.sin(Date.now() * 0.01) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // --- Turbo Thrust Fire ---
    if (p.isTurbo) {
      ctx.save();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(-p.radius, 0);
      ctx.lineTo(-p.radius - 24, -8);
      ctx.lineTo(-p.radius - 32, 0);
      ctx.lineTo(-p.radius - 24, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // --- Animated Wings behind avatar ---
    drawWings(ctx, p, equippedSkin);

    // --- Circular Character Avatar (Rithik) ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.clip();

    if (s.characterImg && s.characterImg.complete) {
      // Draw zoomed face crop of Rithik (using provided character portrait)
      const img = s.characterImg;
      // Focus on boy's face and expression
      const sw = img.naturalWidth * 0.72;
      const sh = img.naturalWidth * 0.72;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = img.naturalHeight * 0.05;

      ctx.drawImage(img, sx, sy, sw, sh, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
    } else {
      // Fallback cute character face
      ctx.fillStyle = '#FED7AA';
      ctx.fill();
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      ctx.arc(8, -4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Golden / Themed Avatar Border Ring
    ctx.strokeStyle = getSkinBorderColor(equippedSkin);
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Little cute flower / bindi ornament highlight
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(0, -p.radius * 0.45, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // If game over, show comical dizzy cartoon eyes or cry tears
    if (s.status === 'GAME_OVER') {
      ctx.fillStyle = '#38BDF8';
      // Tear drops
      ctx.beginPath();
      ctx.arc(-9, 10, 4, 0, Math.PI * 2);
      ctx.arc(9, 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Dizzy swirl above
      ctx.font = '14px sans-serif';
      ctx.fillText('💫', 0, -p.radius - 8);
    }

    ctx.restore();
  };

  const getSkinBorderColor = (skin: WingSkinId): string => {
    switch (skin) {
      case 'phoenix_wings': return '#EF4444';
      case 'cyber_wings': return '#06B6D4';
      case 'angel_wings': return '#A855F7';
      case 'classic_wings':
      default: return '#F59E0B';
    }
  };

  const drawWings = (ctx: CanvasRenderingContext2D, p: Player, skin: WingSkinId) => {
    ctx.save();
    const flapOffset = Math.sin(p.wingAngle) * 16;

    // Wing colors based on skin
    let primary = '#F59E0B';
    let secondary = '#FEF08A';
    if (skin === 'phoenix_wings') {
      primary = '#DC2626';
      secondary = '#F97316';
    } else if (skin === 'cyber_wings') {
      primary = '#0891B2';
      secondary = '#22D3EE';
    } else if (skin === 'angel_wings') {
      primary = '#7C3AED';
      secondary = '#E9D5FF';
    }

    // Left / Back Wing
    ctx.save();
    ctx.translate(-p.radius * 0.7, -4);
    ctx.rotate(-0.4 + flapOffset * 0.04);

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-26, -24 + flapOffset, -38, -6 + flapOffset);
    ctx.quadraticCurveTo(-24, 8, 0, 10);
    ctx.closePath();
    ctx.fill();

    // Inner feather feathering
    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-18, -16 + flapOffset, -26, -4 + flapOffset);
    ctx.quadraticCurveTo(-14, 6, 0, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  };

  const drawGround = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    const groundY = s.height - 70;
    const groundHeight = 70;

    // Green grassy top strip
    ctx.fillStyle = s.currentLevel.pipeRimColor;
    ctx.fillRect(0, groundY, s.width, 14);

    // Deep soil / brick ground
    ctx.fillStyle = s.currentLevel.groundColor;
    ctx.fillRect(0, groundY + 14, s.width, groundHeight - 14);

    // Decorative diagonal arcade stripe dashes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    const stripeGap = 24;
    const totalStripes = Math.ceil(s.width / stripeGap) + 4;
    for (let i = 0; i < totalStripes; i++) {
      const sx = i * stripeGap - s.groundOffset;
      ctx.beginPath();
      ctx.moveTo(sx, groundY + 14);
      ctx.lineTo(sx + 14, groundY + groundHeight);
      ctx.stroke();
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.font = `${p.size * 2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', p.x, p.y);
      } else if (p.shape === 'heart') {
        ctx.font = `${p.size * 2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  };

  const drawFloatingTexts = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    s.floatingTexts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerFlap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlap]);

  return (
    <div
      className="relative w-full h-full select-none cursor-pointer overflow-hidden touch-none"
      onClick={triggerFlap}
      onTouchStart={e => {
        e.preventDefault();
        triggerFlap();
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
