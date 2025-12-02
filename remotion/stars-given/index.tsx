import gsap from "gsap";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * STARSGIVEN COMPONENT (Simplified Version)
 *
 * Purpose: First scene in the StarsAndProductivity sequence.
 * Shows stars count with animated text and gradient background.
 *
 * Key Concepts to Learn:
 * 1. Remotion's interpolate() for value mapping
 * 2. Opacity fade-in/fade-out animations
 * 3. Scale and transform animations
 * 4. Background gradients with CSS
 * 5. Text formatting and styling
 *
 * Note: This is a SIMPLIFIED version. The full GitHub Unwrapped has:
 * - Flying stars animation
 * - Cockpit/spaceship graphics
 * - Noise effects
 * - Shake effects
 * We're keeping it simple for learning purposes.
 */

type Props = {
  starsGiven: number; // Total stars given
  style?: React.CSSProperties; // Optional style from parent
};

export const StarsGiven: React.FC<Props> = ({ starsGiven, style }) => {
  const frame = useCurrentFrame();

  /**
   * ANIMATION TIMELINE
   *
   * Frame 0-10: Fade in background
   * Frame 10-60: Animate stars count (scale + fade in)
   * Frame 60-120: Hold
   * Frame 120-150: Fade out (transition to tablet)
   */

  // Background fade-in
  const backgroundOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text animation with GSAP easing
  const textDelay = 10;
  const textDuration = 50;
  const textProgress = Math.max(
    0,
    Math.min(1, (frame - textDelay) / textDuration),
  );
  const ease = gsap.parseEase("power2.out");
  const textEased = ease(textProgress);

  // Scale: starts small (0.5), grows to full size (1)
  const textScale = 0.5 + textEased * 0.5;

  // Opacity: fades in
  const textOpacity = textEased;

  // Fade out at the end (for transition)
  const fadeOutOpacity = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={style}>
      {/* Gradient Background */}
      <AbsoluteFill
        style={{
          opacity: backgroundOpacity * fadeOutOpacity,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      />

      {/* Stars Count Display */}
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
        {/* "Stars Given" label */}
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

        {/* Star count number */}
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

        {/* Decorative star icon */}
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

/**
 * DURATION CALCULATION
 *
 * How long should the StarsGiven scene last?
 * GitHub Unwrapped calculates based on number of stars.
 * We're using a fixed duration for simplicity: 150 frames
 */
export const getStarFlyDuration = () => {
  return 150; // Simplified: always 150 frames (~5 seconds at 30fps)
};
