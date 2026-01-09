
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { LevelObject, ObjectType } from '../types';
import { GRID_SIZE } from '../constants';
import { translations } from '../App';

interface PlayerProps {
  objects: LevelObject[];
  onExit: () => void;
  lang: 'es' | 'en' | 'pt' | 'fr';
}

type VehicleType = 'CUBE' | 'SHIP' | 'BALL' | 'UFO' | 'WAVE' | 'ROBOT' | 'SPIDER' | 'SWING';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

const GRAVITY = 1.6; 
const JUMP_FORCE = -17.9; 
const SHIP_THRUST = -1.2; 
const SHIP_MAX_SPEED = 12.0;
const BASE_PLAYER_SPEED = 9.0; 
const PLAYER_SIZE = 34; 
const HITBOX_MARGIN_SPIKE = 12; 
const INTERNAL_HEIGHT = 480; 
const INTERNAL_WIDTH = 1200; 

export const Player: React.FC<PlayerProps> = ({ objects, onExit, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWin, setIsWin] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [progress, setProgress] = useState(0);

  const t = useMemo(() => translations[lang], [lang]);
  const usedTriggers = useRef<Set<string>>(new Set());
  const deathTimeoutRef = useRef<number | null>(null);

  const gameState = useRef({
    px: -400, 
    py: INTERNAL_HEIGHT - GRID_SIZE - PLAYER_SIZE, 
    vx: BASE_PLAYER_SPEED,
    vy: 0,
    rotation: 0,
    onGround: false,
    gravityDir: 1, 
    active: true,
    frame: 0,
    cameraX: -400,
    vehicle: 'CUBE' as VehicleType,
    speedFactor: 1.0,
    justFlippedBall: false,
    robotJumpFrame: 0,
    particles: [] as Particle[],
    shockwave: null as Shockwave | null,
    flashOpacity: 0
  });

  const input = useRef({ jump: false, justPressed: false });

  const resetGame = useCallback(() => {
    if (deathTimeoutRef.current) {
      window.clearTimeout(deathTimeoutRef.current);
      deathTimeoutRef.current = null;
    }
    
    setIsDead(false); 
    setIsWin(false); 
    usedTriggers.current.clear();
    
    gameState.current = { 
      px: -400, 
      py: INTERNAL_HEIGHT - GRID_SIZE - PLAYER_SIZE, 
      vx: BASE_PLAYER_SPEED, 
      vy: 0, 
      rotation: 0, 
      onGround: false, 
      gravityDir: 1, 
      active: true, 
      frame: 0, 
      cameraX: -400, 
      vehicle: 'CUBE', 
      speedFactor: 1.0, 
      justFlippedBall: false,
      robotJumpFrame: 0,
      particles: [],
      shockwave: null,
      flashOpacity: 0
    };
    
    setAttempt(a => a + 1); 
  }, []);

  const triggerDeath = useCallback(() => {
    const s = gameState.current;
    if (!s.active) return;
    s.active = false;
    setIsDead(true);

    s.flashOpacity = 0.8;
    s.shockwave = {
      x: s.px + PLAYER_SIZE / 2,
      y: s.py + PLAYER_SIZE / 2,
      radius: 5,
      maxRadius: 180,
      opacity: 1.0
    };

    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: s.px + PLAYER_SIZE / 2,
        y: s.py + PLAYER_SIZE / 2,
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        life: 1.0,
        size: Math.random() * 8 + 3,
        color: i % 2 === 0 ? '#22d3ee' : '#ffffff'
      });
    }
    s.particles = particles;

    if (deathTimeoutRef.current) window.clearTimeout(deathTimeoutRef.current);
    deathTimeoutRef.current = window.setTimeout(() => {
      resetGame();
    }, 800);
  }, [resetGame]);

  useEffect(() => {
    const setJump = (val: boolean) => { 
      if (val && !input.current.jump) input.current.justPressed = true;
      input.current.jump = val; 
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); setJump(true); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) setJump(false);
    };
    
    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      setJump(true);
    };
    const onMouseUp = () => setJump(false);

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      setJump(true);
    };
    const onTouchEnd = () => setJump(false);
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      if (deathTimeoutRef.current) window.clearTimeout(deathTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    canvas.width = INTERNAL_WIDTH;
    canvas.height = INTERNAL_HEIGHT;

    let animationId: number;
    const levelEndX = objects.length > 0 ? (Math.max(...objects.map(o => o.x)) + 15) * GRID_SIZE : 5000;

    const update = () => {
      const s = gameState.current;
      
      if (s.particles.length > 0) {
        s.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
          p.vy += 0.35; 
        });
        s.particles = s.particles.filter(p => p.life > 0);
      }

      if (s.shockwave) {
        s.shockwave.radius += 10;
        s.shockwave.opacity -= 0.04;
        if (s.shockwave.opacity <= 0) s.shockwave = null;
      }

      if (s.flashOpacity > 0) {
        s.flashOpacity -= 0.05;
      }

      if (!s.active) {
        render();
        animationId = requestAnimationFrame(update);
        return;
      }

      s.frame++;

      if (s.vehicle === 'SHIP') {
        if (input.current.jump) s.vy += SHIP_THRUST * s.gravityDir;
        else s.vy += (GRAVITY * 0.7) * s.gravityDir;
        if (s.vy > SHIP_MAX_SPEED) s.vy = SHIP_MAX_SPEED;
        if (s.vy < -SHIP_MAX_SPEED) s.vy = -SHIP_MAX_SPEED;
      } else if (s.vehicle === 'UFO') {
        s.vy += GRAVITY * s.gravityDir;
        if (input.current.justPressed) s.vy = JUMP_FORCE * 0.75 * s.gravityDir;
      } else if (s.vehicle === 'BALL') {
        s.vy += GRAVITY * s.gravityDir;
        if (input.current.justPressed && s.onGround && !s.justFlippedBall) {
          s.gravityDir *= -1;
          s.onGround = false;
          s.justFlippedBall = true;
        }
      } else if (s.vehicle === 'WAVE') {
        const waveAngleSpeed = s.vx * s.speedFactor;
        if (input.current.jump) s.vy = -waveAngleSpeed * s.gravityDir;
        else s.vy = waveAngleSpeed * s.gravityDir;
      } else if (s.vehicle === 'ROBOT') {
        s.vy += GRAVITY * s.gravityDir;
        if (input.current.jump && (s.onGround || (s.robotJumpFrame > 0 && s.robotJumpFrame < 12))) {
          s.vy = JUMP_FORCE * 0.75 * s.gravityDir;
          s.robotJumpFrame++;
          s.onGround = false;
        } else {
          s.robotJumpFrame = 0;
        }
      } else if (s.vehicle === 'SPIDER') {
        s.vy += GRAVITY * s.gravityDir;
      } else if (s.vehicle === 'SWING') {
        s.vy += GRAVITY * 0.8 * s.gravityDir;
        if (input.current.justPressed) {
          s.gravityDir *= -1;
        }
      } else {
        s.vy += GRAVITY * s.gravityDir;
      }

      s.py += s.vy;
      s.px += s.vx * s.speedFactor;

      const floorY = INTERNAL_HEIGHT - GRID_SIZE;
      const ceilingLimitY = GRID_SIZE; 
      let wasOnGroundThisFrame = false;

      if (s.py + PLAYER_SIZE >= floorY) { 
        s.py = floorY - PLAYER_SIZE; 
        s.vy = 0; 
        if (s.gravityDir === 1) wasOnGroundThisFrame = true; 
        else if (s.vehicle === 'WAVE') triggerDeath();
      }
      if (s.py <= ceilingLimitY) { 
        s.py = ceilingLimitY; 
        s.vy = 0; 
        if (s.gravityDir === -1) wasOnGroundThisFrame = true; 
        else if (s.vehicle === 'WAVE') triggerDeath();
      }

      if (s.vehicle === 'SPIDER' && input.current.justPressed && s.onGround) {
        let targetY = s.gravityDir === 1 ? ceilingLimitY : floorY - PLAYER_SIZE;
        for (const obj of objects) {
          if (obj.type === ObjectType.BLOCK || obj.type === ObjectType.SLAB) {
            const ox = obj.x * GRID_SIZE;
            const oy = INTERNAL_HEIGHT - (obj.y + 1) * GRID_SIZE;
            if (s.px + PLAYER_SIZE >= ox && s.px <= ox + GRID_SIZE) {
              if (s.gravityDir === 1 && oy + GRID_SIZE <= s.py) {
                targetY = Math.max(targetY, oy + GRID_SIZE);
              } else if (s.gravityDir === -1 && oy >= s.py + PLAYER_SIZE) {
                targetY = Math.min(targetY, oy - PLAYER_SIZE);
              }
            }
          }
        }
        s.py = targetY;
        s.gravityDir *= -1;
        s.onGround = false;
        wasOnGroundThisFrame = true;
      }

      for (const obj of objects) {
        const ox = obj.x * GRID_SIZE;
        const oy = INTERNAL_HEIGHT - (obj.y + 1) * GRID_SIZE;
        
        // standard hitboxes
        const pR = s.px + PLAYER_SIZE;
        const pL = s.px;
        const pB = s.py + PLAYER_SIZE;
        const pT = s.py;

        // inclusive collision check
        if (pR >= ox && pL <= ox + GRID_SIZE && pB >= oy && pT <= oy + GRID_SIZE) {
          
          if (obj.type === ObjectType.SPIKE) {
            if (pR >= ox + HITBOX_MARGIN_SPIKE && pL <= ox + GRID_SIZE - HITBOX_MARGIN_SPIKE && pB >= oy + HITBOX_MARGIN_SPIKE && pT <= oy + GRID_SIZE - HITBOX_MARGIN_SPIKE) {
              triggerDeath(); return;
            }
          }

          if (obj.type === ObjectType.BLOCK || obj.type === ObjectType.SLAB) {
            if (s.vehicle === 'WAVE') { triggerDeath(); return; }
            const isSlab = obj.type === ObjectType.SLAB;
            const topBoundary = oy + (isSlab ? GRID_SIZE / 2 : 0);
            const bottomBoundary = oy + GRID_SIZE;
            const prevPy = s.py - s.vy;
            const prevPb = prevPy + PLAYER_SIZE;
            
            if (s.gravityDir === 1 && s.vy >= 0 && prevPb <= topBoundary + 15) { s.py = topBoundary - PLAYER_SIZE; s.vy = 0; wasOnGroundThisFrame = true; } 
            else if (s.gravityDir === -1 && s.vy <= 0 && prevPy >= bottomBoundary - 15) { s.py = bottomBoundary; s.vy = 0; wasOnGroundThisFrame = true; }
            else if (s.px > -150) { triggerDeath(); return; }
          }

          // ORBS logic (more forgiving hitbox)
          const orbMargin = 10;
          if (input.current.justPressed && !usedTriggers.current.has(obj.id)) {
            if (pR >= ox - orbMargin && pL <= ox + GRID_SIZE + orbMargin && pB >= oy - orbMargin && pT <= oy + GRID_SIZE + orbMargin) {
              let triggered = false;
              switch(obj.type) {
                case ObjectType.ORB:
                case ObjectType.YELLOW_ORB: s.vy = JUMP_FORCE * 0.95 * s.gravityDir; triggered = true; break;
                case ObjectType.PINK_ORB: s.vy = JUMP_FORCE * 0.7 * s.gravityDir; triggered = true; break;
                case ObjectType.RED_ORB: s.vy = JUMP_FORCE * 1.4 * s.gravityDir; triggered = true; break;
                case ObjectType.BLUE_ORB: s.gravityDir *= -1; s.vy = 2 * s.gravityDir; triggered = true; break;
                case ObjectType.GREEN_ORB: s.gravityDir *= -1; s.vy = JUMP_FORCE * 0.6 * s.gravityDir; triggered = true; break;
              }
              if (triggered) { 
                usedTriggers.current.add(obj.id); 
                input.current.justPressed = false; 
                wasOnGroundThisFrame = false; // Priority to orbs over ground jumps
                s.onGround = false;
              }
            }
          }

          if (!usedTriggers.current.has(obj.id)) {
            let padUsed = false;
            switch(obj.type) {
              case ObjectType.YELLOW_PAD: s.vy = JUMP_FORCE * 1.15 * s.gravityDir; padUsed = true; break;
              case ObjectType.PINK_PAD: s.vy = JUMP_FORCE * 0.8 * s.gravityDir; padUsed = true; break;
              case ObjectType.RED_PAD: s.vy = JUMP_FORCE * 1.65 * s.gravityDir; padUsed = true; break;
              case ObjectType.BLUE_PAD: 
                s.gravityDir *= -1; 
                s.vy = 6 * s.gravityDir; 
                padUsed = true; 
                wasOnGroundThisFrame = false; 
                break;
            }
            if (padUsed) {
              usedTriggers.current.add(obj.id);
              s.onGround = false;
            }
          }

          switch(obj.type) {
            case ObjectType.SHIP_PORTAL: s.vehicle = 'SHIP'; break;
            case ObjectType.CUBE_PORTAL: s.vehicle = 'CUBE'; break;
            case ObjectType.BALL_PORTAL: s.vehicle = 'BALL'; break;
            case ObjectType.UFO_PORTAL: s.vehicle = 'UFO'; break;
            case ObjectType.WAVE_PORTAL: s.vehicle = 'WAVE'; s.rotation = 0; break;
            case ObjectType.ROBOT_PORTAL: s.vehicle = 'ROBOT'; break;
            case ObjectType.SPIDER_PORTAL: s.vehicle = 'SPIDER'; break;
            case ObjectType.SWING_PORTAL: s.vehicle = 'SWING'; break;
            case ObjectType.GRAVITY_DOWN_PORTAL: s.gravityDir = 1; break;
            case ObjectType.GRAVITY_UP_PORTAL: s.gravityDir = -1; break;
            case ObjectType.SPEED_X05: s.speedFactor = 0.6; break;
            case ObjectType.SPEED_X1: s.speedFactor = 1.0; break;
            case ObjectType.SPEED_X2: s.speedFactor = 1.3; break;
            case ObjectType.SPEED_X3: s.speedFactor = 1.6; break;
            case ObjectType.PORTAL: s.active = false; setIsWin(true); return;
          }
        }
      }

      s.onGround = wasOnGroundThisFrame;
      if (s.onGround) { usedTriggers.current.clear(); s.justFlippedBall = false; }

      if (s.vehicle === 'CUBE' && input.current.jump && s.onGround) { 
        s.vy = JUMP_FORCE * s.gravityDir; 
        s.onGround = false; 
      }

      if (s.vehicle === 'WAVE') {
        s.rotation = (input.current.jump ? -45 : 45) * s.gravityDir;
      } else if (s.vehicle === 'SHIP' || s.vehicle === 'UFO' || s.vehicle === 'SWING') {
        const targetRot = (s.vy * 3) * s.gravityDir;
        s.rotation += (targetRot - s.rotation) * 0.2;
      } else if (s.vehicle === 'BALL' || s.vehicle === 'SPIDER') {
        s.rotation += 10.0 * s.gravityDir;
      } else if (s.vehicle === 'ROBOT') {
        s.rotation += (0 - s.rotation) * 0.3;
      } else {
        if (!s.onGround) s.rotation += 9.0 * s.gravityDir; 
        else { const targetRot = Math.round(s.rotation / 90) * 90; s.rotation += (targetRot - s.rotation) * 0.4; }
      }

      input.current.justPressed = false;
      s.cameraX += (s.px - (INTERNAL_WIDTH * 0.28) - s.cameraX) * 0.15;
      const currentProg = Math.floor(Math.min(100, (Math.max(0, s.px) / levelEndX) * 100));
      if (currentProg >= 100 && !isWin) { s.active = false; setIsWin(true); }
      setProgress(currentProg);

      render();
      animationId = requestAnimationFrame(update);
    };

    const render = () => {
      const s = gameState.current;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      const startGrid = Math.floor(s.cameraX / GRID_SIZE) * GRID_SIZE;
      ctx.beginPath();
      for (let x = startGrid; x < s.cameraX + INTERNAL_WIDTH + GRID_SIZE; x += GRID_SIZE) { ctx.moveTo(x - s.cameraX, 0); ctx.lineTo(x - s.cameraX, INTERNAL_HEIGHT); }
      for (let y = 0; y < INTERNAL_HEIGHT; y += GRID_SIZE) { ctx.moveTo(0, y); ctx.lineTo(INTERNAL_WIDTH, y); }
      ctx.stroke();

      objects.forEach(obj => {
        const ox = obj.x * GRID_SIZE - s.cameraX;
        const oy = INTERNAL_HEIGHT - (obj.y + 1) * GRID_SIZE;
        if (ox + GRID_SIZE < -50 || ox > INTERNAL_WIDTH + 50) return;
        ctx.save(); 
        ctx.translate(ox + GRID_SIZE/2, oy + GRID_SIZE/2); 
        ctx.rotate(((obj.rotation || 0) * Math.PI) / 180); 
        ctx.translate(-GRID_SIZE/2, -GRID_SIZE/2);
        
        if (obj.type === ObjectType.BLOCK) { ctx.fillStyle = '#1e40af'; ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE); ctx.strokeStyle = '#60a5fa'; ctx.strokeRect(4, 4, GRID_SIZE - 8, GRID_SIZE - 8); }
        else if (obj.type === ObjectType.SPIKE) { ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(5, GRID_SIZE); ctx.lineTo(GRID_SIZE / 2, 5); ctx.lineTo(GRID_SIZE - 5, GRID_SIZE); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'white'; ctx.stroke(); }
        else if (obj.type.includes('ORB')) {
          let c = '#fbbf24';
          if (obj.type === ObjectType.PINK_ORB) c = '#f472b6';
          if (obj.type === ObjectType.RED_ORB) c = '#ef4444';
          if (obj.type === ObjectType.BLUE_ORB) c = '#3b82f6';
          if (obj.type === ObjectType.GREEN_ORB) c = '#22c55e';
          ctx.fillStyle = c; ctx.beginPath(); ctx.arc(GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE / 3, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'white'; ctx.stroke();
        }
        else if (obj.type === ObjectType.SLAB) { ctx.fillStyle = '#065f46'; ctx.fillRect(0, GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2); }
        else if (obj.type.includes('PORTAL')) {
          let c = '#7c3aed';
          if (obj.type === ObjectType.SHIP_PORTAL) c = '#22c55e';
          if (obj.type === ObjectType.CUBE_PORTAL) c = '#f97316';
          if (obj.type === ObjectType.BALL_PORTAL) c = '#ef4444';
          if (obj.type === ObjectType.UFO_PORTAL) c = '#38bdf8';
          if (obj.type === ObjectType.WAVE_PORTAL) c = '#22d3ee';
          if (obj.type === ObjectType.ROBOT_PORTAL) c = '#ffffff';
          if (obj.type === ObjectType.SPIDER_PORTAL) c = '#a855f7';
          if (obj.type === ObjectType.SWING_PORTAL) c = '#eab308';
          if (obj.type === ObjectType.GRAVITY_DOWN_PORTAL) c = '#3b82f6';
          if (obj.type === ObjectType.GRAVITY_UP_PORTAL) c = '#eab308';
          ctx.fillStyle = c; ctx.fillRect(10, -20, GRID_SIZE - 20, GRID_SIZE + 40);
        }
        else if (obj.type.includes('PAD')) {
          let c = '#eab308';
          if (obj.type === ObjectType.PINK_PAD) c = '#f472b6';
          if (obj.type === ObjectType.RED_PAD) c = '#ef4444';
          if (obj.type === ObjectType.BLUE_PAD) c = '#3b82f6';
          ctx.fillStyle = c; ctx.fillRect(4, GRID_SIZE - 8, GRID_SIZE - 8, 8); ctx.strokeStyle = 'white'; ctx.strokeRect(4, GRID_SIZE - 8, GRID_SIZE - 8, 8);
        }
        else if (obj.type.includes('SPEED')) {
          let c = obj.type === ObjectType.SPEED_X05 ? '#475569' : obj.type === ObjectType.SPEED_X1 ? '#0891b2' : obj.type === ObjectType.SPEED_X2 ? '#16a34a' : '#db2777';
          ctx.fillStyle = c; ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE); ctx.fillStyle = 'white'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center'; ctx.fillText('>>', GRID_SIZE/2, GRID_SIZE/2+4);
        }
        ctx.restore();
      });

      ctx.fillStyle = '#1e293b'; ctx.fillRect(0, INTERNAL_HEIGHT - GRID_SIZE, INTERNAL_WIDTH, GRID_SIZE); ctx.fillRect(0, 0, INTERNAL_WIDTH, GRID_SIZE);
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, INTERNAL_HEIGHT - GRID_SIZE); ctx.lineTo(INTERNAL_WIDTH, INTERNAL_HEIGHT - GRID_SIZE); ctx.moveTo(0, GRID_SIZE); ctx.lineTo(INTERNAL_WIDTH, GRID_SIZE); ctx.stroke();

      if (s.shockwave) {
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = s.shockwave.opacity;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(s.shockwave.x - s.cameraX, s.shockwave.y, s.shockwave.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.shockwave.x - s.cameraX, s.shockwave.y, s.shockwave.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x - s.cameraX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      if (s.flashOpacity > 0) {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = s.flashOpacity;
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        ctx.globalAlpha = 1.0;
      }

      if (s.active) {
        const px = s.px - s.cameraX; const py = s.py;
        ctx.save(); 
        ctx.translate(px + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2); 
        ctx.rotate((s.rotation * Math.PI) / 180); 
        if (s.gravityDir === -1) ctx.scale(1, -1);
        ctx.fillStyle = '#22d3ee';
        
        if (s.vehicle === 'SHIP') { 
          ctx.beginPath(); ctx.moveTo(-PLAYER_SIZE/2, 0); ctx.lineTo(PLAYER_SIZE/2, -PLAYER_SIZE/4); ctx.lineTo(PLAYER_SIZE/2, PLAYER_SIZE/4); ctx.closePath(); ctx.fill(); 
        } else if (s.vehicle === 'BALL') {
          ctx.beginPath(); ctx.arc(0, 0, PLAYER_SIZE/2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 4; ctx.stroke();
        } else if (s.vehicle === 'UFO') {
          ctx.beginPath(); ctx.ellipse(0, 0, PLAYER_SIZE/2, PLAYER_SIZE/4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1e293b'; ctx.fillRect(-PLAYER_SIZE/4, -PLAYER_SIZE/2, PLAYER_SIZE/2, PLAYER_SIZE/4);
        } else if (s.vehicle === 'WAVE') {
          ctx.beginPath(); ctx.moveTo(-PLAYER_SIZE/2, -PLAYER_SIZE/4); ctx.lineTo(PLAYER_SIZE/2, 0); ctx.lineTo(-PLAYER_SIZE/2, PLAYER_SIZE/4); ctx.closePath(); ctx.fill();
        } else if (s.vehicle === 'ROBOT') {
          ctx.fillRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE*0.7); ctx.fillStyle = '#1e293b'; ctx.fillRect(-PLAYER_SIZE/4, PLAYER_SIZE*0.2, PLAYER_SIZE/2, PLAYER_SIZE*0.3);
        } else if (s.vehicle === 'SPIDER') {
          ctx.beginPath(); ctx.moveTo(-PLAYER_SIZE/2, 0); ctx.lineTo(0, -PLAYER_SIZE/2); ctx.lineTo(PLAYER_SIZE/2, 0); ctx.lineTo(0, PLAYER_SIZE/2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'white'; ctx.stroke();
        } else if (s.vehicle === 'SWING') {
          ctx.beginPath(); ctx.arc(0, 0, PLAYER_SIZE/2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-PLAYER_SIZE/2, 0); ctx.lineTo(PLAYER_SIZE/2, 0); ctx.strokeStyle = '#1e293b'; ctx.stroke();
        } else {
          ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE); ctx.strokeStyle = 'white'; ctx.lineWidth = 4; ctx.strokeRect(-PLAYER_SIZE / 2 + 6, -PLAYER_SIZE / 2 + 6, PLAYER_SIZE - 12, PLAYER_SIZE - 12); 
        }
        ctx.restore();
      }
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [objects, isWin, triggerDeath, attempt]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      <div className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${isDead ? 'animate-shake' : ''}`}>
        <canvas ref={canvasRef} className="w-full h-full object-contain block bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)]" />
        
        <div className="absolute top-0 left-0 h-1.5 md:h-2 bg-white/5 w-full overflow-hidden z-20">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 shadow-[0_0_15px_#22d3ee] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {isDead && (
          <div className="absolute inset-0 bg-red-600/20 pointer-events-none animate-flash z-50" />
        )}

        {isWin && (
          <div className="absolute inset-0 bg-cyan-950/90 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in duration-300 p-6 z-30">
            <h2 className="text-7xl md:text-[10rem] font-black text-white mb-2 tracking-tighter italic text-center drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]">{t.win}</h2>
            <p className="text-cyan-400 font-bold uppercase tracking-[0.6em] mb-12 text-sm md:text-xl">{t.missionComplete}</p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <button onClick={resetGame} className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black uppercase hover:scale-105 transition-all shadow-2xl text-lg">{t.retry}</button>
              <button onClick={onExit} className="bg-slate-800 text-white px-12 py-5 rounded-2xl font-black uppercase hover:bg-slate-700 transition-all text-lg border border-white/10">{t.editor}</button>
            </div>
          </div>
        )}

        {!isWin && (
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-10 pointer-events-none">
            <div className="flex flex-col items-start bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
              <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{t.attempt}</span>
              <span className="text-white text-3xl font-black">{attempt}</span>
            </div>
            <div className="hidden md:flex flex-col items-center animate-pulse">
              <span className="text-cyan-400 text-xs font-black uppercase tracking-[0.5em] mb-1 drop-shadow-md">{t.jumpHint}</span>
            </div>
            <button onClick={onExit} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-4 rounded-xl border border-red-500/30 transition-all text-xs font-black uppercase tracking-widest pointer-events-auto">{t.stopPlayer}</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px); }
          50% { transform: translate(4px, -4px); }
          75% { transform: translate(-4px, -4px); }
        }
        @keyframes flash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-shake { animation: shake 0.1s ease-in-out infinite; }
        .animate-flash { animation: flash 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};
