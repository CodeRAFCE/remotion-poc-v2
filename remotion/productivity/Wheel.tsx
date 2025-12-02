import gsap from "gsap";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * WHEEL COMPONENT
 *
 * Purpose: Creates a 3D rotating wheel effect that displays multiple values
 * arranged in a circle. Used to show weekday/hour selection with smooth animation.
 *
 * Key Concepts to Learn:
 * 1. 3D CSS Transforms (rotateX, translateZ, translateY)
 * 2. Perspective and backface-visibility for 3D effects
 * 3. GSAP easing with frame-based animation
 * 4. Mapping array indices to circular positions using trigonometry
 * 5. Conditional styling based on selected value
 */

type Props = {
  value: string; // Currently selected value (e.g., "Monday" or "14")
  values: string[]; // All possible values to display in the wheel
  radius: number; // Size of the wheel (distance from center to items)
  renderLabel: (value: string) => React.ReactNode; // Custom label formatter
  delay: number; // When the wheel animation starts (in frames)
  soundDelay: number; // When sound plays (not implemented in this version)
};

export const Wheel: React.FC<Props> = ({
  value,
  values,
  radius,
  renderLabel,
  delay,
}) => {
  const frame = useCurrentFrame();

  /**
   * ANIMATION LOGIC
   *
   * We're replicating Spring behavior with GSAP easing:
   * - Spring uses mass, damping, stiffness for physics simulation
   * - We use GSAP's "power2.out" for smooth deceleration
   * - Duration: 100 frames (matches original)
   */
  const DURATION_FRAMES = 100;

  // Calculate progress: 0 at delay, 1 at delay + duration
  const framesSinceStart = Math.max(0, frame - delay);
  const rawProgress = Math.min(1, framesSinceStart / DURATION_FRAMES);

  // Apply GSAP easing for smooth animation
  const ease = gsap.parseEase("power2.out");
  const progress = ease(rawProgress);

  /**
   * ROTATION CALCULATION
   *
   * The wheel spins from a high speed to stopping at the selected value.
   * - Start: rotation = 1 (full spin)
   * - End: rotation = 0 (stopped at correct position)
   * - We use modulo (%) to keep rotation within 0-π range
   */
  const rotationValue = (1 - progress) % Math.PI;

  return (
    <AbsoluteFill
      style={{
        perspective: 10000, // Creates 3D depth effect
      }}
    >
      {/* Render each value in the wheel */}
      {values.map((item, index) => {
        /**
         * CIRCULAR POSITIONING MATH
         *
         * Each item is positioned on a circle using trigonometry:
         * - Total positions: values.length (e.g., 24 for hours)
         * - Current position: index / values.length (0 to 1)
         * - Add rotation to animate
         *
         * Position formula:
         * - index = item's position in the circle (0 to 1)
         * - Math.cos(angle) gives Z position (depth)
         * - Math.sin(angle) gives Y position (vertical)
         */
        const normalizedIndex = index / values.length + rotationValue;

        // Which value is at this position (wraps around using modulo)
        const currentValueIndex = (index + Number(value)) % values.length;

        // Calculate 3D position on the wheel
        const angle = normalizedIndex * -Math.PI * 2; // Full circle = 2π
        const zPosition = Math.cos(angle) * radius; // Depth (forward/backward)
        const yPosition = Math.sin(angle) * radius; // Vertical (up/down)

        /**
         * HIGHLIGHTING LOGIC
         *
         * The selected value should be fully visible (opacity 1)
         * Other values are semi-transparent (opacity 0.3)
         * Only apply highlight after animation starts (frame > delay + 5)
         */
        const isSelected = Number(value) === currentValueIndex;
        const shouldHighlight = frame - 5 > delay;
        const textOpacity = isSelected && shouldHighlight ? 1 : 0.3;

        return (
          <AbsoluteFill
            key={index}
            style={{
              justifyContent: "center",
              fontSize: 65,
              fontFamily: "Mona Sans",
              fontWeight: "bold",
              color: `rgba(255, 255, 255, ${textOpacity})`,
              /**
               * 3D TRANSFORM BREAKDOWN
               *
               * Order matters! Transforms apply right-to-left:
               * 1. rotateX: Tilts the text to face the viewer
               * 2. scale: Keeps text readable at all angles
               * 3. translate: Moves to position on the wheel
               */
              transform: `translateZ(${zPosition}px) translateY(${yPosition}px) rotateX(${angle}rad)`,
              backfaceVisibility: "hidden", // Hide when rotated away from viewer
              perspective: 1000,
            }}
          >
            {/* Counter-rotate text so it's always readable */}
            <div
              style={{
                transform: `rotateX(-${angle}rad)`,
                backfaceVisibility: "hidden",
                textAlign: "right",
                lineHeight: 1,
                width: 410,
                paddingRight: 50,
              }}
            >
              {renderLabel(values[currentValueIndex])}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
