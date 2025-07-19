// Client-side type definitions that match the server schema
// This avoids importing server files directly in the client build

export interface Player {
  sessionId: string;
  userId: string;
  avatar: string;
  name: string;
  team: "left" | "right";
  x: number;
  y: number;
}

export interface MyRoomState {
  players: { [sessionId: string]: Player };
  puckX: number;
  puckY: number;
  lastHitBy: string;
  leftScore: number;
  rightScore: number;
}