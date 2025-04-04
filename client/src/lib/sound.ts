import { Howl } from "howler";

// Sound constants
const SOUNDS = {
  correct: {
    src: "https://assets.mixkit.co/active_storage/sfx/1111/1111.wav",
    volume: 0.5,
  },
  incorrect: {
    src: "https://assets.mixkit.co/active_storage/sfx/1112/1112.wav",
    volume: 0.5,
  },
  hint: {
    src: "https://assets.mixkit.co/active_storage/sfx/2205/2205.wav",
    volume: 0.5,
  },
  success: {
    src: "https://assets.mixkit.co/active_storage/sfx/1192/1192.wav",
    volume: 0.6,
  },
  splash: {
    src: "https://assets.mixkit.co/active_storage/sfx/232/232.wav",
    volume: 0.7,
  },
  gameover: {
    src: "https://assets.mixkit.co/active_storage/sfx/1142/1142.wav",
    volume: 0.5,
  },
  click: {
    src: "https://assets.mixkit.co/active_storage/sfx/1114/1114.wav",
    volume: 0.3,
  },
  // Number sequence specific sounds
  error: {
    src: "https://assets.mixkit.co/active_storage/sfx/1112/1112.wav",
    volume: 0.5,
  },
  // Memory game specific sounds
  flip: {
    src: "https://assets.mixkit.co/active_storage/sfx/2073/2073.wav",
    volume: 0.4,
  },
  match: {
    src: "https://assets.mixkit.co/active_storage/sfx/2703/2703.wav",
    volume: 0.5,
  },
  start: {
    src: "https://assets.mixkit.co/active_storage/sfx/2002/2002.wav",
    volume: 0.5,
  }
};

// Sound cache
const soundCache: Record<string, Howl> = {};

// Initialize sounds
function initSounds() {
  Object.entries(SOUNDS).forEach(([name, config]) => {
    soundCache[name] = new Howl({
      src: [config.src],
      volume: config.volume,
      preload: true,
    });
  });
}

// Play a sound
export function playSound(name: keyof typeof SOUNDS) {
  // Initialize sounds on first play
  if (Object.keys(soundCache).length === 0) {
    initSounds();
  }
  
  const sound = soundCache[name];
  if (sound) {
    sound.play();
  }
}

// Preload all sounds
export function preloadSounds() {
  initSounds();
}
