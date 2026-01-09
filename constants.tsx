
import React from 'react';
import { ObjectType } from './types';

export const GRID_SIZE = 40;
export const CANVAS_HEIGHT = 12 * GRID_SIZE; // 12 units high
export const INITIAL_WIDTH = 100 * GRID_SIZE;

export const OBJECT_CONFIG = {
  [ObjectType.BLOCK]: {
    label: 'Block',
    icon: <div className="w-full h-full bg-blue-500 border-2 border-white/20 rounded-sm" />,
  },
  [ObjectType.SPIKE]: {
    label: 'Spike',
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-red-500">
        <polygon points="50,10 90,90 10,90" />
      </svg>
    ),
  },
  [ObjectType.ORB]: {
    label: 'Orb',
    icon: <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-white/40 animate-pulse" />,
  },
  [ObjectType.YELLOW_ORB]: {
    label: 'Yellow Orb',
    icon: <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-white/40 animate-pulse" />,
  },
  [ObjectType.PINK_ORB]: {
    label: 'Pink Orb',
    icon: <div className="w-full h-full bg-pink-400 rounded-full border-2 border-white/40 animate-pulse" />,
  },
  [ObjectType.RED_ORB]: {
    label: 'Red Orb',
    icon: <div className="w-full h-full bg-red-600 rounded-full border-2 border-white/40 animate-pulse" />,
  },
  [ObjectType.BLUE_ORB]: {
    label: 'Blue Orb',
    icon: <div className="w-full h-full bg-blue-500 rounded-full border-2 border-white/40 animate-pulse" />,
  },
  [ObjectType.GREEN_ORB]: {
    label: 'Green Orb',
    icon: <div className="w-full h-full bg-green-500 rounded-full border-2 border-white/40 animate-pulse" />,
  },
  [ObjectType.PORTAL]: {
    label: 'Exit Portal',
    icon: <div className="w-full h-full bg-white rounded-lg border-2 border-purple-400 opacity-80" />,
  },
  [ObjectType.SLAB]: {
    label: 'Slab',
    icon: <div className="w-full h-1/2 mt-[25%] bg-emerald-500 border border-white/20" />,
  },
  [ObjectType.YELLOW_PAD]: {
    label: 'Yellow Pad',
    icon: <div className="w-full h-1/4 mt-[75%] bg-yellow-500 border-t-2 border-white/40 rounded-t-sm shadow-[0_-4px_10px_rgba(234,179,8,0.5)]" />,
  },
  [ObjectType.PINK_PAD]: {
    label: 'Pink Pad',
    icon: <div className="w-full h-1/4 mt-[75%] bg-pink-500 border-t-2 border-white/40 rounded-t-sm shadow-[0_-4px_10px_rgba(236,72,153,0.5)]" />,
  },
  [ObjectType.RED_PAD]: {
    label: 'Red Pad',
    icon: <div className="w-full h-1/4 mt-[75%] bg-red-600 border-t-2 border-white/40 rounded-t-sm shadow-[0_-4px_10px_rgba(220,38,38,0.5)]" />,
  },
  [ObjectType.BLUE_PAD]: {
    label: 'Blue Pad',
    icon: <div className="w-full h-1/4 mt-[75%] bg-blue-600 border-t-2 border-white/40 rounded-t-sm shadow-[0_-4px_10px_rgba(37,99,235,0.5)]" />,
  },
  [ObjectType.SHIP_PORTAL]: {
    label: 'Ship Portal',
    icon: <div className="w-full h-full bg-green-500 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold">SHIP</div>,
  },
  [ObjectType.CUBE_PORTAL]: {
    label: 'Cube Portal',
    icon: <div className="w-full h-full bg-orange-500 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold">CUBE</div>,
  },
  [ObjectType.BALL_PORTAL]: {
    label: 'Ball Portal',
    icon: <div className="w-full h-full bg-red-500 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold">BALL</div>,
  },
  [ObjectType.UFO_PORTAL]: {
    label: 'UFO Portal',
    icon: <div className="w-full h-full bg-blue-400 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold">UFO</div>,
  },
  [ObjectType.WAVE_PORTAL]: {
    label: 'Wave Portal',
    icon: <div className="w-full h-full bg-cyan-400 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold text-slate-900">WAVE</div>,
  },
  [ObjectType.ROBOT_PORTAL]: {
    label: 'Robot Portal',
    icon: <div className="w-full h-full bg-white rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold text-slate-900">ROBO</div>,
  },
  [ObjectType.SPIDER_PORTAL]: {
    label: 'Spider Portal',
    icon: <div className="w-full h-full bg-purple-600 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold">SPID</div>,
  },
  [ObjectType.SWING_PORTAL]: {
    label: 'Swing Portal',
    icon: <div className="w-full h-full bg-yellow-600 rounded-full border-4 border-white/30 flex items-center justify-center text-[10px] font-bold">SWNG</div>,
  },
  [ObjectType.GRAVITY_DOWN_PORTAL]: {
    label: 'Normal Grav',
    icon: <div className="w-full h-full border-l-8 border-blue-400 bg-blue-400/20" />,
  },
  [ObjectType.GRAVITY_UP_PORTAL]: {
    label: 'Flip Grav',
    icon: <div className="w-full h-full border-l-8 border-yellow-400 bg-yellow-400/20" />,
  },
  [ObjectType.SPEED_X05]: {
    label: 'Speed 0.5x',
    icon: <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[8px] font-bold">>></div>,
  },
  [ObjectType.SPEED_X1]: {
    label: 'Speed 1x',
    icon: <div className="w-full h-full bg-cyan-700 flex items-center justify-center text-[8px] font-bold">></div>,
  },
  [ObjectType.SPEED_X2]: {
    label: 'Speed 2x',
    icon: <div className="w-full h-full bg-green-700 flex items-center justify-center text-[8px] font-bold">>></div>,
  },
  [ObjectType.SPEED_X3]: {
    label: 'Speed 3x',
    icon: <div className="w-full h-full bg-pink-700 flex items-center justify-center text-[8px] font-bold">>>></div>,
  },
};
