import { staticFile } from "remotion";

/**
 * AUDIO CONSTANTS
 *
 * Purpose: Centralized configuration for all audio files and timing
 * in the StarsAndProductivity scene.
 *
 * Why centralize?
 * - Easy to change audio files
 * - Clear overview of all sounds
 * - Consistent volume levels
 * - Easy to adjust timing
 */

// ============================================================================
// AUDIO FILE PATHS
// ============================================================================

/**
 * All audio files are loaded from the public/ directory using staticFile()
 * This ensures they're properly bundled and accessible during rendering
 */
export const AUDIO_FILES = {
  /**
   * Background Music
   * - Loops continuously throughout the scene
   * - Volume kept low (0.3) to not overpower SFX
   */
  BACKGROUND_MUSIC: staticFile("music/robots-preview.mp3"),

  /**
   * Stars Scene SFX
   * - Plays when stars count appears
   * - Creates emphasis on the metric
   */
  STARS_WHOOSH: staticFile("first-whoosh.mp3"),

  /**
   * Tablet Entry SFX
   * - Plays when tablet slides up
   * - Emphasizes the transition
   */
  TABLET_ENTRY: staticFile("decelerate.mp3"),

  /**
   * Bars Animation SFX
   * - Plays when productivity bars start animating
   * - Adds impact to the data visualization
   */
  BARS_ANIMATE: staticFile("wham.mp3"),

  /**
   * Weekday Wheel SFX
   * - Plays when weekday wheel starts spinning
   * - Weigh sound (mechanical, satisfying)
   */
  WEEKDAY_WHEEL: staticFile("weigh.mp3"),

  /**
   * Hour Wheel SFX
   * - Plays when hour wheel starts spinning
   * - Same sound as weekday for consistency
   */
  HOUR_WHEEL: staticFile("weigh.mp3"),
};

// ============================================================================
// AUDIO TIMING (in frames)
// ============================================================================

/**
 * Frame numbers when each sound should start playing
 * All relative to the scene start (frame 0)
 *
 * Timeline:
 * Frame 0:   Background music starts
 * Frame 10:  Stars whoosh (when text animates in)
 * Frame 150: Tablet entry (when tablet slides up)
 * Frame 180: Bars animate (when first bars start growing)
 * Frame 195: Weekday wheel (when wheel starts spinning)
 * Frame 220: Hour wheel (when second wheel starts spinning)
 */
export const AUDIO_TIMING = {
  /**
   * Background music starts immediately
   */
  BACKGROUND_MUSIC: 0,

  /**
   * Stars whoosh at frame 10
   * - Matches when text starts animating (delay = 10)
   * - Creates synchronized audio-visual feedback
   */
  STARS_WHOOSH: 10,

  /**
   * Tablet entry at frame 150
   * - This is when the tablet scene begins
   * - Matches the Sequence "from" prop
   */
  TABLET_ENTRY: 150,

  /**
   * Bars animate at frame 180
   * - First bar starts at frame 30 (relative to tablet scene)
   * - 150 (tablet start) + 30 = 180
   */
  BARS_ANIMATE: 180,

  /**
   * Weekday wheel at frame 195
   * - Wheel delay is 60 frames (relative to tablet scene)
   * - But we want sound slightly before (95 frames)
   * - 150 (tablet start) + 45 (sound advance) = 195
   */
  WEEKDAY_WHEEL: 195,

  /**
   * Hour wheel at frame 220
   * - Wheel delay is 70 frames (relative to tablet scene)
   * - Sound advance of 50 frames
   * - 150 (tablet start) + 70 (delay) = 220
   */
  HOUR_WHEEL: 220,
};

// ============================================================================
// VOLUME LEVELS
// ============================================================================

/**
 * Volume levels for each audio file (0.0 to 1.0)
 *
 * Guidelines:
 * - Background music: 0.2-0.3 (subtle, atmospheric)
 * - Important SFX: 0.5-0.7 (noticeable but not jarring)
 * - Subtle SFX: 0.3-0.4 (gentle emphasis)
 *
 * Note: These can be adjusted based on the actual audio files
 * Some files are naturally louder than others
 */
export const AUDIO_VOLUMES = {
  /**
   * Background music - kept low to not overpower SFX
   */
  BACKGROUND_MUSIC: 0.3,

  /**
   * Stars whoosh - medium volume for clear emphasis
   */
  STARS_WHOOSH: 0.5,

  /**
   * Tablet entry - slightly louder as it's an important transition
   */
  TABLET_ENTRY: 0.6,

  /**
   * Bars animate - quieter, more subtle
   */
  BARS_ANIMATE: 0.4,

  /**
   * Weekday wheel - medium volume
   */
  WEEKDAY_WHEEL: 0.5,

  /**
   * Hour wheel - same as weekday for consistency
   */
  HOUR_WHEEL: 0.5,
};

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * TypeScript types for audio configuration
 * Ensures type safety when using these constants
 */
export type AudioFileKey = keyof typeof AUDIO_FILES;
export type AudioTimingKey = keyof typeof AUDIO_TIMING;
export type AudioVolumeKey = keyof typeof AUDIO_VOLUMES;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Playing background music
 *
 * <Audio
 *   src={AUDIO_FILES.BACKGROUND_MUSIC}
 *   startFrom={AUDIO_TIMING.BACKGROUND_MUSIC}
 *   volume={AUDIO_VOLUMES.BACKGROUND_MUSIC}
 *   loop
 * />
 */

/**
 * Example 2: Playing a sound effect
 *
 * <Audio
 *   src={AUDIO_FILES.STARS_WHOOSH}
 *   startFrom={AUDIO_TIMING.STARS_WHOOSH}
 *   volume={AUDIO_VOLUMES.STARS_WHOOSH}
 * />
 */

/**
 * Example 3: Adjusting timing for a specific scene
 *
 * // If your scene starts at frame 100 instead of 0:
 * const sceneOffset = 100;
 * <Audio
 *   src={AUDIO_FILES.TABLET_ENTRY}
 *   startFrom={AUDIO_TIMING.TABLET_ENTRY + sceneOffset}
 *   volume={AUDIO_VOLUMES.TABLET_ENTRY}
 * />
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To use different audio files:
 * 1. Add your audio file to the public/ directory
 * 2. Update the path in AUDIO_FILES
 * 3. Adjust volume in AUDIO_VOLUMES if needed
 *
 * To adjust timing:
 * 1. Find the frame where you want the sound to play
 * 2. Update the value in AUDIO_TIMING
 * 3. Test in Remotion Studio to verify synchronization
 *
 * To fine-tune volumes:
 * 1. Play the scene in Remotion Studio
 * 2. Adjust values in AUDIO_VOLUMES
 * 3. Re-render to hear the changes
 */
