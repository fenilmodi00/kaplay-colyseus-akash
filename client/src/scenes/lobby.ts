import { k } from "../App";
import { getStateCallbacks, Room } from "colyseus.js";
import type { MyRoomState, Player } from "../types/schema";
import puck from "../objs/puck";
import playground from "../objs/playground";
import player from "../objs/player";
import score from "../objs/score";
import { clientLogger } from "../utils/logger";
import { clientMonitoring } from "../services/monitoring";

export function createLobbyScene() {
  k.scene("lobby", (room: Room<MyRoomState>) => {
    try {
      clientLogger.info('Lobby Scene Started', {
        session_id: room.sessionId,
        room_id: room.roomId,
      });

      k.add(playground());
      k.add(puck(room));
      k.add(score(room));

      // Add room info display
      const roomInfoText = k.add([
        k.text(`Room: ${room.roomId} | Session: ${room.sessionId.substring(0, 8)}...`, { 
          size: 14 
        }),
        k.pos(10, 10),
        k.color(255, 255, 255),
        k.z(100)
      ]);

      // Add player count display
      const playerCountText = k.add([
        k.text("Players: 0/2", { size: 16 }),
        k.pos(10, 30),
        k.color(200, 255, 200),
        k.z(100)
      ]);

      // Add instructions
      const instructionsText = k.add([
        k.text("Share this URL with friends to play together!\nClick to lock cursor and control your paddle", { 
          size: 12,
          align: "center"
        }),
        k.pos(k.center().x, k.height() - 40),
        k.anchor("center"),
        k.color(180, 180, 180),
        k.z(100)
      ]);

      const $ = getStateCallbacks(room as any);

      // keep track of player sprites
      const spritesBySessionId: Record<string, any> = {};

      // Update player count when players change
      const updatePlayerCount = () => {
        const count = room.state.players.size;
        playerCountText.text = `Players: ${count}/2`;
        
        if (count === 1) {
          instructionsText.text = "Waiting for another player to join...\nShare this URL: " + window.location.href;
          instructionsText.color = k.rgb(255, 255, 100);
        } else if (count === 2) {
          instructionsText.text = "Game ready! Click to lock cursor and control your paddle";
          instructionsText.color = k.rgb(100, 255, 100);
        }
      };

      // listen when a player is added on server state
      $(room.state as any).players.onAdd(async (player: Player, sessionId: string) => {
        try {
          clientMonitoring.onGameEvent('player_added', {
            session_id: sessionId,
            team: player.team,
            avatar: player.avatar,
            total_players: room.state.players.size,
          });

          spritesBySessionId[sessionId] = await clientMonitoring.measureAsyncPerformance(
            'player_sprite_creation',
            () => createPlayer(room, player)
          );
          
          updatePlayerCount();
        } catch (error) {
          clientLogger.error('Failed to create player sprite', {
            session_id: sessionId,
            avatar: player.avatar,
          }, error as Error);
        }
      });

      // listen when a player is removed from server state
      $(room.state as any).players.onRemove(async (_: Player, sessionId: string) => {
        try {
          clientMonitoring.onGameEvent('player_removed', {
            session_id: sessionId,
            remaining_players: room.state.players.size,
          });

          const playerObj = spritesBySessionId[sessionId];
          if (playerObj) {
            await k.tween(playerObj.scale, k.vec2(0), 0.25, v => playerObj.scale = v, k.easings.easeOutQuad);
            playerObj.destroy();
            delete spritesBySessionId[sessionId];
          }
          
          updatePlayerCount();
        } catch (error) {
          clientLogger.error('Failed to remove player sprite', {
            session_id: sessionId,
          }, error as Error);
        }
      });

      // Initial player count update
      updatePlayerCount();

      // Monitor game state changes
      room.onStateChange((state) => {
        clientMonitoring.onGameEvent('game_state_update', {
          left_score: state.leftScore,
          right_score: state.rightScore,
          players_count: state.players.size,
          puck_position: { x: state.puckX, y: state.puckY },
        });
      });

      // Monitor score changes
      room.onMessage("score", (scoreString) => {
        clientMonitoring.onGameEvent('score_update', {
          score: scoreString,
        });
      });

      k.onClick(() => {
        clientMonitoring.onGameEvent('cursor_lock_requested');
        k.setCursorLocked(true);
      });

    } catch (error) {
      clientLogger.error('Lobby Scene Initialization Failed', {
        session_id: room.sessionId,
      }, error as Error);
    }
  })
}

async function createPlayer(room: Room<MyRoomState>, playerState: Player) {
  try {
    await k.loadSprite(playerState.avatar, `assets/${playerState.avatar}.png`);
    await k.getSprite(playerState.avatar);
    
    const playerObj = k.add(player(room, playerState));
    
    clientLogger.debug('Player sprite created successfully', {
      session_id: playerState.sessionId,
      avatar: playerState.avatar,
      team: playerState.team,
    });
    
    return playerObj;
  } catch (error) {
    clientLogger.error('Failed to create player sprite', {
      session_id: playerState.sessionId,
      avatar: playerState.avatar,
    }, error as Error);
    throw error;
  }
}
