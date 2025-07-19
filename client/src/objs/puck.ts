import { k } from "../App";
import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState } from "../types/schema";
import type { Collision, DrawRectOpt, GameObj } from "kaplay";

const size = 48;
const startPos = () => (k.center().sub(0, 6));

export default (room: Room<MyRoomState>) => ([
  k.pos(startPos()),
  k.anchor("center"),
  k.area({
    shape: new k.Circle(k.vec2(0), size / 2),
    restitution: 0.2,
  }),
  k.body(),
  k.scale(0),
  k.z((k.height() - size) / 2),
  "puck",
  {
    add(this: GameObj) {
      const $ = getStateCallbacks(room as any);
      const localPlayerId = room.sessionId;

      k.wait(room.state.puckX || room.state.puckX ? 1.25 : 0, () =>
        k.tween(this.scale, k.vec2(1), 0.25, v => this.scale = v, k.easings.easeOutBack));

      this.onCollide("localPlayer", (_: GameObj, col: Collision) => {
        room.send("puck", { ...this.pos, hit: true });
        this.vel = k.vec2(0);
        this.applyImpulse(col.normal.scale(col.distance).scale(100));
        k.play("hit");
      });

      this.onCollide("player", (obj: GameObj) => {
        if (obj.is("localPlayer")) return;

        room.send("event", { name: "hit" });
      });

      this.onCollide("boundary", () => {
        if (room.state.lastHitBy != localPlayerId) return;

        k.shake(2);
        k.play("hit");
        room.send("event", { name: "hit", exceptLocal: true, data: "boundary" });
      });

      room.onMessage("event:hit", async (target) => {
        k.play("hit");
        if (target == "boundary") k.shake(2);
      });

      $(room.state as any).listen("lastHitBy", (id: string) => {
        if (id == localPlayerId) return;
        this.vel = k.vec2(0);
      });

      this.onCollide("net", async (net: GameObj) => {
        if (room.state.lastHitBy != localPlayerId) return;

        room.send("goal", net.team);
        room.send("puck", startPos());
      });

      room.onMessage("score", async (score) => {
        this.vel = k.vec2(0);
        this.collisionIgnore.push("player");

        if (score != "0:0") {
          k.addKaboom(k.vec2(k.clamp(100, room.state.puckX, k.width() - 100), room.state.puckY), { scale: 0.8 });

          k.shake(10);
          k.flash(k.getBackground() ?? k.WHITE, 0.25);
          k.burp();
        }

        await k.tween(this.scale, k.vec2(0), 0.25, v => this.scale = v, k.easings.easeOutQuad);
        room.send("puck", startPos());
        this.pos = startPos();

        k.wait(1, () => {
          this.collisionIgnore = this.collisionIgnore.filter((c: string) => c != "player");
          k.tween(this.scale, k.vec2(1), 0.25, v => this.scale = v, k.easings.easeOutQuad);
        });
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
          color: k.Color.fromHex("1f102a"),
        },
        radius: [8, 8, size, size],
      };

      // Raytracing :)
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
    },
  },
]);
