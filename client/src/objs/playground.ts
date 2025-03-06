import { k } from "../App"
import type { GameObj } from "kaplay"

export default () => ([
  k.pos(),
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

      this.add([
        k.pos(10),
        k.rect(k.width() - 20, k.height() - 20, { radius: 100 }),
        k.outline(10, k.WHITE),
        k.opacity(0.25),
      ])
    }
  }
])