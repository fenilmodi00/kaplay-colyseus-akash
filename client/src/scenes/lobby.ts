import { k } from "../App";
import type { GameObj, Vec2 } from "kaplay";

import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import puck from "../objs/puck";
import playground from "../objs/playground";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    const $ = getStateCallbacks(room);

    // keep track of player sprites
    const spritesBySessionId: Record<string, any> = {};

    // listen when a player is added on server state
    $(room.state).players.onAdd(async (player, sessionId) => {
      const isLocal = room.sessionId == sessionId;
      spritesBySessionId[sessionId] = await createPlayer(player, isLocal);
      if (isLocal) onLocalPlayerCreated(room, spritesBySessionId[sessionId], player);
    });

    // listen when a player is removed from server state
    $(room.state).players.onRemove((player, sessionId) => {
      k.destroy(spritesBySessionId[sessionId]);
    });

    k.onClick(() => {
      k.setCursorLocked(true);
    })

    k.add(playground())
    k.add(puck(room))
  })
}

function onLocalPlayerCreated(room: Room<MyRoomState>, playerObj: GameObj, playerState: Player) {
  let playerObjPos = playerObj.pos.clone()

  const offset = {
    x: playerObj.width / 2,
    y: playerObj.height / 2
  };

  const minMaxX = {
    "left": {
      min: offset.x,
      max: k.width() / 2 - offset.x,
    },
    "right": {
      min: k.width() / 2 + offset.x,
      max: k.width() - offset.x,
    }
  }[playerState.team];

  const minMaxY = {
    min: offset.y,
    max: k.height() - offset.y,
  };

  const isMoveOvershot = (axis: "x" | "y", delta: Vec2, minMax: object) => {
    const minMaxVals = Object.values(minMax);

    return minMaxVals.includes(playerObjPos[axis]) &&
      !minMaxVals.includes(playerObj.pos[axis]) &&
      Math.abs(delta[axis]) > Math.abs(delta[axis == 'y' ? 'x' : 'y']);
  }

  k.onMouseMove((_, delta) => {
    if (!k.isCursorLocked() || !playerObj) return;

    const { x, y } = playerObjPos;
    const newX = isMoveOvershot('y', delta, minMaxY) ? x : x + delta.x;
    const newY = isMoveOvershot('x', delta, minMaxX) ? y : y + delta.y;

    playerObjPos = k.vec2(
      k.clamp(minMaxX.min, newX, minMaxX.max),
      k.clamp(minMaxY.min, newY, minMaxY.max)
    );

    room.send("move", playerObjPos);
  });
}

async function createPlayer(player: Player, isLocal: boolean) {
  k.loadSprite(player.avatar, `assets/${player.avatar}.png`);
  const spriteData = await k.getSprite(player.avatar)

  // Add player sprite
  const sprite = k.add([
    k.sprite(player.avatar, { flipX: player.team == "right" }),
    k.pos(player.x, player.y),
    k.anchor("center"),
    k.area({ shape: new k.Circle(k.vec2(0), (spriteData?.width ?? 32) * 0.4) }),
    k.body({ isStatic: true }),
    k.z(player.y),
    {
      add(this: GameObj) {
        this.add([
          k.anchor("center"),
          k.sprite(player.avatar, { flipX: this.flipX, flipY: true }),
          k.pos(0, spriteData?.height ?? 32),
          k.opacity(0.2),
        ]);
      }
    },
    "player",
    {
      sessionId: player.sessionId,
      team: player.team,
    },
  ]);

  if (isLocal) sprite.tag("localPlayer");

  sprite.onUpdate(() => {
    sprite.pos.x = k.lerp(sprite.pos.x, player.x, 12 * k.dt());
    sprite.pos.y = sprite.z = k.lerp(sprite.pos.y, player.y, 12 * k.dt());
  });

  return sprite;
}
