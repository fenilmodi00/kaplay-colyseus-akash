import { k } from "../App"
import { Room } from "colyseus.js";
import type { MyRoomState } from "../../../server/src/rooms/schema/MyRoomState";
import type { Collision, DrawRectOpt, Game, GameObj } from "kaplay"

const size = 48;
const startPos = () => (k.vec2(k.width(), k.height()).scale(0.5).sub(0, 6));

export default (room: Room<MyRoomState>) => ([
  k.pos(startPos()),
  k.anchor("center"),
  k.area({
    shape: new k.Circle(k.vec2(0), size / 2),
    restitution: 0.2,
  }),
  k.body(),
  k.scale(),
  k.z((k.height() - size) / 2),
  "puck",
  {
    add(this: GameObj) {
      const localPlayerId = room.sessionId;

      this.onCollide("localPlayer", (_: GameObj, col: Collision) => {
        room.send("puck", { ...this.pos, hit: true });
        this.vel = k.vec2(0);
        this.applyImpulse(col.normal.scale(col.distance).scale(100));
      });

      this.onCollide("boundary", () => {
        k.shake(2);
      });

      this.onCollide("net", async (net: GameObj) => {
        if (room.state.lastHitBy != localPlayerId) return;

        room.send("goal", net.team);
        room.send("puck", startPos());
      });

      room.onMessage("goal", async () => {
        this.vel = k.vec2(0);
        this.collisionIgnore.push("player");

        k.shake(10);
        k.flash(k.getBackground() ?? k.WHITE, 0.25);
        k.burp();

        await k.tween(this.scale, k.vec2(0), 0.25, v => this.scale = v, k.easings.easeOutQuad);
        this.pos = startPos();

        k.wait(1, () => {
          this.collisionIgnore = this.collisionIgnore.filter((c: string) => c != "player");
          k.tween(this.scale, k.vec2(1), 0.25, v => this.scale = v, k.easings.easeOutQuad);
        })
      });

      this.onUpdate(() => {
        if (localPlayerId == (room.state?.lastHitBy ?? localPlayerId)) {
          room.send("puck", this.pos);
        } else {
          this.pos.x = k.lerp(this.pos.x, room.state.puckX, 12 * k.dt());
          this.pos.y = k.lerp(this.pos.y, room.state.puckY, 12 * k.dt());
        }

        this.z = this.pos.y;
      })
    },

    draw() {
      const side: DrawRectOpt = {
        pos: k.vec2(0, size / 4),
        anchor: "center",
        width: size,
        height: size * 0.75,
        color: k.Color.fromHex("4a3052"),
        outline: {
          width: 4,
          color: k.Color.fromHex("1f102a")
        },
        radius: [8, 8, size, size],
      };

      k.drawRect({ ...side, pos: side.pos?.scale(2), opacity: 0.2 });
      k.drawRect(side);

      k.drawEllipse({
        anchor: "center",
        radiusX: size / 2,
        radiusY: size / 2 - 4,
        color: k.Color.fromHex("7b5480"),
        outline: {
          width: 4,
          color: k.Color.fromHex("1f102a"),
        },
      });
    }
  },
])
