import gsap from "gsap";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame } from "remotion";
import { AUDIO_FILES, AUDIO_TIMING, AUDIO_VOLUMES } from "./audio-constants";
import type { ProductivityDataPoint } from "./constants";
import { ProductivityWithAudio } from "./ProductivityWithAudio";
import { TabletSVG } from "./TabletSVG";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TABLET COMPONENT WITH AUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Creates a 3D tablet container that holds the productivity visualization.
 * This is the most complex component with dual animations (entry/exit) and
 * sophisticated 3D transforms.
 *
 * WHAT IT DOES:
 * 1. Slides tablet up from bottom (entry animation)
 * 2. Applies 3D perspective transforms to tablet frame
 * 3. Counter-transforms the chart to appear inside the screen
 * 4. Zooms and rotates during transition
 * 5. Slides back down (exit animation)
 * 6. Plays entry sound effect
 *
 * KEY CONCEPTS:
 * ✅ Dual animation (entry + exit)
 * ✅ Parent-child transform relationships
 * ✅ 3D perspective and depth
 * ✅ Transform composition and order
 * ✅ Counter-rotation techniques
 * ✅ Precise positioning and alignment
 *
 * TRANSFORM PIPELINE:
 * 1. Slide up (translateY)
 * 2. Parent transforms (rotate, skew, scale)
 * 3. Chart counter-transforms (opposite rotation)
 * 4. Result: Chart appears inside tablet screen
 *
 * ANIMATION TIMELINE:
 * Frame 0-16:   Tablet slides up from bottom
 * Frame 30-46:  Zoom transition (entry)
 * Frame 150-195: Exit animation (zoom out)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

/**
 * Animation timing constants
 *
 * These match GitHub Unwrapped's timing exactly
 * Changing these will affect the entire scene flow
 */
const TABLET_SCENE_LENGTH = 150; // Total duration tablet is visible
const TABLET_SCENE_HIDE_ANIMATION = 45; // Exit animation duration
const TABLET_SCENE_ENTER_ANIMATION = 16; // Entry animation duration (very quick!)
const TABLET_SCENE_ENTER_ANIMATION_DELAY = 30; // Delay before entry starts

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Props = {
  graphData: ProductivityDataPoint[]; // 24 hours of productivity data
  weekday: string; // Most productive weekday (0-6)
  hour: string; // Most productive hour (0-23)
};

// ============================================================================
// COMPONENT
// ============================================================================

export const TabletWithAudio: React.FC<Props> = ({
  graphData,
  weekday,
  hour,
}) => {
  const frame = useCurrentFrame();

  /**
   * Helper function: Clamp value between 0 and 1
   *
   * Why needed?
   * - Progress calculations can go negative or above 1
   * - We need to ensure 0 ≤ progress ≤ 1
   * - Prevents visual glitches from out-of-range values
   */
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  /**
   * GSAP easing function
   *
   * power2.out: Fast start, slow end
   * Used for all animations in this component
   */
  const ease = gsap.parseEase("power2.out");

  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION 1: ENTRY (ZOOM IN)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Entry animation progress
   *
   * Timeline:
   * - Starts at: DELAY frame (30)
   * - Duration: ENTER_ANIMATION frames (16)
   * - Ends at: 30 + 16 = 46
   *
   * Formula: (currentFrame - startFrame) / duration
   *
   * Examples:
   * Frame 30: (30-30)/16 = 0.0 (start)
   * Frame 38: (38-30)/16 = 0.5 (halfway)
   * Frame 46: (46-30)/16 = 1.0 (complete)
   *
   * Why so short (16 frames)?
   * - Quick, snappy entrance
   * - Doesn't waste time
   * - Creates energy and momentum
   */
  const entryRaw =
    (frame - TABLET_SCENE_ENTER_ANIMATION_DELAY) / TABLET_SCENE_ENTER_ANIMATION;
  const entryProgress = ease(clamp01(entryRaw));

  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION 2: EXIT (ZOOM OUT)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Exit animation progress
   *
   * Timeline:
   * - Starts at: SCENE_LENGTH frame (150)
   * - Duration: HIDE_ANIMATION frames (45)
   * - Ends at: 150 + 45 = 195
   *
   * Examples:
   * Frame 150: (150-150)/45 = 0.0 (start)
   * Frame 172: (172-150)/45 = 0.49 (halfway)
   * Frame 195: (195-150)/45 = 1.0 (complete)
   *
   * Why longer than entry (45 vs 16)?
   * - Exit can be more leisurely
   * - Gives time to appreciate the data
   * - Smooth, elegant departure
   */
  const exitRaw = (frame - TABLET_SCENE_LENGTH) / TABLET_SCENE_HIDE_ANIMATION;
  const exitProgress = ease(clamp01(exitRaw));

  // ══════════════════════════════════════════════════════════════════════════
  // COMBINED TRANSITION PROGRESS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Combine entry and exit into single value
   *
   * Formula: entryProgress - exitProgress
   *
   * Timeline:
   * Frame 0-30:   0 - 0 = 0 (before entry)
   * Frame 30-46:  0→1 - 0 = 0→1 (entering)
   * Frame 46-150: 1 - 0 = 1 (fully entered)
   * Frame 150-195: 1 - 0→1 = 1→0 (exiting)
   * Frame 195+:   1 - 1 = 0 (fully exited)
   *
   * Why subtract?
   * - Entry adds to the value (0 → 1)
   * - Exit subtracts from the value (1 → 0)
   * - Creates smooth round-trip animation
   */
  const toFullscreenFull = entryProgress - exitProgress;

  /**
   * Scale by 0.68 to match GitHub Unwrapped intensity
   *
   * Why 0.68?
   * - Full value (1.0) would be too extreme
   * - 0.68 creates subtle, elegant effect
   * - Empirically determined to look best
   */
  const toFullscreen = 0.68 * toFullscreenFull;

  // ══════════════════════════════════════════════════════════════════════════
  // 3D TRANSFORM CONSTANTS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Base 3D transform values
   *
   * These define the initial tilted state of the tablet
   * All values are in degrees or unitless (for skew)
   */
  const SCREEN_ROTATION_Y = 15; // Horizontal tilt (left/right)
  const SCREEN_ROTATION_X = -10; // Vertical tilt (up/down)
  const SKEW_X = 7; // Horizontal skew
  const SKEW_Y = -4; // Vertical skew

  // ══════════════════════════════════════════════════════════════════════════
  // CHART TRANSFORMS (INSIDE SCREEN)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Chart transforms: Interpolate from tilted → flat
   *
   * Formula: (1 - toFullscreen) * BASE_VALUE
   *
   * Breakdown:
   * - toFullscreen = 0 (start): (1-0) * BASE = BASE (tilted)
   * - toFullscreen = 1 (end): (1-1) * BASE = 0 (flat)
   *
   * Examples with SCREEN_ROTATION_Y = 15:
   * toFullscreen = 0.0: rotateY = (1-0) * 15 = 15° (tilted)
   * toFullscreen = 0.5: rotateY = (1-0.5) * 15 = 7.5° (halfway)
   * toFullscreen = 1.0: rotateY = (1-1) * 15 = 0° (flat)
   *
   * Why this direction?
   * - Chart starts tilted (matches tablet angle)
   * - Chart ends flat (fills screen)
   * - Creates illusion of zooming into the screen
   */
  const rotateYChart = (1 - toFullscreen) * SCREEN_ROTATION_Y; // 15° → 0°
  const rotateXChart = (1 - toFullscreen) * SCREEN_ROTATION_X; // -10° → 0°
  const skewXChart = (1 - toFullscreen) * SKEW_X; // 7 → 0
  const skewYChart = (1 - toFullscreen) * SKEW_Y; // -4 → 0

  // ══════════════════════════════════════════════════════════════════════════
  // PARENT TRANSFORMS (TABLET FRAME)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Parent transforms: Counter-rotate to create depth
   *
   * Formula: -(1 - toFullscreen) * BASE_VALUE
   *
   * Why negative?
   * - Chart rotates one way
   * - Parent rotates opposite way
   * - Creates separation and depth
   *
   * Examples with SCREEN_ROTATION_Y = 15:
   * toFullscreen = 0.0: rotateY = -(1-0) * 15 = -15° (opposite tilt)
   * toFullscreen = 0.5: rotateY = -(1-0.5) * 15 = -7.5° (halfway)
   * toFullscreen = 1.0: rotateY = -(1-1) * 15 = 0° (flat)
   *
   * Visual effect:
   * - Chart and frame tilt in opposite directions
   * - Creates 3D depth illusion
   * - Makes chart appear "inside" the frame
   */
  const rotateYParent = -(1 - toFullscreen) * SCREEN_ROTATION_Y; // 0° → -15°
  const rotateXParent = -(1 - toFullscreen) * SCREEN_ROTATION_X; // 0° → 10°
  const skewXParent = -(1 - toFullscreen) * SKEW_X; // 0 → -7
  const skewYParent = -(1 - toFullscreen) * SKEW_Y; // 0 → 4

  // ══════════════════════════════════════════════════════════════════════════
  // SCALE ANIMATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Chart scale: Small → Large
   *
   * Formula: (1 - toFullscreen) * smallScale + toFullscreen * largeScale
   *
   * Values:
   * - Small: 0.5 * 0.8 = 0.4 (40% size)
   * - Large: 1.0 (100% size)
   *
   * Timeline:
   * toFullscreen = 0: (1-0)*0.4 + 0*1 = 0.4 (small)
   * toFullscreen = 0.5: (1-0.5)*0.4 + 0.5*1 = 0.7 (growing)
   * toFullscreen = 1: (1-1)*0.4 + 1*1 = 1.0 (large)
   */
  const scaleChart = (1 - toFullscreen) * (0.5 * 0.8) + toFullscreen * 1;

  /**
   * Parent scale: Normal → Zoomed
   *
   * Complex formula to maintain visual balance
   * Compensates for chart scaling
   */
  const scaleParent =
    (1 - toFullscreen) * 1 + toFullscreen * ((1 / (1 - 0.8 * 0.5)) * 1.3);

  /**
   * Master scale: Overall size adjustment
   *
   * Subtle scaling (0.8 → 1.0)
   * Fine-tunes the final appearance
   */
  const masterScale = (1 - toFullscreen) * 0.8 + toFullscreen * 1;

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSLATION (MOVEMENT)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Horizontal and vertical movement during zoom
   *
   * translateX: 0 → -500px (move left)
   * translateY: 0 → 250px (move down)
   *
   * Why move during zoom?
   * - Keeps chart centered in frame
   * - Creates dynamic camera movement
   * - More interesting than static zoom
   */
  const translateX = toFullscreen * -500; // Move left
  const translateY = toFullscreen * 250; // Move down

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN POSITIONING
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Chart position to align with tablet screen
   *
   * Starts offset, ends at origin
   * - left: 350px → 0px
   * - top: 480px → 0px
   *
   * Why these specific values?
   * - 350, 480: Position of screen in tablet image
   * - 0, 0: Full screen position
   * - Interpolates smoothly between them
   */
  const left = (1 - toFullscreen) * 350;
  const top = (1 - toFullscreen) * 480;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <AbsoluteFill
      style={{
        /**
         * SLIDE UP ANIMATION
         *
         * Tablet slides up from bottom of screen
         * - Start: translateY(800px) - below screen
         * - End: translateY(0px) - in view
         *
         * Formula: 800 - (entryProgress * 800)
         * - entryProgress = 0: 800 - 0 = 800px (below)
         * - entryProgress = 0.5: 800 - 400 = 400px (halfway)
         * - entryProgress = 1: 800 - 800 = 0px (in view)
         */
        transform: `translateY(${800 - entryProgress * 800}px)`,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AUDIO: TABLET ENTRY SOUND                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Tablet entry sound effect
       *
       * Plays when tablet starts sliding up (frame 150)
       * Decelerate sound (whoosh/swoosh)
       */}
      <Audio
        src={AUDIO_FILES.TABLET_ENTRY}
        startFrom={AUDIO_TIMING.TABLET_ENTRY}
        volume={AUDIO_VOLUMES.TABLET_ENTRY}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LAYER 1: TABLET FRAME (HANDS + DEVICE)                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <AbsoluteFill>
        <AbsoluteFill
          style={{
            display: "flex",
            position: "absolute",
            transformOrigin: "left bottom", // Pivot point for rotation

            /**
             * PARENT TRANSFORM PIPELINE
             *
             * Transforms apply RIGHT TO LEFT:
             *
             * 1. translateY(250px): Move down
             * 2. translateX(-500px): Move left
             * 3. scale(scaleParent): Adjust size
             * 4. skewY(skewYParent): Vertical skew
             * 5. skewX(skewXParent): Horizontal skew
             * 6. rotateX(rotateXParent): Vertical tilt
             * 7. rotateY(rotateYParent): Horizontal tilt
             * 8. scale(masterScale): Final size adjustment
             *
             * Result: Tablet frame rotates and scales in 3D space
             */
            transform: `scale(${masterScale}) rotateY(${rotateYParent}deg) rotateX(${rotateXParent}deg) skewX(${skewXParent}deg) skewY(${skewYParent}deg) scale(${scaleParent}) translateX(${translateX}px) translateY(${translateY}px)`,
          }}
        >
          {/* Render tablet/hands image */}
          <TabletSVG
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transform: "translateY(100px)", // Offset to align properly
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LAYER 2: PRODUCTIVITY CHART (INSIDE SCREEN)                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <AbsoluteFill>
        <div
          style={{
            left, // Horizontal position (350px → 0px)
            top, // Vertical position (480px → 0px)
            position: "absolute",
            display: "flex",
            flexDirection: "column",

            /**
             * CHART TRANSFORM PIPELINE
             *
             * Transforms apply RIGHT TO LEFT:
             *
             * 1. scale(scaleChart): Adjust size
             * 2. skewY(skewYChart): Vertical skew
             * 3. skewX(skewXChart): Horizontal skew
             * 4. rotateX(rotateXChart): Vertical tilt
             * 5. rotateY(rotateYChart): Horizontal tilt
             * 6. perspective(1200px): 3D depth
             *
             * Result: Chart appears inside tablet screen with matching perspective
             *
             * Why perspective here?
             * - Creates 3D depth for the chart
             * - Makes rotations look realistic
             * - 1200px = subtle effect (not too dramatic)
             */
            transform: `perspective(1200px) rotateY(${rotateYChart}deg) rotateX(${rotateXChart}deg) skewX(${skewXChart}deg) skewY(${skewYChart}deg) scale(${scaleChart})`,
          }}
        >
          <AbsoluteFill style={{ width: 1080, height: 1080 }}>
            {/* Render the productivity visualization */}
            <ProductivityWithAudio
              hour={hour}
              weekday={weekday}
              graphData={graphData}
            />
          </AbsoluteFill>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// TRANSFORM VISUALIZATION
// ============================================================================

/**
 * Transform relationship diagram:
 *
 * ┌─────────────────────────────────────┐
 * │  Slide Up Container                 │
 * │  (translateY animation)             │
 * │                                     │
 * │  ┌───────────────────────────────┐  │
 * │  │  Parent (Tablet Frame)        │  │
 * │  │  - Rotates one direction      │  │
 * │  │  - Scales and skews           │  │
 * │  │                               │  │
 * │  │  ┌─────────────────────────┐  │  │
 * │  │  │  Chart (Inside Screen)  │  │  │
 * │  │  │  - Counter-rotates      │  │  │
 * │  │  │  - Appears "inside"     │  │  │
 * │  │  └─────────────────────────┘  │  │
 * │  └───────────────────────────────┘  │
 * └─────────────────────────────────────┘
 *
 * Key insight:
 * - Parent and chart rotate in OPPOSITE directions
 * - This creates the illusion of depth
 * - Chart appears to be inside the tablet screen
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To adjust entry speed:
 * - Change TABLET_SCENE_ENTER_ANIMATION (16 frames)
 * - Lower = faster, higher = slower
 *
 * To modify 3D effect:
 * - Adjust SCREEN_ROTATION_Y/X values
 * - Change SKEW_X/Y for different perspective
 * - Modify toFullscreen multiplier (0.68)
 *
 * To change zoom intensity:
 * - Adjust scaleChart min/max values
 * - Modify translateX/Y distances
 * - Change left/top positioning
 */
