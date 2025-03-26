import { k } from "../App";
import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import puck from "../objs/puck";
import playground from "../objs/playground";
import player from "../objs/player";
import score from "../objs/score";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    k.add(playground());
    k.add(puck(room));
    k.add(score(room));

    const $ = getStateCallbacks(room);

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    $(room.state).players.onAdd(async (player, sessionId) => {
      spritesBySessionId[sessionId] = await createPlayer(room, player);
    });

    // listen when a player is removed from server state
    $(room.state).players.onRemove(async (_, sessionId) => {
      const playerObj = spritesBySessionId[sessionId];
      await k.tween(playerObj.scale, k.vec2(0), 0.25, v => playerObj.scale = v, k.easings.easeOutQuad);
      playerObj.destroy();
    });

    k.onClick(() => {
      k.setCursorLocked(true);
    });
  })
}

async function createPlayer(room: Room<MyRoomState>, playerState: Player) {
  await k.loadSprite(playerState.avatar, `assets/${playerState.avatar}.png`);
  await k.getSprite(playerState.avatar);
  return k.add(player(room, playerState));
}
