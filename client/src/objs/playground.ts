import { k } from "../App"
import type { GameObj } from "kaplay"

export default () => ([
  k.pos(),
  k.z(0),
  {
    add(this: GameObj) {
      const thickness = 100;
      const bleed = 5;

      this.boundaries = [
        { x: bleed, y: bleed - thickness, w: k.width() - bleed * 2, h: thickness },
        { x: bleed, y: k.height() - bleed, w: k.width() - bleed * 2, h: thickness },
        { x: bleed - thickness, y: bleed, w: thickness, h: k.height() - bleed * 2 },
        { x: k.width() - bleed, y: bleed, w: thickness, h: k.height() - bleed * 2 },
      ].map(({ x, y, w, h }) => {
          this.add([
            k.pos(x, y),
            k.rect(w, h, { fill: false }),
            k.area({ collisionIgnore: ["boundary"] }),
            k.body({ isStatic: true }),
            "boundary",
          ]);
      });

      const field = this.add([
        k.anchor("center"),
        k.pos(k.center()),
        k.rect(k.width() - 20, k.height() - 20, { radius: 100 }),
        k.outline(10, k.WHITE),
        k.opacity(0.4),
      ]);

      field.onDraw(() => {
        k.drawMasked(() => {
          k.drawCircle({
            radius: 114,
            color: k.Color.fromHex("c9ddff"),
          });

          k.drawRect({
            anchor: "center",
            height: field.height - 5,
            width: 20,
            color: k.Color.fromHex("adb2f0"),
            outline: {
              width: 4,
              color: k.Color.fromHex("c9ddff"),
            },
          });

          k.drawCircle({
            radius: 100,
            color: k.Color.fromHex("bbd4ff"),
            outline: {
              width: 20,
              color: k.Color.fromHex("adb2f0"),
            },
          });

          k.drawCircle({
            radius: 16,
            color: k.Color.fromHex("834dc4"),
            outline: {
              width: 4,
              color: k.Color.fromHex("d6e5ff"),
            }
          });
        }, () => {
          k.drawRect({
            anchor: "center",
            width: field.width - 10,
            height: field.height - 10,
            radius: +(field?.radius ?? 100) - 10,
          })
        })
      })
    }
  }
])