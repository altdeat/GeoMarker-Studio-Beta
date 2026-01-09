
import { GoogleGenAI, Type } from "@google/genai";
import { ObjectType } from "../types";

export const generateLevelSection = async (prompt: string, startX: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional Geometry Dash level segment. 
    Context: ${prompt}. 
    Start X coordinate: ${startX}. 
    Grid height is 12 units (y from 0 to 11). 
    Bottom (y=0) is the ground.
    Provide a list of objects with x, y coordinates and type.
    Types available: ${Object.values(ObjectType).join(', ')}.
    
    Guidelines:
    - PINK_ORB: low jump, ORB: normal jump, RED_ORB: high jump.
    - BLUE_ORB: gravity flip in air. GREEN_ORB: jump + gravity flip.
    - PINK_PAD: low bounce, YELLOW_PAD: normal, RED_PAD: high bounce, BLUE_PAD: instant gravity flip on contact.
    - BALL_PORTAL: player flips gravity on click. UFO_PORTAL: jump in mid-air.
    - WAVE_PORTAL: player moves diagonally up on click, down on release.
    - ROBOT_PORTAL: variable jump based on hold length.
    - SPIDER_PORTAL: instant teleport to ceiling/floor on click.
    - SWING_PORTAL: toggles gravity on each click in mid-air.
    - GRAVITY_UP/DOWN_PORTAL: changes gravity direction.
    - SPEED_X05 to X3: changes movement speed.
    - Create challenging rhythm-based sequences (15-30 objects).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: Object.values(ObjectType) },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER }
          },
          required: ["type", "x", "y"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};
