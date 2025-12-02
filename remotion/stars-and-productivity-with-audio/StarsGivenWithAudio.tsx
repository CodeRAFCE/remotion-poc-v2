import gsap from "gsap";
import React from "react";
import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from "remotion";
import { AUDIO_FILES, AUDIO_TIMING, AUDIO_VOLUMES } from "./audio-constants";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STARSGIVEN COMPONENT WITH AUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * First scene in the StarsAndProductivity sequence. Displays the total number
 * of stars given by the user with animated text and gradient background.
 *
 * WHAT IT DOES:
 * 1. Fades in a purple gradient background
 * 2. Animates in "Stars Given" text with scale and opacity
 * 3. Shows the stars count number prominently
 * 4. Plays a whoosh sound effect when text appears
 * 5. Fades out smoothly to transition to tablet scene
 *
 * KEY CONCEPTS TO LEARN:
 * ✅ Remotion's interpolate() for smooth value mapping
 * ✅ GSAP easing for natural animation curves
 * ✅ Opacity fade-in/fade-out animations
 * ✅ Scale transforms for emphasis
 * ✅ Audio component integration
 * ✅ Frame-based timing synchronization
 *
 * ANIMATION TIMELINE:
 * Frame 0-10:   Background fades in (opacity 0 → 1)
 * Frame 10-60:  Text scales and fades in (scale 0.5 → 1, opacity 0 → 1)
 * Frame 60-120: Hold (everything visible)
 * Frame 120-150: Fade out (opacity 1 → 0)
 *
 * AUDIO:
 * Frame 10: Whoosh sound effect (synchronized with text animation)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Props = {
  /**
   * Total number of stars given by the user
   * Example: 42
   */
  starsGiven: number;

  /**
   * Optional CSS styles from parent component
   * Used for zoom transition effects
   */
  style?: React.CSSProperties;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const StarsGivenWithAudio: React.FC<Props> = ({ starsGiven, style }) => {
  // Get current frame number (0, 1, 2, 3, ...)
  const frame = useCurrentFrame();

  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION 1: BACKGROUND FADE IN
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Background opacity animation
   *
   * What: Fades background from invisible to visible
   * When: Frames 0-10
   * How: Linear interpolation (no easing needed for background)
   *
   * interpolate() parameters:
   * - frame: Current frame number
   * - [0, 10]: Input range (start at 0, end at 10)
   * - [0, 1]: Output range (opacity 0 to 1)
   * - extrapolateLeft: "clamp" - stay at 0 before frame 0
   * - extrapolateRight: "clamp" - stay at 1 after frame 10
   *
   * Result:
   * Frame 0:  opacity = 0 (invisible)
   * Frame 5:  opacity = 0.5 (half visible)
   * Frame 10: opacity = 1 (fully visible)
   * Frame 20: opacity = 1 (stays at 1)
   */
  const backgroundOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION 2: TEXT SCALE AND FADE IN
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Text animation with GSAP easing
   *
   * Why GSAP instead of interpolate()?
   * - GSAP provides more natural easing curves
   * - "power2.out" creates smooth deceleration
   * - Feels more organic than linear interpolation
   *
   * Timeline:
   * - Delay: 10 frames (wait for background to fade in)
   * - Duration: 50 frames (smooth, not too fast)
   * - Total: Frames 10-60
   */

  const textDelay = 10; // Start after background is visible
  const textDuration = 50; // Animation length

  /**
   * Calculate raw progress (0 to 1)
   *
   * Formula: (currentFrame - startFrame) / duration
   *
   * Examples:
   * Frame 10: (10 - 10) / 50 = 0.0 (start)
   * Frame 35: (35 - 10) / 50 = 0.5 (halfway)
   * Frame 60: (60 - 10) / 50 = 1.0 (complete)
   * Frame 100: (100 - 10) / 50 = 1.8 → clamped to 1.0
   */
  const textProgress = Math.max(
    0, // Don't go below 0
    Math.min(1, (frame - textDelay) / textDuration), // Don't go above 1
  );

  /**
   * Apply GSAP easing curve
   *
   * "power2.out" curve:
   * - Starts fast (quick initial movement)
   * - Slows down at the end (smooth landing)
   * - Creates natural, organic feel
   *
   * Comparison:
   * Linear:     0.0 → 0.25 → 0.5 → 0.75 → 1.0 (constant speed)
   * power2.out: 0.0 → 0.44 → 0.75 → 0.94 → 1.0 (decelerating)
   */
  const ease = gsap.parseEase("power2.out");
  const textEased = ease(textProgress);

  /**
   * Text scale animation
   *
   * Starts at 50% size, grows to 100%
   * Formula: 0.5 + (progress * 0.5)
   *
   * Examples:
   * progress = 0.0: scale = 0.5 (half size)
   * progress = 0.5: scale = 0.75 (three-quarters)
   * progress = 1.0: scale = 1.0 (full size)
   *
   * Why start at 0.5 instead of 0?
   * - Starting at 0 would be invisible
   * - 0.5 creates a subtle "pop in" effect
   * - More elegant than growing from nothing
   */
  const textScale = 0.5 + textEased * 0.5;

  /**
   * Text opacity animation
   *
   * Fades from invisible to visible
   * Synchronized with scale for cohesive effect
   *
   * Examples:
   * progress = 0.0: opacity = 0 (invisible)
   * progress = 0.5: opacity = 0.5 (half visible)
   * progress = 1.0: opacity = 1 (fully visible)
   */
  const textOpacity = textEased;

  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION 3: FADE OUT (TRANSITION)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Fade out animation for transition to tablet scene
   *
   * What: Fades entire scene from visible to invisible
   * When: Frames 120-150
   * Why: Smooth transition, not abrupt cut
   *
   * Timeline:
   * Frame 120: opacity = 1 (fully visible)
   * Frame 135: opacity = 0.5 (half faded)
   * Frame 150: opacity = 0 (invisible)
   */
  const fadeOutOpacity = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp", // Stay at 1 before frame 120
    extrapolateRight: "clamp", // Stay at 0 after frame 150
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <AbsoluteFill style={style}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AUDIO: WHOOSH SOUND EFFECT                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Whoosh sound effect
       *
       * Plays when text starts animating (frame 10)
       * Creates audio-visual synchronization
       *
       * Props:
       * - src: Audio file path from constants
       * - startFrom: Frame number when sound should play
       * - volume: 0.0 to 1.0 (0.5 = 50% volume)
       */}
      <Audio
        src={AUDIO_FILES.STARS_WHOOSH}
        startFrom={AUDIO_TIMING.STARS_WHOOSH}
        volume={AUDIO_VOLUMES.STARS_WHOOSH}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LAYER 1: GRADIENT BACKGROUND                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Purple gradient background
       *
       * Gradient direction: 135deg (diagonal from top-left to bottom-right)
       * Color 1: #667eea (blue-purple)
       * Color 2: #764ba2 (deep purple)
       *
       * Why this gradient?
       * - Matches GitHub Unwrapped aesthetic
       * - Purple is associated with creativity/achievement
       * - Diagonal creates visual interest
       *
       * Opacity:
       * - Controlled by backgroundOpacity (fade in)
       * - AND fadeOutOpacity (fade out)
       * - Multiplying them creates smooth transitions
       */}
      <AbsoluteFill
        style={{
          opacity: backgroundOpacity * fadeOutOpacity,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LAYER 2: TEXT CONTENT                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Text container
       *
       * Layout:
       * - Centered vertically and horizontally
       * - Flexbox column (stacks label, number, icon)
       *
       * Animations:
       * - opacity: Fades in with text, fades out with scene
       * - transform: Scales from 0.5 to 1.0
       */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: textOpacity * fadeOutOpacity,
          transform: `scale(${textScale})`,
        }}
      >
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* "STARS GIVEN" LABEL                                              */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/**
         * Label text
         *
         * Typography:
         * - Font size: 60px (large but not overwhelming)
         * - Font weight: bold (emphasis)
         * - Color: rgba(255, 255, 255, 0.8) (white with 80% opacity)
         * - Font family: Mona Sans (GitHub's font)
         *
         * Why semi-transparent white?
         * - Creates hierarchy (less important than number)
         * - Softer, more elegant than pure white
         * - Good contrast on purple background
         */}
        <div
          style={{
            fontSize: 60,
            fontWeight: "bold",
            color: "rgba(255, 255, 255, 0.8)",
            fontFamily: "Mona Sans",
            marginBottom: 20,
          }}
        >
          Stars Given
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* STAR COUNT NUMBER                                                */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/**
         * Stars count number
         *
         * Typography:
         * - Font size: 180px (HUGE - this is the hero element)
         * - Font weight: bold (maximum emphasis)
         * - Color: white (pure white for maximum contrast)
         * - Font family: Mona Sans
         *
         * Why so large?
         * - This is the main metric, the star of the show
         * - Should be immediately readable
         * - Creates visual impact
         */}
        <div
          style={{
            fontSize: 180,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Mona Sans",
          }}
        >
          {starsGiven}
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* DECORATIVE STAR ICON                                             */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/**
         * Star emoji
         *
         * Why include this?
         * - Visual reinforcement of "stars" concept
         * - Adds playfulness and personality
         * - Balances the composition
         *
         * Size: 100px (large but smaller than number)
         */}
        <div
          style={{
            fontSize: 100,
            marginTop: 20,
          }}
        >
          ⭐
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// DURATION CALCULATION
// ============================================================================

/**
 * getStarFlyDuration()
 *
 * Returns the total duration of the StarsGiven scene
 *
 * Why a function instead of a constant?
 * - In GitHub Unwrapped, duration varies based on stars count
 * - More stars = longer animation (stars fly in one by one)
 * - We're using a fixed duration for simplicity
 *
 * Duration: 150 frames
 * At 30fps: 150 / 30 = 5 seconds
 *
 * Breakdown:
 * - 0-10: Background fade (0.33s)
 * - 10-60: Text animate (1.67s)
 * - 60-120: Hold (2s)
 * - 120-150: Fade out (1s)
 * Total: 5 seconds
 */
export const getStarFlyDuration = () => {
  return 150; // Fixed duration: 150 frames (~5 seconds at 30fps)
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example usage:
 *
 * <StarsGivenWithAudio
 *   starsGiven={42}
 *   style={{
 *     transform: "scale(1.2)",
 *     opacity: 0.8,
 *   }}
 * />
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To change the gradient colors:
 * 1. Update the background property in the gradient AbsoluteFill
 * 2. Use a gradient generator: https://cssgradient.io/
 * 3. Test contrast with white text
 *
 * To adjust animation timing:
 * 1. Change textDelay for when text starts
 * 2. Change textDuration for animation speed
 * 3. Update fade out range [120, 150]
 *
 * To use a different easing:
 * 1. Try: "power1.out", "power3.out", "elastic.out", "back.out"
 * 2. See: https://greensock.com/docs/v3/Eases
 * 3. Test in Remotion Studio
 *
 * To change the audio:
 * 1. Update AUDIO_FILES.STARS_WHOOSH in audio-constants.ts
 * 2. Adjust volume in AUDIO_VOLUMES if needed
 * 3. Fine-tune timing in AUDIO_TIMING
 */
