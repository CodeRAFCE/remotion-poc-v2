/**
 * ════════════════════════════════════════════════════════════════════════════
 * STARS AND PRODUCTIVITY REPLICA - MAIN SCENE COMPONENT
 * ════════════════════════════════════════════════════════════════════════════
 *
 * This is the orchestrator component that brings together the entire
 * "Stars and Productivity" animation scene. It manages three distinct phases:
 *
 * 1. STARS PHASE: Stars shoot across the screen, some hitting the spaceship
 * 2. TRANSITION PHASE: Camera zooms into the cockpit as tablet enters
 * 3. TABLET PHASE: Productivity data displayed on an animated tablet
 *
 * KEY CONCEPTS YOU'LL LEARN:
 * ✅ Scene orchestration and timing management
 * ✅ Spring-based zoom transitions
 * ✅ Conditional rendering based on frame timing
 * ✅ Component layering and composition
 * ✅ Persistent background rendering
 *
 * DOCUMENTATION:
 * See /test-scenes/documents/00-SCENE-OVERVIEW.md for detailed explanation
 */

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  MOCK_GRAPH_DATA,
  MOCK_LOGIN,
  MOCK_SAMPLE_STARRED_REPOS,
  MOCK_STARS_GIVEN,
  MOCK_TOP_HOUR,
  MOCK_TOP_WEEKDAY,
  MOCK_TOTAL_PULL_REQUESTS,
} from "./components/MockData";
import { Gradient } from "./components/NativeGradient";
import { Noise } from "./components/Noise";
import { StarsGiven, getStarFlyDuration } from "./components/StarsGiven";
import {
  TABLET_SCENE_ENTER_ANIMATION,
  TABLET_SCENE_ENTER_ANIMATION_DELAY,
  TABLET_SCENE_HIDE_ANIMATION,
  TABLET_SCENE_LENGTH,
  Tablet,
} from "./components/Tablet";

// ════════════════════════════════════════════════════════════════════════════
// TIMING CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Duration of the zoom-in transition when entering the tablet scene.
 * 45 frames = 1.5 seconds at 30fps
 *
 * This controls how long it takes for the camera to zoom into the cockpit
 * and for the tablet to fully appear on screen.
 */
const TABLET_ENTER_DURATION = 45;

// ════════════════════════════════════════════════════════════════════════════
// TIMING CALCULATION FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calculate when the tablet should hide (zoom out completes).
 *
 * @param starsGiven - Number of stars in the animation
 * @returns Frame number when tablet hide animation completes
 *
 * Timeline:
 * 0 ────────────► starFlyDuration ────────────► timeUntilTabletHides
 *    Stars flying                  Tablet visible
 */
const getTimeUntilTabletHides = ({ starsGiven }: { starsGiven: number }) => {
  return getStarFlyDuration({ starsGiven }) + TABLET_SCENE_LENGTH;
};

/**
 * Calculate total duration of the entire composition.
 *
 * @param starsGiven - Number of stars in the animation
 * @returns Total duration in frames
 *
 * Formula: Stars Duration + Tablet Duration + Buffer
 * The 60-frame buffer gives time for the final zoom-out to complete
 */
export const getStarsAndProductivityDuration = ({
  starsGiven,
}: {
  starsGiven: number;
}) => {
  // Adding 60 frames buffer for smooth ending
  return getTimeUntilTabletHides({ starsGiven }) + 60;
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const StarsAndProductivityReplica: React.FC = () => {
  // ──────────────────────────────────────────────────────────────────────────
  // HOOKS & FRAME TRACKING
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Current frame number (increments each frame)
   * At 30fps: frame 0 = 0s, frame 30 = 1s, frame 60 = 2s, etc.
   */
  const frame = useCurrentFrame();

  /**
   * Video configuration (fps, width, height, duration)
   */
  const { fps } = useVideoConfig();

  // ──────────────────────────────────────────────────────────────────────────
  // SCENE DATA (from MockData)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Number of stars given (GitHub stars)
   * This determines:
   * - How many stars fly across the screen
   * - Duration of the stars phase
   * - When the tablet scene begins
   */
  const starsGiven = MOCK_STARS_GIVEN;

  /**
   * Whether to show the spaceship cockpit
   * Set to true to display the cockpit HUD and controls
   */
  const showCockpit = true;

  /**
   * Most productive weekday (0 = Monday, 6 = Sunday)
   * Displayed on the rotating wheel in the tablet scene
   */
  const topWeekday = MOCK_TOP_WEEKDAY;

  /**
   * Most productive hour (0-23, 24-hour format)
   * Displayed on the hour wheel in the tablet scene
   */
  const topHour = MOCK_TOP_HOUR;

  /**
   * Productivity data for the bar graph
   * Array of 24 objects (one per hour)
   */
  const graphData = MOCK_GRAPH_DATA;

  /**
   * Total pull requests count (displayed on cockpit HUD)
   */
  const totalPullRequests = MOCK_TOTAL_PULL_REQUESTS;

  /**
   * GitHub username
   */
  const login = MOCK_LOGIN;

  /**
   * Array of sample starred repositories
   * Displayed briefly when stars hit the spaceship
   */
  const sampleStarredRepos = MOCK_SAMPLE_STARRED_REPOS;

  // ──────────────────────────────────────────────────────────────────────────
  // TIMING CALCULATIONS (Memoized for performance)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Calculate duration of the stars flying phase.
   *
   * This determines:
   * - When stars stop shooting
   * - When the tablet transition begins
   * - Total length of phase 1
   *
   * Formula is based on:
   * - Number of stars to display
   * - Time between each star
   * - Duration of star burst animation
   */
  const starFlyDuration = useMemo(() => {
    return getStarFlyDuration({ starsGiven });
  }, [starsGiven]);

  /**
   * Calculate when the tablet should hide and zoom back out.
   *
   * Timeline:
   * Frame 0 ──► starFlyDuration ──► timeUntilTabletHides
   *             (Stars end)          (Tablet zoom out)
   */
  const timeUntilTabletHides = useMemo(() => {
    return getTimeUntilTabletHides({ starsGiven });
  }, [starsGiven]);

  // ──────────────────────────────────────────────────────────────────────────
  // ZOOM TRANSITION ANIMATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * The main zoom transition value (0 to 1).
   *
   * HOW IT WORKS:
   * 1. Starts at 0 (normal view)
   * 2. Springs to 1 when stars end (zoom IN to cockpit)
   * 3. Springs back to 0 after tablet duration (zoom OUT)
   *
   * This is calculated by SUBTRACTING two spring animations:
   * - First spring: animates 0 → 1 (zoom in)
   * - Second spring: animates 0 → 1 (zoom out)
   * - Result: 0 → 1 → 0 (smooth transition in and out)
   *
   * Spring config:
   * - damping: 200 (controls "bounciness" - higher = less bounce)
   * - durationInFrames: 45 (how long the transition takes)
   */
  const zoomTransition =
    spring({
      fps,
      frame,
      delay: starFlyDuration, // Start after stars finish
      config: {
        damping: 200, // Smooth, minimal bounce
      },
      durationInFrames: TABLET_ENTER_DURATION, // 45 frames = 1.5s
    }) -
    spring({
      fps,
      frame,
      delay: starFlyDuration + TABLET_SCENE_LENGTH, // Start zoom out
      config: {
        damping: 200,
      },
      durationInFrames: TABLET_SCENE_HIDE_ANIMATION, // 45 frames
    });

  // ──────────────────────────────────────────────────────────────────────────
  // CAMERA TRANSFORM CALCULATIONS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Horizontal camera movement (pixels)
   * 0 at start → 270px to the right when fully zoomed
   *
   * This creates the effect of the camera moving toward the cockpit
   */
  const translateX = zoomTransition * 270;

  /**
   * Vertical camera movement (pixels)
   * 0 at start → -270px upward when fully zoomed
   *
   * Negative value moves camera UP toward the cockpit
   */
  const translateY = zoomTransition * -270;

  /**
   * Camera zoom scale
   * 1.0 at start → 1.5 when fully zoomed (150% size)
   *
   * Formula: base scale (1) + (transition progress * 0.5)
   * Result: Makes cockpit appear larger as we zoom in
   */
  const scale = 1 + zoomTransition * 0.5;

  /**
   * Combined CSS transform style for the StarsGiven component.
   *
   * Applies three simultaneous transformations:
   * 1. translateX: Move right (simulates camera pan)
   * 2. translateY: Move up (simulates camera tilt)
   * 3. scale: Zoom in (simulates camera zoom)
   *
   * Opacity also fades out as we zoom (1.0 → 0.3)
   * This creates smooth transition to the tablet view
   *
   * Memoized to prevent unnecessary recalculations
   */
  const style: React.CSSProperties = useMemo(() => {
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity: 1 - zoomTransition * 0.7, // Fade from 100% to 30%
    };
  }, [translateX, translateY, scale, zoomTransition]);

  // ──────────────────────────────────────────────────────────────────────────
  // SCENE TRANSITION TIMING
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Calculate when the tablet has fully entered the screen.
   *
   * Timeline:
   * starFlyDuration ──► delay ──► animation ──► timeUntilTabletIsEntered
   *                     (30f)      (16f)         (fully visible)
   *
   * This marks the frame when:
   * - The tablet is fully visible
   * - The zoom-in animation completes
   * - We can hide the StarsGiven component
   */
  const timeUntilTabletIsEntered =
    starFlyDuration +
    TABLET_SCENE_ENTER_ANIMATION_DELAY + // 30 frames delay
    TABLET_SCENE_ENTER_ANIMATION; // 16 frames animation

  // ──────────────────────────────────────────────────────────────────────────
  // BACKGROUND FADE-IN ANIMATION
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Gradual fade-in for the background gradient.
   *
   * Frame 0-10: opacity goes from 0 to 1
   * Frame 10+: opacity stays at 1
   *
   * Purpose: Smooth entrance instead of harsh appearance
   * extrapolateLeft/Right: "clamp" prevents values outside 0-1 range
   */
  const gradientOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: SCENE COMPOSITION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * SCENE STRUCTURE (Layers from back to front):
   *
   * 1. Background Layer (always visible)
   *    - Blue radial gradient
   *    - Animated noise overlay
   *
   * 2. Stars & Cockpit Layer (conditional)
   *    - Visible: During stars phase AND after tablet hides
   *    - Hidden: While tablet is on screen
   *    - Includes: Flying stars, spaceship cockpit, repo names
   *
   * 3. Tablet Layer (sequenced)
   *    - Starts: When stars end
   *    - Duration: TABLET_SCENE_LENGTH + hide animation
   *    - Includes: Tablet device, productivity graphs, wheels
   *
   * VISIBILITY LOGIC:
   * ┌─────────────────────────────────────────────────────────────────┐
   * │ Frame Range              │ Stars/Cockpit │ Tablet │ Background │
   * ├──────────────────────────┼───────────────┼────────┼────────────┤
   * │ 0 → timeUntilTabletEnter │ ✓ Visible     │ ✗ None │ ✓ Visible  │
   * │ TabletEnter → TabletHide │ ✗ Hidden      │ ✓ Show │ ✓ Visible  │
   * │ TabletHide → End         │ ✓ Visible     │ ✗ None │ ✓ Visible  │
   * └──────────────────────────┴───────────────┴────────┴────────────┘
   */

  return (
    <AbsoluteFill style={{}}>
      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 1: BACKGROUND (Always Rendered)
          ════════════════════════════════════════════════════════════════ */}

      {/**
       * Background gradient and noise - persists throughout entire scene.
       *
       * Why separate from StarsGiven?
       * - Background must remain visible during tablet scene
       * - StarsGiven component is hidden when tablet appears
       * - This ensures no "transparent" gaps during transitions
       *
       * Components:
       * - Gradient: Radial blue gradient (blueRadial)
       * - Noise: Animated grain/texture overlay for depth
       */}
      <AbsoluteFill style={{ opacity: gradientOpacity }}>
        <Gradient gradient="blueRadial" />
        <Noise translateX={0} translateY={0} />
      </AbsoluteFill>

      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 2: STARS & COCKPIT (Conditionally Rendered)
          ════════════════════════════════════════════════════════════════ */}

      {/**
       * Conditional rendering of the stars and cockpit scene.
       *
       * VISIBLE WHEN:
       * - Current frame < timeUntilTabletIsEntered (stars phase)
       * - OR current frame > timeUntilTabletHides (after tablet)
       *
       * HIDDEN WHEN:
       * - Tablet is on screen (fully zoomed into cockpit)
       *
       * Props passed to StarsGiven:
       * - starsGiven: Number of stars to animate
       * - showCockpit: Display spaceship HUD
       * - style: Zoom/fade transform (from zoomTransition)
       * - totalPullRequests: Displayed on cockpit HUD
       * - sampleStarredRepos: Repo names shown on star hits
       * - timeUntilTabletHides: When to start zoom-out
       * - timeUntilTabletHasEntered: When tablet is fully visible
       */}
      {frame < timeUntilTabletIsEntered || frame > timeUntilTabletHides ? (
        <StarsGiven
          starsGiven={starsGiven}
          showCockpit={showCockpit}
          style={style}
          totalPullRequests={totalPullRequests}
          sampleStarredRepos={sampleStarredRepos}
          timeUntilTabletHides={timeUntilTabletHides}
          timeUntilTabletHasEntered={timeUntilTabletIsEntered}
        />
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════════
          LAYER 3: TABLET SCENE (Sequence - Time-based)
          ════════════════════════════════════════════════════════════════ */}

      {/**
       * Tablet scene with productivity data visualization.
       *
       * TIMING:
       * - Starts (from): starFlyDuration (when stars finish)
       * - Duration: TABLET_SCENE_LENGTH + TABLET_SCENE_HIDE_ANIMATION
       * - Total: 150 + 45 = 195 frames (6.5 seconds at 30fps)
       *
       * ANIMATION SEQUENCE:
       * 1. Tablet slides up from bottom (ENTER_ANIMATION_DELAY)
       * 2. Fully enters view (ENTER_ANIMATION)
       * 3. Displays for TABLET_SCENE_LENGTH frames
       * 4. Slides back down (HIDE_ANIMATION)
       *
       * Props passed to Tablet:
       * - weekday: Most productive day (for wheel display)
       * - enterProgress: 0→1→0 transition value (from zoomTransition)
       * - graphData: 24-hour productivity data for bar chart
       * - hour: Most productive hour (for wheel display)
       */}
      <Sequence
        from={starFlyDuration}
        durationInFrames={TABLET_SCENE_LENGTH + TABLET_SCENE_HIDE_ANIMATION}
      >
        <Tablet
          weekday={topWeekday}
          enterProgress={zoomTransition}
          graphData={graphData}
          hour={topHour}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
