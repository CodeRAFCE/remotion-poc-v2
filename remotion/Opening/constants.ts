// Opening Scene Constants
export const OPENING_SCENE_LENGTH = 130; // ~4.3 seconds at 30fps
export const OPENING_SCENE_OUT_OVERLAP = 10; // Overlap with next scene for smooth transition

// Asset paths - now in our public folder
export const LAUNCH_SOUND = "rocket-launch.mp3";
export const FIRST_WHOOSH_SOUND = "first-whoosh.mp3";
export const FOREGROUND_IMAGE = "foreground.png";
export const BACKGROUND_MOUNTAINS_IMAGE = "background-mountains.png";
export const WHITE_HIGHLIGHT = "WhiteHighlight.png";
export const PINK_HIGHLIGHT = "PinkHighlight.png";

// Rocket images by theme
export const getRocketImage = (theme: "blue" | "orange" | "yellow") => {
  return `rocket-side-${theme}.png`;
};

// Exhaust flame videos - browser specific
export const getExhaustFlame = (
  theme: "blue" | "orange",
  isWebkit: boolean,
) => {
  const codec = isWebkit ? "hevc-safari" : "vp9-chrome";
  const ext = isWebkit ? "mp4" : "webm";
  return `exhaust-${theme}-${codec}.${ext}`;
};

// Color constants
export const PANE_BACKGROUND = "rgba(230, 225, 252, 0.8)";
export const PANE_TEXT_COLOR = "#01064A";
export const PANE_BORDER = "2px solid rgba(255, 255, 255, 0.1)";
export const INNER_BORDER_RADIUS = 30;
export const PADDING = 20;
export const TITLE_IMAGE_SIZE = 160;
