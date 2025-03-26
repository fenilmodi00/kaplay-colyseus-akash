import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { GAME_WIDTH, GAME_HEIGHT } from "../../../globals";

// list of avatars
const avatars = ['glady', 'dino', 'bean', 'bag', 'btfly', 'bobo', 'ghostiny', 'ghosty', 'mark'];

export class MyRoom extends Room {
  maxClients = 2;
  state = new MyRoomState();

  teamPlayersCount(team: "left" | "right" = "left") {
    return [...this.state.players.values()].filter(p => p.team == team).length
  }

  onCreate (options: any) {
    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.x = message.x;
      player.y = message.y;
    });

    this.onMessage("puck", (client, message) => {
      if (message?.hit) this.state.lastHitBy = client.sessionId;
      this.state.puckX = message.x;
      this.state.puckY = message.y;
    });

    this.onMessage("goal", (client, teamNet) => {
      const team = teamNet == "left" ? "right" : "left";
      this.state[`${team}Score`] += 1;
      const pad = Math.max(this.state.leftScore, this.state.rightScore).toString().length;

      this.broadcast("score",
        `${String(this.state.leftScore).padStart(pad, "0")}:${String(this.state.rightScore).padStart(pad, "0")}`
      );
    });

    this.onMessage("event", (client, { name, exceptLocal, data }: { name?: string; exceptLocal?: boolean; data?: any } = {}) => {
      this.broadcast(name ? `event:${name}` : "event", data, exceptLocal && { except: client });
    });

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();
    player.team = this.teamPlayersCount() % 2 ? "right" : "left";
    player.x = player.team == "left" ? GAME_WIDTH / 4 : GAME_WIDTH - (GAME_WIDTH / 4);
    player.y = GAME_HEIGHT / 2;
    player.sessionId = client.sessionId;
    // get a random avatar for the player
    player.avatar = avatars[Math.floor(Math.random() * avatars.length)];

    this.state.players.set(client.sessionId, player);

    this.state.leftScore = 0;
    this.state.rightScore = 0;
    this.broadcast("score", "0:0");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);

    this.state.leftScore = 0;
    this.state.rightScore = 0;
    this.broadcast("score", "0:0");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
