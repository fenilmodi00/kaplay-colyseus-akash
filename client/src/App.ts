import './index.css';
import { GAME_WIDTH, GAME_HEIGHT } from "../../globals";
import kaplay from 'kaplay'
import { colyseusSDK } from "./core/colyseus";
import { createLobbyScene } from './scenes/lobby';
import type { MyRoomState } from '../../server/src/rooms/schema/MyRoomState';

// Initialize kaplay
export const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  pixelDensity: Math.min(window.devicePixelRatio, 2),
  background: "8db7ff",
  font: "happy-o",
});

// Create all scenes
createLobbyScene();

async function main() {
  await k.loadBitmapFont("happy-o", "assets/happy-o.png", 31, 39);
  k.loadSound("hit", "sounds/hit.mp3");

  const text = k.add([
    k.text("Joining room ...", { size: 28 }),
    k.pos(k.center()),
    k.anchor("center")
  ]);

  const room = await colyseusSDK.joinOrCreate<MyRoomState>("my_room", {
    name: "Ka"
  });

  text.text = "Success! sessionId: " + room.sessionId;

  k.go("lobby", room);
}

main();
