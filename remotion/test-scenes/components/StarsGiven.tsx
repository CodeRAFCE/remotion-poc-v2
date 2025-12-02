/**
 * ═══════════════════════════════════════════════════════════════════════════
 * StarsGiven.tsx - Stars Shooting Phase Orchestrator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Manages the entire "stars shooting" phase of the animation. Coordinates:
 * 1. Stars flying across the screen (StarsFlying component)
 * 2. Cockpit shake effects when stars hit
 * 3. Repository name display in HUD
 * 4. Star count tracking
 * 5. Light shines/effects
 *
 * KEY RESPONSIBILITIES:
 * - Calculate shake intensity based on proximity to tablet transition
 * - Apply Perlin noise for organic shake movement
 * - Track which repositories to display based on hit timing
 * - Fade repository names in/out smoothly
 * - Count accumulated stars for HUD display
 * - Sequence timing: visible until tablet enters scene
 *
 * SHAKE EFFECT TIMING:
 * - Starts: timeUntilTabletHasEntered - 40 frames
 * - Ends: timeUntilTabletHasEntered - TABLET_SCENE_ENTER_ANIMATION - 15
 * - Creates anticipation for tablet entrance
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { noise2D } from "@remotion/noise";
import { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { AnimatedCockpit } from "./AnimatedCockpit";
import { Shines } from "./Shines";
import { ANIMATION_DURATION_PER_STAR, getStarBurstFirstFrame } from "./Star";
import {
  STAR_ANIMATION_DELAY,
  StarsFlying,
  TIME_INBETWEEN_STARS,
  getActualStars,
  getHitIndexes,
} from "./StarsFlying";
import { STAR_EXPLODE_DURATION } from "./StarSprite";
import { TABLET_SCENE_ENTER_ANIMATION } from "./Tablet";

// Mock isMobileDevice
const isMobileDevice = () => false;

// ═══════════════════════════════════════════════════════════════════════════
// DURATION CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * getStarFlyDuration - Calculates total duration of star animation phase
 *
 * FORMULA BREAKDOWN:
 * duration = (actualStars - 1) × TIME_INBETWEEN_STARS
 *          + ANIMATION_DURATION_PER_STAR
 *          + STAR_ANIMATION_DELAY
 *          + STAR_EXPLODE_DURATION
 *
 * COMPONENT EXPLANATION:
 * 1. (actualStars - 1) × TIME_INBETWEEN_STARS:
 *    - Time for all stars to launch
 *    - Example: 20 stars → 19 gaps × 10 frames = 190 frames
 *
 * 2. ANIMATION_DURATION_PER_STAR (20 frames):
 *    - How long each star travels
 *    - Last star needs full animation time
 *
 * 3. STAR_ANIMATION_DELAY (20 frames):
 *    - Initial delay before first star
 *
 * 4. STAR_EXPLODE_DURATION:
 *    - Time for burst effect to complete
 *    - Ensures explosion finishes before phase ends
 *
 * EXAMPLE CALCULATION (20 stars):
 * duration = (20-1) × 10 + 20 + 20 + explode
 *          = 190 + 20 + 20 + explode
 *          = ~230+ frames (~7.6+ seconds at 30fps)
 */
export const getStarFlyDuration = ({ starsGiven }: { starsGiven: number }) => {
  const actualStars = getActualStars(starsGiven);

  return (
    (actualStars - 1) * TIME_INBETWEEN_STARS +
    ANIMATION_DURATION_PER_STAR +
    STAR_ANIMATION_DELAY +
    STAR_EXPLODE_DURATION
  );
};

type Props = {
  starsGiven: number;
  style?: React.CSSProperties;
  showCockpit: boolean;
  totalPullRequests: number;
  sampleStarredRepos: Array<{ name: string; author: string }>;
  timeUntilTabletHides: number;
  timeUntilTabletHasEntered: number;
  // Extra props needed for Tablet but not used here directly, but passed down if needed
  // ...
};

export const StarsGiven: React.FC<Props> = ({
  starsGiven,
  style,
  showCockpit,
  totalPullRequests,
  sampleStarredRepos,
  timeUntilTabletHides,
  timeUntilTabletHasEntered,
}) => {
  const frame = useCurrentFrame();

  // ═════════════════════════════════════════════════════════════════════════
  // SHAKE EFFECT CALCULATION
  // ═════════════════════════════════════════════════════════════════════════
  // Creates camera shake effect that intensifies before tablet appears
  // Purpose: Build tension and anticipation for scene transition

  /**
   * shakeFactor: Controls shake intensity (1 = full shake, 0 = no shake)
   *
   * Interpolation Range:
   * - Start: timeUntilTabletHasEntered - 40 frames → shakeFactor = 1 (full shake)
   * - End: timeUntilTabletHasEntered - TABLET_SCENE_ENTER_ANIMATION - 15 → shakeFactor = 0 (no shake)
   *
   * Effect: Shake gradually reduces as tablet enters, creating smooth transition
   */
  const shakeFactor = interpolate(
    frame,
    [
      timeUntilTabletHasEntered - 40,
      timeUntilTabletHasEntered - TABLET_SCENE_ENTER_ANIMATION - 15,
    ],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  /**
   * PERLIN NOISE SHAKE:
   * Uses noise2D for organic, natural-looking camera shake
   *
   * noise2D(seed, x, y) generates smooth random values between -1 and 1
   * - Different seeds ("xshake", "yshake", "rotateshake") create independent movement
   * - frame / 10 slows down noise evolution for smoother motion
   * - Multiplied by shakeFactor for gradual fade-out
   *
   * WHY PERLIN NOISE?
   * - More natural than random() which is jumpy
   * - Creates smooth, wave-like motion
   * - Looks like handheld camera shake
   */

  // Horizontal shake: ±10 pixels at full intensity
  const xShake =
    shakeFactor === 0 ? 0 : noise2D("xshake", frame / 10, 0) * 10 * shakeFactor;

  // Vertical shake: ±10 pixels at full intensity
  const yShake =
    shakeFactor === 0 ? 0 : noise2D("yshake", frame / 10, 0) * 10 * shakeFactor;

  // Rotation shake: ±0.02 radians (±1.15°) at full intensity
  const rotationShake =
    shakeFactor === 0
      ? 0
      : noise2D("rotateshake", frame / 10, 0) * 0.02 * shakeFactor;

  // ═════════════════════════════════════════════════════════════════════════
  // STAR CALCULATION AND HIT DETECTION
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Calculate how many stars to display
   * Memoized so it only recalculates when starsGiven changes
   */
  const starsDisplayed = useMemo(() => {
    return getActualStars(starsGiven);
  }, [starsGiven]);

  /**
   * Determine which star indices will hit the cockpit
   * Memoized to maintain consistency across re-renders
   * Example: If starsDisplayed=20, might return [2, 5, 11, 15, 18]
   */
  const hitIndices = useMemo(() => {
    return getHitIndexes({
      starsDisplayed,
      seed: "starsGiven",
      starsGiven,
    });
  }, [starsDisplayed, starsGiven]);

  /**
   * Calculate exact frame numbers when each hit occurs
   *
   * CALCULATION FOR EACH HIT:
   * 1. getStarBurstFirstFrame(): Frame when star reaches cockpit
   * 2. index × TIME_INBETWEEN_STARS: Offset based on star launch time
   * 3. + STAR_ANIMATION_DELAY: Initial delay before first star
   *
   * EXAMPLE:
   * hitIndices = [2, 7, 11]
   * Star 2:  burstFrame + (2 × 10) + 20 = frame ~50
   * Star 7:  burstFrame + (7 × 10) + 20 = frame ~100
   * Star 11: burstFrame + (11 × 10) + 20 = frame ~140
   *
   * Result sorted for easy lookup: [50, 100, 140]
   */
  const hits = useMemo(() => {
    return hitIndices
      .map((index) => {
        return (
          getStarBurstFirstFrame({
            duration: ANIMATION_DURATION_PER_STAR,
            hitSpaceship: true,
          }) +
          index * TIME_INBETWEEN_STARS +
          STAR_ANIMATION_DELAY
        );
      })
      .sort((a, b) => a - b);
  }, [hitIndices]);

  // ═════════════════════════════════════════════════════════════════════════
  // REPOSITORY NAME DISPLAY LOGIC
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Determines which repository name to display in HUD based on current frame
   *
   * ALGORITHM:
   * 1. Find most recent hit that occurred (lastItemWithFrameVisible)
   * 2. If valid hit exists and within bounds:
   *    a. Calculate distance to previous and next hits
   *    b. Fade in/out based on proximity to hit moments
   *    c. Show repo name corresponding to that hit index
   * 3. If no hit or out of bounds → show nothing (null)
   *
   * FADE LOGIC:
   * - At hit moment (distance = 0) → opacity = 0 (invisible during impact flash)
   * - 2 frames away → opacity = 1 (fully visible)
   * - Gradual fade creates smooth transitions between repo names
   *
   * EXAMPLE TIMELINE:
   * Frame 48:  Previous hit approaching → opacity fading out
   * Frame 50:  Hit occurs! → opacity = 0 (impact flash)
   * Frame 52:  After hit → opacity = 1 (repo name fully visible)
   * Frame 98:  Next hit approaching → opacity fading out
   * Frame 100: Next hit! → Switch to next repo name
   */
  const text = useMemo(() => {
    // Find index of most recent hit that has occurred
    const lastItemWithFrameVisible = hits.findLastIndex((i) => {
      return i < frame;
    });

    // Check if we have a valid hit and it's within sample repos bounds
    if (
      lastItemWithFrameVisible !== -1 &&
      lastItemWithFrameVisible < sampleStarredRepos.length
    ) {
      // Calculate distance (in frames) to previous and next hits
      const distanceToPreviousHit = Math.abs(
        frame - hits[lastItemWithFrameVisible],
      );
      const distanceToNextHit = Math.abs(
        frame - hits[lastItemWithFrameVisible + 1],
      );

      // If this is the last hit, keep it visible at full opacity
      if (hits[lastItemWithFrameVisible + 1] === undefined) {
        return {
          opacity: 1,
          text: sampleStarredRepos[lastItemWithFrameVisible].name,
          text2: sampleStarredRepos[lastItemWithFrameVisible].author,
        };
      }

      // Use closest hit (previous or next) to determine fade
      const distanceToHit = Math.min(distanceToPreviousHit, distanceToNextHit);

      // Fade in/out: 0 frames = invisible, 2+ frames = fully visible
      const opacity = interpolate(distanceToHit, [0, 2], [0, 1]);

      return {
        opacity,
        text: sampleStarredRepos[lastItemWithFrameVisible].name,
        text2: sampleStarredRepos[lastItemWithFrameVisible].author,
      };
    }

    return null; // No hits yet or out of bounds
  }, [frame, hits, sampleStarredRepos]);

  const durationOfStars = getStarFlyDuration({ starsGiven });

  // ═════════════════════════════════════════════════════════════════════════
  // STAR COUNTER FOR HUD DISPLAY
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Calculate current star count to display in cockpit HUD
   *
   * TWO COUNTING METHODS:
   *
   * Method 1: When hits.length === starsGiven (each hit = 1 star)
   * - Simply count number of hits that have occurred
   * - Clean 1:1 mapping: hit occurred → increment counter
   *
   * Method 2: When displaying more stars than actual GitHub stars
   * - Interpolate count smoothly over animation duration
   * - Creates gradual increase even when not all are "hits"
   * - Example: 10 actual stars but showing 20 visual stars
   *   → Counter increments based on time, not just hits
   *
   * WHY TWO METHODS?
   * - Method 1: Accurate when every visual star represents real GitHub star
   * - Method 2: Handles case where we show extra stars for visual effect
   */
  const starCount = useMemo(() => {
    // Method 1: Direct hit counting
    if (hits.length === starsGiven) {
      const lastItemWithFrameVisible = hits.findLastIndex((i) => {
        return i < frame;
      });
      return lastItemWithFrameVisible + 1; // +1 because index is 0-based
    }

    // Method 2: Time-based interpolation
    // Gradually increase from 0 to starsGiven over the animation duration
    return Math.round(
      interpolate(
        frame,
        [0, getStarFlyDuration({ starsGiven }) - 10],
        [0, starsGiven],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      ),
    );
  }, [frame, hits, starsGiven]);

  // Fade in background gradient smoothly at start
  const gradientOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: LAYER COMPOSITION
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <AbsoluteFill style={style}>
      {/* 
        LAYER 1: Stars and Light Effects
        - Wrapped in Sequence to hide when tablet enters
        - Duration: timeUntilTabletHasEntered frames
      */}
      <Sequence durationInFrames={timeUntilTabletHasEntered}>
        {/* Light shine effects (desktop only) */}
        {isMobileDevice() ? null : (
          <Shines
            rotationShake={rotationShake}
            xShake={xShake}
            yShake={yShake}
          />
        )}

        {/* All flying star instances */}
        <StarsFlying hitIndices={hitIndices} starsGiven={starCount} />
      </Sequence>

      {/* 
        LAYER 2: Cockpit/Spaceship HUD
        - Always rendered (not in Sequence) so visible throughout
        - Conditional on showCockpit prop
        - Displays: repo names, star counter, cockpit frame
        - Receives shake values for camera effect
      */}
      {showCockpit ? (
        <AnimatedCockpit
          rotationShake={rotationShake}
          xShake={xShake}
          yShake={yShake}
          repoText={text}
          starCount={starCount}
          totalStarCount={starsGiven}
          durationOfStars={durationOfStars}
          timeUntilTabletHides={timeUntilTabletHides}
        />
      ) : null}
    </AbsoluteFill>
  );
};
