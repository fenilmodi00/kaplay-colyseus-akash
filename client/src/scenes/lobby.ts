import { k } from "../App";
import type { GameObj, Vec2 } from "kaplay";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    const $ = getStateCallbacks(room);
    let localPlayer: GameObj | null = null
    let localPlayerPos: Vec2 | null = null

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    $(room.state).players.onAdd((player, sessionId) => {
      spritesBySessionId[sessionId] = createPlayer(player);
      if (room.sessionId == sessionId) localPlayer = spritesBySessionId[sessionId]
    });

    // listen when a player is removed from server state
    $(room.state).players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

    k.onClick(() => {
      k.setCursorLocked(true);
    })

    k.onMouseMove((_, delta) => {
      if (!k.isCursorLocked() || !localPlayer) return;

      const { x, y } = localPlayerPos ?? localPlayer.pos;
      const offset = {
        x: localPlayer.width / 2,
        y: localPlayer.height / 2
      };
      const clampedX = localPlayer.is("team-left")
        ? k.clamp(offset.x, x + delta.x, k.width() / 2 - offset.x)
        : k.clamp(k.width() / 2 + offset.x, x + delta.x, k.width() - offset.x);

      localPlayerPos = k.vec2(clampedX, k.clamp(offset.y, y + delta.y, k.height() - offset.y));

      room.send("move", localPlayerPos);
    });
  });
}

function createPlayer(player: Player) {
  k.loadSprite(player.avatar, `assets/${player.avatar}.png`);

  // Add player sprite
  const sprite = k.add([
    k.sprite(player.avatar),
    k.pos(player.x, player.y),
    k.anchor("center"),
    `team-${player.team}`,
  ]);

  sprite.onUpdate(() => {
    sprite.pos.x = k.lerp(sprite.pos.x, player.x, 12 * k.dt());
    sprite.pos.y = k.lerp(sprite.pos.y, player.y, 12 * k.dt());
  });

  return sprite;
}
