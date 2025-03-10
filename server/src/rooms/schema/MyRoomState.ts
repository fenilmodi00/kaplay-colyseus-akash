import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {
	@type('string') public sessionId: string;
	@type('string') public userId: string;
	@type('string') public avatar: string;
	@type('string') public name: string;
	@type("string") public team: "left" | "right" = "left";
	@type("number") public x: number = 0;
	@type("number") public y: number = 0;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
	@type('number') public puckX: number;
	@type('number') public puckY: number;
	@type('string') public lastHitBy: string;
	@type('number') public leftScore: number = 0;
	@type('number') public rightScore: number = 0;
}
