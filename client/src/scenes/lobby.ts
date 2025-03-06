import { k } from "../App";
import type { GameObj, Vec2 } from "kaplay";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import puck from "../objs/puck";
import playground from "../objs/playground";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    const $ = getStateCallbacks(room);
    let localPlayer: GameObj | null = null;
    let localPlayerPos: Vec2 | null = null;

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    $(room.state).players.onAdd(async (player, sessionId) => {
      const isLocal = room.sessionId == sessionId;
      spritesBySessionId[sessionId] = await createPlayer(player, isLocal);
      if (isLocal) localPlayer = spritesBySessionId[sessionId];
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

    k.add(playground())
    k.add(puck(room))
  });
}

async function createPlayer(player: Player, isLocal: boolean) {
  k.loadSprite(player.avatar, `assets/${player.avatar}.png`);
  const spriteData = await k.getSprite(player.avatar)

  // Add player sprite
  const sprite = k.add([
    k.sprite(player.avatar),
    k.pos(player.x, player.y),
    k.anchor("center"),
    k.area({ shape: new k.Circle(k.vec2(0), (spriteData?.width ?? 32) * 0.4) }),
    k.body(),
    `team-${player.team}`,
    "player",
    {
      sessionId: player.sessionId
    },
  ]);

  if (isLocal) sprite.tag("localPlayer")

  sprite.onUpdate(() => {
    sprite.pos.x = k.lerp(sprite.pos.x, player.x, 12 * k.dt());
    sprite.pos.y = k.lerp(sprite.pos.y, player.y, 12 * k.dt());
  });

  return sprite;
}
