import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { GAME_WIDTH, GAME_HEIGHT } from "../globals";
import { logger } from "../utils/logger";
import { monitoring } from "../services/monitoring";

// list of avatars
const avatars = ['glady', 'dino', 'bean', 'bag', 'btfly', 'bobo', 'ghostiny', 'ghosty', 'mark'];

export class MyRoom extends Room {
  maxClients = 2;
  state = new MyRoomState();

  teamPlayersCount(team: "left" | "right" = "left") {
    return [...this.state.players.values()].filter(p => p.team == team).length
  }

  onCreate (options: any) {
    logger.gameEvent('room_created', {
      room_id: this.roomId,
      max_clients: this.maxClients,
      options,
    });

    this.onMessage("move", (client, message) => {
      try {
        const player = this.state.players.get(client.sessionId);
        if (player) {
          player.x = message.x;
          player.y = message.y;
        }
      } catch (error) {
        logger.error('Player move error', {
          room_id: this.roomId,
          session_id: client.sessionId,
          message,
        }, error as Error);
      }
    });

    this.onMessage("puck", (client, message) => {
      try {
        if (message?.hit) {
          this.state.lastHitBy = client.sessionId;
          logger.gameEvent('puck_hit', {
            room_id: this.roomId,
            session_id: client.sessionId,
            position: { x: message.x, y: message.y },
          });
        }
        this.state.puckX = message.x;
        this.state.puckY = message.y;
      } catch (error) {
        logger.error('Puck update error', {
          room_id: this.roomId,
          session_id: client.sessionId,
          message,
        }, error as Error);
      }
    });

    this.onMessage("goal", (client, teamNet) => {
      try {
        const team = teamNet == "left" ? "right" : "left";
        this.state[`${team}Score`] += 1;
        const pad = Math.max(this.state.leftScore, this.state.rightScore).toString().length;

        const scoreString = `${String(this.state.leftScore).padStart(pad, "0")}:${String(this.state.rightScore).padStart(pad, "0")}`;
        
        logger.gameEvent('goal_scored', {
          room_id: this.roomId,
          session_id: client.sessionId,
          scoring_team: team,
          score: scoreString,
          left_score: this.state.leftScore,
          right_score: this.state.rightScore,
        });

        this.broadcast("score", scoreString);
      } catch (error) {
        logger.error('Goal scoring error', {
          room_id: this.roomId,
          session_id: client.sessionId,
          team_net: teamNet,
        }, error as Error);
      }
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
    try {
      monitoring.onConnectionJoin(client.sessionId);

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

      logger.gameEvent('player_joined', {
        room_id: this.roomId,
        session_id: client.sessionId,
        team: player.team,
        avatar: player.avatar,
        player_count: this.state.players.size,
        options,
      });
    } catch (error) {
      logger.error('Player join error', {
        room_id: this.roomId,
        session_id: client.sessionId,
        options,
      }, error as Error);
      throw error; // Re-throw to prevent corrupted state
    }
  }

  onLeave (client: Client, consented: boolean) {
    try {
      monitoring.onConnectionLeave(client.sessionId);

      const player = this.state.players.get(client.sessionId);
      this.state.players.delete(client.sessionId);

      this.state.leftScore = 0;
      this.state.rightScore = 0;
      this.broadcast("score", "0:0");

      logger.gameEvent('player_left', {
        room_id: this.roomId,
        session_id: client.sessionId,
        team: player?.team,
        consented,
        remaining_players: this.state.players.size,
      });
    } catch (error) {
      logger.error('Player leave error', {
        room_id: this.roomId,
        session_id: client.sessionId,
        consented,
      }, error as Error);
    }
  }

  onDispose() {
    logger.gameEvent('room_disposed', {
      room_id: this.roomId,
      final_player_count: this.state.players.size,
      final_score: {
        left: this.state.leftScore,
        right: this.state.rightScore,
      },
    });
  }

}
