import gsap from "gsap";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import type { ProductivityDataPoint } from "../productivity/constants";
import { Tablet } from "../productivity/Tablet";
import { StarsGiven, getStarFlyDuration } from "../stars-given";

/**
 * STARSANDPRODUCTIVITY - MAIN ORCHESTRATOR
 *
 * Purpose: Combines two scenes with smooth transitions:
 * 1. StarsGiven scene (stars count with gradient)
 * 2. Tablet scene (productivity graph with 3D effects)
 *
 * Key Concepts to Learn:
 * 1. Sequence composition (timing multiple scenes)
 * 2. Zoom transition effects between scenes
 * 3. Opacity fading for smooth transitions
 * 4. Dynamic duration calculation
 * 5. Props passing and data flow
 * 6. useMemo for performance optimization
 */

// Animation timing constants
const TABLET_SCENE_LENGTH = 150; // How long tablet is visible
const TABLET_SCENE_HIDE_ANIMATION = 45; // Exit animation duration
const TABLET_ENTER_DURATION = 45; // Entry animation duration

/**
 * PROPS DEFINITION
 *
 * All data comes from JSON (no API calls):
 * - starsGiven: Total stars given by user
 * - topWeekday: Most productive day (e.g., "Monday")
 * - topHour: Most productive hour (e.g., "14")
 * - graphData: Hourly productivity data for the bar chart
 */
type Props = {
  starsGiven: number;
  topWeekday: string;
  topHour: string;
  graphData: ProductivityDataPoint[];
};

/**
 * DURATION CALCULATION
 *
 * Total video length = StarsGiven duration + Tablet duration
 * This is calculated dynamically based on content
 */
const getTimeUntilTabletHides = () => {
  return getStarFlyDuration() + TABLET_SCENE_LENGTH;
};

export const getStarsAndProductivityDuration = () => {
  return getTimeUntilTabletHides() + TABLET_SCENE_HIDE_ANIMATION;
};

export const StarsAndProductivity: React.FC<Props> = ({
  starsGiven,
  topWeekday,
  topHour,
  graphData,
}) => {
  const frame = useCurrentFrame();

  /**
   * MEMOIZED CALCULATIONS
   *
   * useMemo prevents recalculation on every frame (performance optimization)
   * Only recalculates when dependencies change
   */
  const starFlyDuration = useMemo(() => {
    return getStarFlyDuration();
  }, []);

  const timeUntilTabletHides = useMemo(() => {
    return getTimeUntilTabletHides();
  }, []);

  /**
   * ZOOM TRANSITION ANIMATION
   *
   * Creates a smooth transition between scenes:
   * - StarsGiven zooms out and fades
   * - Tablet zooms in simultaneously
   *
   * Animation breakdown:
   * 1. Entry: Frame starFlyDuration → starFlyDuration + TABLET_ENTER_DURATION
   * 2. Hold: Middle section
   * 3. Exit: Frame starFlyDuration + TABLET_SCENE_LENGTH → end
   */
  const ease = gsap.parseEase("power2.out");
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  // Entry progress (0 → 1)
  const entryRaw = (frame - starFlyDuration) / TABLET_ENTER_DURATION;
  const entryProgress = ease(clamp01(entryRaw));

  // Exit progress (0 → 1)
  const exitRaw =
    (frame - (starFlyDuration + TABLET_SCENE_LENGTH)) /
    TABLET_SCENE_HIDE_ANIMATION;
  const exitProgress = ease(clamp01(exitRaw));

  // Combined transition: entry brings in, exit takes out
  const zoomTransition = entryProgress - exitProgress;

  /**
   * TRANSFORM VALUES
   *
   * These create the zoom/pan effect during transition:
   * - translateX: Moves right (0 → 270px)
   * - translateY: Moves up (0 → -270px)
   * - scale: Grows larger (1 → 1.5)
   * - opacity: Fades out (1 → 0.3)
   */
  const translateX = zoomTransition * 270;
  const translateY = zoomTransition * -270;
  const scale = 1 + zoomTransition * 0.5;
  const opacity = 1 - zoomTransition * 0.7;

  const starStyle: React.CSSProperties = useMemo(() => {
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity,
    };
  }, [translateX, translateY, scale, opacity]);

  /**
   * SCENE VISIBILITY LOGIC
   *
   * StarsGiven is visible when:
   * - Before tablet has fully entered (frame < timeUntilTabletIsEntered)
   * - After tablet starts exiting (frame > timeUntilTabletHides)
   *
   * This creates a clean transition without overlap
   */
  const timeUntilTabletIsEntered = starFlyDuration + 46; // Entry complete

  return (
    <AbsoluteFill>
      {/* Scene 1: StarsGiven (with zoom-out transition) */}
      {frame < timeUntilTabletIsEntered || frame > timeUntilTabletHides ? (
        <StarsGiven starsGiven={starsGiven} style={starStyle} />
      ) : null}

      {/* Scene 2: Tablet (productivity graph) */}
      <Sequence
        from={starFlyDuration}
        durationInFrames={TABLET_SCENE_LENGTH + TABLET_SCENE_HIDE_ANIMATION}
      >
        <Tablet weekday={topWeekday} graphData={graphData} hour={topHour} />
      </Sequence>
    </AbsoluteFill>
  );
};
