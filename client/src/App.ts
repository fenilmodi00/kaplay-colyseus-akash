import './index.css';
import { GAME_WIDTH, GAME_HEIGHT } from "./constants";
import kaplay from 'kaplay'
import { colyseusSDK } from "./core/colyseus";
import { createLobbyScene } from './scenes/lobby';
import type { MyRoomState } from './types/schema';
import { clientLogger } from './utils/logger';
import { clientMonitoring } from './services/monitoring';

// Initialize kaplay
export const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  pixelDensity: Math.min(window.devicePixelRatio, 2),
  background: "8db7ff",
  font: "happy-o",
});

// Create all scenes
createLobbyScene();

async function main() {
  try {
    clientLogger.info('Application Starting', {
      game_width: GAME_WIDTH,
      game_height: GAME_HEIGHT,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      pixel_ratio: window.devicePixelRatio,
    });

    // Measure asset loading performance
    const loadStartTime = performance.now();

    await clientMonitoring.measureAsyncPerformance('font_load', async () => {
      await k.loadBitmapFont("happy-o", "assets/happy-o.png", 31, 39);
    });

    await clientMonitoring.measureAsyncPerformance('sound_load', async () => {
      k.loadSound("hit", "sounds/hit.mp3");
    });

    const loadEndTime = performance.now();
    clientLogger.performanceMetric('total_asset_load', loadEndTime - loadStartTime, 'ms');

    // Create main menu
    showMainMenu();

  } catch (error) {
    clientLogger.error('Application Initialization Failed', {
      error_during: 'main_initialization',
    }, error as Error);

    // Show error to user
    const errorText = k.add([
      k.text("Connection failed. Please refresh.", { size: 24 }),
      k.pos(k.center()),
      k.anchor("center"),
      k.color(255, 100, 100)
    ]);

    // Retry after 3 seconds
    setTimeout(() => {
      clientLogger.info('Retrying application initialization');
      window.location.reload();
    }, 3000);
  }
}

function showMainMenu() {
  k.destroyAll();

  // Check if there's a room ID in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');

  if (roomId) {
    // Auto-join if room ID is provided
    joinRoom(false, roomId);
    return;
  }

  // Title
  k.add([
    k.text("Air Hockey", { size: 48 }),
    k.pos(k.center().x, 120),
    k.anchor("center"),
    k.color(255, 255, 255)
  ]);

  // Subtitle
  k.add([
    k.text("Multiplayer Game", { size: 24 }),
    k.pos(k.center().x, 170),
    k.anchor("center"),
    k.color(200, 200, 200)
  ]);

  // Quick Join button (most common action)
  const quickJoinBtn = k.add([
    k.rect(250, 60),
    k.pos(k.center().x, 250),
    k.anchor("center"),
    k.color(50, 150, 250),
    k.area(),
    "button"
  ]);

  k.add([
    k.text("Quick Join", { size: 24 }),
    k.pos(k.center().x, 250),
    k.anchor("center"),
    k.color(255, 255, 255)
  ]);

  // Create Private Room button
  const createBtn = k.add([
    k.rect(200, 50),
    k.pos(k.center().x, 330),
    k.anchor("center"),
    k.color(100, 200, 100),
    k.area(),
    "button"
  ]);

  k.add([
    k.text("Create Private Room", { size: 18 }),
    k.pos(k.center().x, 330),
    k.anchor("center"),
    k.color(255, 255, 255)
  ]);

  // Instructions
  k.add([
    k.text("Quick Join: Join any available game\nPrivate Room: Create a room to share with friends", {
      size: 14,
      align: "center"
    }),
    k.pos(k.center().x, 400),
    k.anchor("center"),
    k.color(180, 180, 180)
  ]);

  // URL sharing info
  k.add([
    k.text("Share the URL with friends to play together!", {
      size: 12,
      align: "center"
    }),
    k.pos(k.center().x, 450),
    k.anchor("center"),
    k.color(150, 150, 150)
  ]);

  // Button interactions
  quickJoinBtn.onClick(async () => {
    await joinRoom(false); // Join existing or create new
  });

  createBtn.onClick(async () => {
    await joinRoom(true); // Create private room
  });

  // Hover effects
  quickJoinBtn.onHover(() => {
    quickJoinBtn.color = k.rgb(70, 170, 255);
  });

  quickJoinBtn.onHoverEnd(() => {
    quickJoinBtn.color = k.rgb(50, 150, 250);
  });

  createBtn.onHover(() => {
    createBtn.color = k.rgb(120, 220, 120);
  });

  createBtn.onHoverEnd(() => {
    createBtn.color = k.rgb(100, 200, 100);
  });
}

async function joinRoom(createNew: boolean = false, specificRoomId?: string) {
  k.destroyAll();

  const statusText = k.add([
    k.text(
      specificRoomId ? `Joining room ${specificRoomId}...` :
        createNew ? "Creating private room..." : "Finding game...",
      { size: 28 }
    ),
    k.pos(k.center()),
    k.anchor("center")
  ]);

  try {
    // Generate a random player name
    const playerNames = ["Player", "Gamer", "Champion", "Ace", "Pro", "Star", "Hero", "Legend"];
    const randomName = playerNames[Math.floor(Math.random() * playerNames.length)] + Math.floor(Math.random() * 1000);

    // Measure connection performance
    const room = await clientMonitoring.measureAsyncPerformance('room_join', async () => {
      if (specificRoomId) {
        // Try to join a specific room by ID
        return await colyseusSDK.joinById<MyRoomState>(specificRoomId, {
          name: randomName
        });
      } else if (createNew) {
        // Create a private room and update URL
        const room = await colyseusSDK.joinOrCreate<MyRoomState>("my_room", {
          name: randomName
        });

        // Update URL with room ID for sharing
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomId}`;
        window.history.replaceState({}, '', newUrl);

        return room;
      } else {
        // Quick join - join any available room
        return await colyseusSDK.joinOrCreate<MyRoomState>("my_room", {
          name: randomName
        });
      }
    });

    // Update URL if not already set
    if (!specificRoomId && !window.location.search.includes('room=')) {
      const newUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomId}`;
      window.history.replaceState({}, '', newUrl);
    }

    statusText.text = `Connected! Room: ${room.roomId}\nWaiting for players...`;

    clientLogger.info('Game Initialized Successfully', {
      session_id: room.sessionId,
      room_id: room.roomId,
      room_name: room.name,
      create_new: createNew,
      specific_room: specificRoomId,
    });

    // Show room info and sharing URL
    const shareText = k.add([
      k.text(`Share this URL: ${window.location.href}`, {
        size: 14
      }),
      k.pos(k.center().x, k.center().y + 50),
      k.anchor("center"),
      k.color(100, 255, 100)
    ]);

    // Show room info for a moment
    setTimeout(() => {
      k.go("lobby", room);
    }, 3000);

    // Measure initial latency
    setTimeout(async () => {
      const latency = await clientMonitoring.measureLatency();
      if (latency > 0) {
        clientLogger.performanceMetric('initial_latency', latency, 'ms');
      }
    }, 1000);

  } catch (error) {
    clientLogger.error('Failed to join room', {
      create_new: createNew,
      specific_room: specificRoomId,
    }, error as Error);

    statusText.text = specificRoomId ?
      `Room ${specificRoomId} not found or full!` :
      "Connection failed!";
    statusText.color = k.rgb(255, 100, 100);

    // Back to menu button
    const backBtn = k.add([
      k.rect(150, 40),
      k.pos(k.center().x, k.center().y + 60),
      k.anchor("center"),
      k.color(100, 100, 100),
      k.area()
    ]);

    k.add([
      k.text("Back to Menu", { size: 16 }),
      k.pos(k.center().x, k.center().y + 60),
      k.anchor("center"),
      k.color(255, 255, 255)
    ]);

    backBtn.onClick(() => {
      // Clear URL parameters and go back to menu
      window.history.replaceState({}, '', window.location.pathname);
      showMainMenu();
    });
  }
}

// Handle page visibility changes for performance monitoring
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clientMonitoring.onGameEvent('page_hidden');
  } else {
    clientMonitoring.onGameEvent('page_visible');
  }
});

// Handle page unload for cleanup
window.addEventListener('beforeunload', () => {
  clientLogger.info('Application Unloading');
  clientMonitoring.destroy();
});

main();
