import gsap from "gsap";
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from "remotion";
import { AUDIO_FILES, AUDIO_TIMING, AUDIO_VOLUMES } from "./audio-constants";
import type { ProductivityDataPoint } from "./constants";
import { StarsGivenWithAudio, getStarFlyDuration } from "./StarsGivenWithAudio";
import { TabletWithAudio } from "./TabletWithAudio";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STARSANDPRODUCTIVITY - MAIN ORCHESTRATOR WITH AUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Main orchestrator that combines two scenes with smooth transitions and audio:
 * 1. StarsGiven scene (stars count with gradient background)
 * 2. Tablet scene (productivity graph with 3D effects)
 *
 * WHAT IT DOES:
 * 1. Manages scene timing and sequencing
 * 2. Creates zoom transition between scenes
 * 3. Controls scene visibility
 * 4. Plays background music throughout
 * 5. Coordinates all audio and visual elements
 *
 * KEY CONCEPTS TO LEARN:
 * ✅ Sequence composition (timing multiple scenes)
 * ✅ Zoom transition effects between scenes
 * ✅ Opacity fading for smooth transitions
 * ✅ Dynamic duration calculation
 * ✅ Props passing and data flow
 * ✅ useMemo for performance optimization
 * ✅ Background music integration
 *
 * SCENE FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Frame 0-150:    StarsGiven (with zoom-out transition)                   │
 * │ Frame 150-300:  Tablet (with zoom-in transition)                        │
 * │ Frame 300-345:  Exit animation                                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * AUDIO TIMELINE:
 * Frame 0:   Background music starts (loops)
 * Frame 10:  Stars whoosh (from StarsGiven component)
 * Frame 150: Tablet entry (from Tablet component)
 * Frame 180: Bars animate (from Productivity component)
 * Frame 195: Weekday wheel (from TopDay component)
 * Frame 220: Hour wheel (from TopDay component)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// ANIMATION TIMING CONSTANTS
// ============================================================================

/**
 * Scene timing constants
 *
 * These control the overall flow of the composition
 * All values are in frames (at 30fps)
 */
const TABLET_SCENE_LENGTH = 150; // How long tablet is visible (5 seconds)
const TABLET_SCENE_HIDE_ANIMATION = 45; // Exit animation duration (1.5 seconds)
const TABLET_ENTER_DURATION = 45; // Entry animation duration (1.5 seconds)

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props Definition
 *
 * All data comes from JSON (no API calls):
 * - starsGiven: Total stars given by user
 * - topWeekday: Most productive day (e.g., "3" for Thursday)
 * - topHour: Most productive hour (e.g., "14" for 2 PM)
 * - graphData: Hourly productivity data for the bar chart
 *
 * Example props:
 * {
 *   starsGiven: 42,
 *   topWeekday: "3",
 *   topHour: "14",
 *   graphData: MOCK_PRODUCTIVITY_DATA
 * }
 */
type Props = {
  starsGiven: number; // Total stars given
  topWeekday: string; // Most productive weekday (0-6)
  topHour: string; // Most productive hour (0-23)
  graphData: ProductivityDataPoint[]; // 24 hours of data
};

// ============================================================================
// DURATION CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate when tablet should start hiding
 *
 * Formula: StarsGiven duration + Tablet visible duration
 *
 * Example:
 * - StarsGiven: 150 frames
 * - Tablet visible: 150 frames
 * - Total: 300 frames (tablet starts hiding at frame 300)
 */
const getTimeUntilTabletHides = () => {
  return getStarFlyDuration() + TABLET_SCENE_LENGTH;
};

/**
 * Calculate total composition duration
 *
 * Formula: Time until hide + Hide animation duration
 *
 * Example:
 * - Time until hide: 300 frames
 * - Hide animation: 45 frames
 * - Total: 345 frames (11.5 seconds at 30fps)
 *
 * This is exported so Root.tsx can set the composition duration
 */
export const getStarsAndProductivityDuration = () => {
  return getTimeUntilTabletHides() + TABLET_SCENE_HIDE_ANIMATION;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const StarsAndProductivityWithAudio: React.FC<Props> = ({
  starsGiven,
  topWeekday,
  topHour,
  graphData,
}) => {
  const frame = useCurrentFrame();

  // ══════════════════════════════════════════════════════════════════════════
  // MEMOIZED CALCULATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * useMemo: Performance optimization
   *
   * Why use useMemo?
   * - These functions are called every frame (30 times per second)
   * - Results don't change during the composition
   * - Memoizing prevents unnecessary recalculations
   * - Improves rendering performance
   *
   * Dependencies: [] (empty array)
   * - Means: Calculate once, never recalculate
   * - Safe because values are constant
   */

  const starFlyDuration = useMemo(() => {
    return getStarFlyDuration(); // 150 frames
  }, []);

  const timeUntilTabletHides = useMemo(() => {
    return getTimeUntilTabletHides(); // 300 frames
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // ZOOM TRANSITION ANIMATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Zoom transition creates smooth camera movement between scenes
   *
   * Effect:
   * - StarsGiven zooms out and moves to top-right
   * - Tablet zooms in simultaneously
   * - Creates cinematic transition (not just a cut)
   *
   * Timeline:
   * 1. Entry: Frame 150 → 195 (45 frames)
   * 2. Hold: Frame 195 → 300 (105 frames)
   * 3. Exit: Frame 300 → 345 (45 frames)
   */

  /**
   * GSAP easing function
   *
   * power2.out: Fast start, slow end
   * Creates smooth, natural-feeling transitions
   */
  const ease = gsap.parseEase("power2.out");

  /**
   * Helper: Clamp value between 0 and 1
   *
   * Ensures progress values stay in valid range
   * Prevents visual glitches from out-of-range values
   */
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  // ──────────────────────────────────────────────────────────────────────────
  // ENTRY PROGRESS (ZOOM IN)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Entry animation progress
   *
   * Timeline:
   * - Starts: Frame 150 (when tablet scene begins)
   * - Duration: 45 frames (TABLET_ENTER_DURATION)
   * - Ends: Frame 195
   *
   * Formula: (currentFrame - startFrame) / duration
   *
   * Examples:
   * Frame 150: (150-150)/45 = 0.0 (start)
   * Frame 172: (172-150)/45 = 0.49 (halfway)
   * Frame 195: (195-150)/45 = 1.0 (complete)
   */
  const entryRaw = (frame - starFlyDuration) / TABLET_ENTER_DURATION;
  const entryProgress = ease(clamp01(entryRaw));

  // ──────────────────────────────────────────────────────────────────────────
  // EXIT PROGRESS (ZOOM OUT)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Exit animation progress
   *
   * Timeline:
   * - Starts: Frame 300 (starFlyDuration + TABLET_SCENE_LENGTH)
   * - Duration: 45 frames (TABLET_SCENE_HIDE_ANIMATION)
   * - Ends: Frame 345
   *
   * Examples:
   * Frame 300: (300-300)/45 = 0.0 (start)
   * Frame 322: (322-300)/45 = 0.49 (halfway)
   * Frame 345: (345-300)/45 = 1.0 (complete)
   */
  const exitRaw =
    (frame - (starFlyDuration + TABLET_SCENE_LENGTH)) /
    TABLET_SCENE_HIDE_ANIMATION;
  const exitProgress = ease(clamp01(exitRaw));

  // ──────────────────────────────────────────────────────────────────────────
  // COMBINED TRANSITION VALUE
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Combine entry and exit into single transition value
   *
   * Formula: entryProgress - exitProgress
   *
   * Timeline:
   * Frame 0-150:   0 - 0 = 0 (no transition)
   * Frame 150-195: 0→1 - 0 = 0→1 (zooming in)
   * Frame 195-300: 1 - 0 = 1 (fully zoomed)
   * Frame 300-345: 1 - 0→1 = 1→0 (zooming out)
   * Frame 345+:    1 - 1 = 0 (back to start)
   *
   * Why subtract?
   * - Entry adds to the value (zoom in)
   * - Exit subtracts from the value (zoom out)
   * - Creates smooth round-trip animation
   */
  const zoomTransition = entryProgress - exitProgress;

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSFORM VALUES FOR STARS SCENE
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Transform values create the zoom-out effect on StarsGiven scene
   *
   * All values interpolate from 0 (no effect) to maximum (full effect)
   * Controlled by zoomTransition (0 → 1 → 0)
   */

  /**
   * translateX: Horizontal movement
   *
   * Formula: zoomTransition * 270
   * - Start (0): 0 * 270 = 0px (centered)
   * - Peak (1): 1 * 270 = 270px (moved right)
   * - End (0): 0 * 270 = 0px (centered again)
   *
   * Effect: Stars scene moves to the right during transition
   */
  const translateX = zoomTransition * 270;

  /**
   * translateY: Vertical movement
   *
   * Formula: zoomTransition * -270
   * - Start (0): 0 * -270 = 0px (centered)
   * - Peak (1): 1 * -270 = -270px (moved up)
   * - End (0): 0 * -270 = 0px (centered again)
   *
   * Effect: Stars scene moves up during transition
   * Negative value = upward movement
   */
  const translateY = zoomTransition * -270;

  /**
   * scale: Size change
   *
   * Formula: 1 + (zoomTransition * 0.5)
   * - Start (0): 1 + 0 = 1.0 (normal size)
   * - Peak (1): 1 + 0.5 = 1.5 (150% size)
   * - End (0): 1 + 0 = 1.0 (normal size)
   *
   * Effect: Stars scene grows larger during transition
   */
  const scale = 1 + zoomTransition * 0.5;

  /**
   * opacity: Transparency
   *
   * Formula: 1 - (zoomTransition * 0.7)
   * - Start (0): 1 - 0 = 1.0 (fully visible)
   * - Peak (1): 1 - 0.7 = 0.3 (30% visible)
   * - End (0): 1 - 0 = 1.0 (fully visible)
   *
   * Effect: Stars scene fades out during transition
   * Doesn't fade completely (0.3 minimum) for smoother effect
   */
  const opacity = 1 - zoomTransition * 0.7;

  /**
   * Combine all transforms into style object
   *
   * useMemo: Only recalculate when values change
   * Dependencies: [translateX, translateY, scale, opacity]
   */
  const starStyle: React.CSSProperties = useMemo(() => {
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity,
    };
  }, [translateX, translateY, scale, opacity]);

  // ══════════════════════════════════════════════════════════════════════════
  // SCENE VISIBILITY LOGIC
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Determine when StarsGiven scene should be visible
   *
   * Visible when:
   * 1. Before tablet has fully entered (frame < timeUntilTabletIsEntered)
   * 2. After tablet starts exiting (frame > timeUntilTabletHides)
   *
   * Why this logic?
   * - Prevents both scenes from being visible at once
   * - Creates clean transition without overlap
   * - StarsGiven "bookends" the tablet scene
   *
   * Timeline:
   * Frame 0-196:   StarsGiven visible (with zoom-out)
   * Frame 196-300: Only tablet visible
   * Frame 300-345: StarsGiven visible again (with zoom-in)
   */
  const timeUntilTabletIsEntered = starFlyDuration + 46; // 150 + 46 = 196

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <AbsoluteFill>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AUDIO: BACKGROUND MUSIC                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Background music
       *
       * Plays throughout the entire composition
       * Loops continuously for seamless playback
       *
       * Props:
       * - src: Music file path
       * - startFrom: Frame 0 (starts immediately)
       * - volume: 0.3 (30% - low to not overpower SFX)
       * - loop: true (repeats indefinitely)
       *
       * Why low volume?
       * - Background music should be atmospheric
       * - Sound effects need to be clearly audible
       * - 30% provides ambiance without distraction
       */}
      <Audio
        src={AUDIO_FILES.BACKGROUND_MUSIC}
        startFrom={AUDIO_TIMING.BACKGROUND_MUSIC}
        volume={AUDIO_VOLUMES.BACKGROUND_MUSIC}
        loop
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 1: STARS GIVEN (WITH ZOOM-OUT TRANSITION)                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * StarsGiven scene with conditional rendering
       *
       * Visible when:
       * - frame < 196 (before tablet fully enters)
       * - OR frame > 300 (after tablet starts exiting)
       *
       * Style:
       * - starStyle contains zoom-out transforms
       * - Applied during transition for smooth effect
       *
       * Why conditional rendering?
       * - Improves performance (don't render hidden scenes)
       * - Cleaner than always rendering with opacity: 0
       * - Prevents z-index issues
       */}
      {frame < timeUntilTabletIsEntered || frame > timeUntilTabletHides ? (
        <StarsGivenWithAudio starsGiven={starsGiven} style={starStyle} />
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 2: TABLET (PRODUCTIVITY GRAPH)                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Tablet scene with Sequence timing
       *
       * Sequence props:
       * - from: Frame 150 (when scene starts)
       * - durationInFrames: 195 frames (150 visible + 45 exit)
       *
       * Why use Sequence?
       * - Automatically offsets child component's frame counter
       * - Child sees frame 0 when parent is at frame 150
       * - Simplifies animation logic in child components
       * - Clean separation of concerns
       *
       * Timeline from Tablet's perspective:
       * Frame 0-16:   Slide up entry
       * Frame 30-46:  Zoom transition
       * Frame 46-150: Fully visible
       * Frame 150-195: Exit animation
       */}
      <Sequence
        from={starFlyDuration} // Start at frame 150
        durationInFrames={TABLET_SCENE_LENGTH + TABLET_SCENE_HIDE_ANIMATION} // 195 frames
      >
        <TabletWithAudio
          weekday={topWeekday}
          graphData={graphData}
          hour={topHour}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example usage in Root.tsx:
 *
 * import { StarsAndProductivityWithAudio, getStarsAndProductivityDuration } from "./stars-and-productivity-with-audio";
 * import { MOCK_PRODUCTIVITY_DATA } from "./stars-and-productivity-with-audio/constants";
 *
 * <Composition
 *   id="StarsAndProductivityWithAudio"
 *   component={StarsAndProductivityWithAudio}
 *   durationInFrames={getStarsAndProductivityDuration()}
 *   fps={30}
 *   width={1080}
 *   height={1920}
 *   defaultProps={{
 *     starsGiven: 42,
 *     topWeekday: "3",  // Thursday (0-indexed)
 *     topHour: "14",    // 2 PM
 *     graphData: MOCK_PRODUCTIVITY_DATA,
 *   }}
 * />
 */

// ============================================================================
// TIMELINE VISUALIZATION
// ============================================================================

/**
 * Complete timeline (345 frames @ 30fps = 11.5 seconds):
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ STARS SCENE                                                              │
 * │ ├─ Frame 0-10:    Background fade in                                    │
 * │ ├─ Frame 10-60:   Text animate in                                       │
 * │ ├─ Frame 60-120:  Hold                                                  │
 * │ ├─ Frame 120-150: Fade out                                              │
 * │ └─ Frame 150-196: Zoom out transition                                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TABLET SCENE                                                             │
 * │ ├─ Frame 150-166: Slide up entry                                        │
 * │ ├─ Frame 150-195: Zoom in transition                                    │
 * │ ├─ Frame 180-240: Bars animate                                          │
 * │ ├─ Frame 210-310: Weekday wheel spins                                   │
 * │ ├─ Frame 220-320: Hour wheel spins                                      │
 * │ ├─ Frame 240-300: Hold                                                  │
 * │ └─ Frame 300-345: Exit animation                                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ AUDIO                                                                    │
 * │ ├─ Frame 0:   Background music (loops)                                  │
 * │ ├─ Frame 10:  Stars whoosh                                              │
 * │ ├─ Frame 150: Tablet entry                                              │
 * │ ├─ Frame 180: Bars animate                                              │
 * │ ├─ Frame 195: Weekday wheel                                             │
 * │ └─ Frame 220: Hour wheel                                                │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To adjust scene timing:
 * - Change TABLET_SCENE_LENGTH for hold duration
 * - Modify TABLET_ENTER_DURATION for transition speed
 * - Update TABLET_SCENE_HIDE_ANIMATION for exit speed
 *
 * To modify zoom effect:
 * - Adjust translateX/Y multipliers (270)
 * - Change scale multiplier (0.5)
 * - Modify opacity multiplier (0.7)
 *
 * To change audio:
 * - Update files in audio-constants.ts
 * - Adjust timing values
 * - Fine-tune volume levels
 */
