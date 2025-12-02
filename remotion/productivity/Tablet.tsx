import gsap from "gsap";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { ProductivityDataPoint } from "./constants";
import { Productivity } from "./Productivity";
import { TabletSVG } from "./TabletSVG";

// Animation constants - match GitHub Unwrapped timing
const TABLET_SCENE_LENGTH = 150; // Total duration tablet is visible
const TABLET_SCENE_HIDE_ANIMATION = 45; // Exit animation duration
const TABLET_SCENE_ENTER_ANIMATION = 16; // Entry animation duration
const TABLET_SCENE_ENTER_ANIMATION_DELAY = 30; // Delay before entry starts

// Props passed from parent orchestrator
type Props = {
  graphData: ProductivityDataPoint[];
  weekday: string; // Most productive weekday
  hour: string; // Most productive hour
};

export const Tablet: React.FC<Props> = ({ graphData, weekday, hour }) => {
  const frame = useCurrentFrame();

  // Helper: clamp value between 0 and 1
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  // Use GSAP easing function for smooth animation
  const ease = gsap.parseEase("power2.out");

  // Entry animation: tablet slides up from bottom
  // Starts at DELAY frame, lasts ENTER_ANIMATION frames
  const entryRaw =
    (frame - TABLET_SCENE_ENTER_ANIMATION_DELAY) / TABLET_SCENE_ENTER_ANIMATION;
  const entryProgress = ease(clamp01(entryRaw)); // 0 → 1 with easing

  // Exit animation: tablet animates out
  // Starts at SCENE_LENGTH frame, lasts HIDE_ANIMATION frames
  const exitRaw = (frame - TABLET_SCENE_LENGTH) / TABLET_SCENE_HIDE_ANIMATION;
  const exitProgress = ease(clamp01(exitRaw)); // 0 → 1 with easing

  // Combine entry and exit: entry brings it in, exit takes it out
  // Scale by 0.68 to match GitHub Unwrapped intensity
  const toFullscreenFull = entryProgress - exitProgress;
  const toFullscreen = 0.68 * toFullscreenFull;

  // 3D Transform constants - define the perspective effect
  const SCREEN_ROTATION_Y = 15; // Horizontal tilt angle
  const SCREEN_ROTATION_X = -10; // Vertical tilt angle
  const SKEW_X = 7; // Horizontal skew
  const SKEW_Y = -4; // Vertical skew

  // Transform values for the CHART (productivity graph inside screen)
  // Interpolate from initial tilted state → flat (0)
  const rotateYChart = (1 - toFullscreen) * SCREEN_ROTATION_Y; // 15° → 0°
  const rotateXChart = (1 - toFullscreen) * SCREEN_ROTATION_X; // -10° → 0°
  const skewXChart = (1 - toFullscreen) * SKEW_X; // 7 → 0
  const skewYChart = (1 - toFullscreen) * SKEW_Y; // -4 → 0

  // Transform values for the PARENT (tablet frame/hands)
  // Counter-rotate to create depth effect
  const rotateYParent = -(1 - toFullscreen) * SCREEN_ROTATION_Y; // 0° → -15°
  const rotateXParent = -(1 - toFullscreen) * SCREEN_ROTATION_X; // 0° → 10°
  const skewXParent = -(1 - toFullscreen) * SKEW_X; // 0 → -7
  const skewYParent = -(1 - toFullscreen) * SKEW_Y; // 0 → 4

  // Scale animations
  const scaleChart = (1 - toFullscreen) * (0.5 * 0.8) + toFullscreen * 1; // 0.4 → 1
  const scaleParent =
    (1 - toFullscreen) * 1 + toFullscreen * ((1 / (1 - 0.8 * 0.5)) * 1.3);
  const masterScale = (1 - toFullscreen) * 0.8 + toFullscreen * 1; // 0.8 → 1

  // Translation: move tablet during zoom transition
  const translateX = toFullscreen * -500; // 0 → -500px (left)
  const translateY = toFullscreen * 250; // 0 → 250px (down)

  // Screen position: align productivity graph inside tablet screen
  const left = (1 - toFullscreen) * 350; // 350px → 0px
  const top = (1 - toFullscreen) * 480; // 480px → 0px

  return (
    <AbsoluteFill
      style={{
        // Slide tablet up from bottom (entry animation)
        transform: `translateY(${800 - entryProgress * 800}px)`,
      }}
    >
      {/* Layer 1: Tablet frame (hands holding device) */}
      <AbsoluteFill>
        <AbsoluteFill
          style={{
            display: "flex",
            position: "absolute",
            transformOrigin: "left bottom",
            // Apply all parent transforms: scale, rotate, skew, translate
            transform: `scale(${masterScale}) rotateY(${rotateYParent}deg) rotateX(${rotateXParent}deg) skewX(${skewXParent}deg) skewY(${skewYParent}deg) scale(${scaleParent}) translateX(${translateX}px) translateY(${translateY}px)`,
          }}
        >
          {/* Render the tablet/hands image */}
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

      {/* Layer 2: Productivity graph (rendered inside screen area) */}
      <AbsoluteFill>
        <div
          style={{
            left, // Position horizontally
            top, // Position vertically
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            // Apply chart transforms with perspective for 3D effect
            transform: `perspective(1200px) rotateY(${rotateYChart}deg) rotateX(${rotateXChart}deg) skewX(${skewXChart}deg) skewY(${skewYChart}deg) scale(${scaleChart})`,
          }}
        >
          <AbsoluteFill style={{ width: 1080, height: 1080 }}>
            {/* Render the actual productivity bars */}
            <Productivity hour={hour} weekday={weekday} graphData={graphData} />
          </AbsoluteFill>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
