import type { GameObj, Vec2 } from "kaplay";
import { MyRoomState, Player } from "../../../server/src/rooms/schema/MyRoomState";
import { k } from "../App";
import { Room } from "colyseus.js";

export default (room: Room<MyRoomState>, player: Player) => ([
  k.sprite(player.avatar, { flipX: player.team == "right" }),
  k.pos(player.x, player.y),
  k.anchor("center"),
  k.area({ shape: new k.Circle(k.vec2(0), (k.getSprite(player.avatar)?.data?.width ?? 32) * 0.4) }),
  k.body({ isStatic: true }),
  k.scale(0),
  k.z(player.y),
  "player",
  {
    sessionId: player.sessionId,
    team: player.team,
    startPos: k.vec2(player.x, player.y),
    moveLerp: 12,
    overshootLerp: 30,
    controllable: true,

    add(this: GameObj) {
      k.tween(this.scale, k.vec2(1), 0.25, v => this.scale = v, k.easings.easeOutBack);

      // reflection
      this.add([
        k.anchor("center"),
        k.sprite(player.avatar, { flipX: this.flipX, flipY: true }),
        k.pos(0, this.height),
        k.opacity(0.2),
      ]);

      const moveOffset = {
        x: this.width / 2,
        y: this.height / 2,
        overshoot: 10,
      };

      this.moveMinMax = {
        x: Object.values(player.team == "left" ? {
          min: moveOffset.x,
          max: k.width() / 2 - moveOffset.x + moveOffset.overshoot,
        } : {
          min: k.width() / 2 + moveOffset.x - moveOffset.overshoot,
          max: k.width() - moveOffset.x,
        }),
        y: Object.values({
          min: moveOffset.y,
          max: k.height() - moveOffset.y,
        })
      };

      if (player.sessionId == room.sessionId) onLocalPlayerCreated(room, this);
    },

    update(this: GameObj) {
      this.pos.x = k.lerp(
        this.pos.x,
        player.x,
        k.dt() * (this.moveMinMax.x.includes(player.x) ? this.overshootLerp : this.moveLerp)
      );
      this.pos.y = this.z = k.lerp(
        this.pos.y,
        player.y,
        k.dt() * (this.moveMinMax.y.includes(player.y) ? this.overshootLerp : this.moveLerp)
      );
    }
  },
])

function onLocalPlayerCreated(room: Room<MyRoomState>, playerObj: GameObj) {
  playerObj.tag("localPlayer");

  let mousePos = playerObj.startPos;
  let touchPos = playerObj.startPos;
  const [moveMinX, moveMaxX] = playerObj.moveMinMax.x;
  const [moveMinY, moveMaxY] = playerObj.moveMinMax.y;

  room.onMessage("score", () => {
    mousePos = playerObj.startPos;
    playerObj.controllable = false
    room.send("move", mousePos);

    k.wait(1.25, () => playerObj.controllable = true)
  })

  const move = (_: Vec2, delta: Vec2, isMouse = true) => {
    if ((isMouse && !k.isCursorLocked()) || !playerObj.controllable) return;

    const { x, y } = mousePos;
    const newX = isMoveOvershot('y', x, delta, playerObj) ? x : x + delta.x;
    const newY = isMoveOvershot('x', y, delta, playerObj) ? y : y + delta.y;

    mousePos = k.vec2(
      k.clamp(moveMinX, newX, moveMaxX),
      k.clamp(moveMinY, newY, moveMaxY)
    );

    room.send("move", mousePos);
  }

  k.onMouseMove(move);

  k.onTouchStart(pos => touchPos = pos)
  k.onTouchMove((pos) => {
    move(pos, pos.sub(touchPos).scale(window.devicePixelRatio), false);
    touchPos = pos
  });
}

function isMoveOvershot(axis: "x" | "y", newPos: number, delta: Vec2, playerObj: GameObj) {
  const minMax = playerObj.moveMinMax[axis];

  return minMax.includes(newPos) &&
    !minMax.includes(playerObj.pos[axis]) &&
    Math.abs(delta[axis]) > Math.abs(delta[axis == 'y' ? 'x' : 'y']);
}
