
export enum ObjectType {
  BLOCK = 'BLOCK',
  SPIKE = 'SPIKE',
  ORB = 'ORB', // Yellow (Default)
  YELLOW_ORB = 'YELLOW_ORB', // Explicit Yellow
  PINK_ORB = 'PINK_ORB',
  RED_ORB = 'RED_ORB',
  BLUE_ORB = 'BLUE_ORB',
  GREEN_ORB = 'GREEN_ORB',
  PORTAL = 'PORTAL', // Exit
  SLAB = 'SLAB',
  YELLOW_PAD = 'YELLOW_PAD',
  PINK_PAD = 'PINK_PAD',
  RED_PAD = 'RED_PAD',
  BLUE_PAD = 'BLUE_PAD',
  SHIP_PORTAL = 'SHIP_PORTAL',
  CUBE_PORTAL = 'CUBE_PORTAL',
  BALL_PORTAL = 'BALL_PORTAL',
  UFO_PORTAL = 'UFO_PORTAL',
  WAVE_PORTAL = 'WAVE_PORTAL',
  ROBOT_PORTAL = 'ROBOT_PORTAL',
  SPIDER_PORTAL = 'SPIDER_PORTAL',
  SWING_PORTAL = 'SWING_PORTAL',
  GRAVITY_DOWN_PORTAL = 'GRAVITY_DOWN_PORTAL',
  GRAVITY_UP_PORTAL = 'GRAVITY_UP_PORTAL',
  SPEED_X05 = 'SPEED_X05',
  SPEED_X1 = 'SPEED_X1',
  SPEED_X2 = 'SPEED_X2',
  SPEED_X3 = 'SPEED_X3'
}

export interface LevelObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  rotation?: number; // In degrees: 0, 90, 180, 270
  color?: string;
}

export interface LevelMetadata {
  name: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane' | 'Demon';
  author: string;
  speed: number;
}

export interface LevelData {
  metadata: LevelMetadata;
  objects: LevelObject[];
}
