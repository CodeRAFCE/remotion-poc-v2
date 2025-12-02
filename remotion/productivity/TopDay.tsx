import React from "react";
import { AbsoluteFill } from "remotion";
import { Wheel } from "./Wheel";

/**
 * TOPDAY COMPONENT
 *
 * Purpose: Displays a pane with a label and a 3D rotating wheel showing
 * the most productive day/hour. This is a wrapper component that combines
 * the wheel with styling and masking effects.
 *
 * Key Concepts to Learn:
 * 1. Component composition (wrapping child components)
 * 2. CSS masking with linear gradients
 * 3. Absolute positioning and layering
 * 4. Props forwarding to child components
 * 5. Styling patterns for glass-morphism effects
 */

// Define the PANE colors (matching GitHub Unwrapped theme)
export const PANE_BACKGROUND = "rgba(230, 225, 252, 0.8)"; // Semi-transparent background
export const PANE_TEXT_COLOR = "#01064A"; // Dark blue text
export const PANE_BORDER = "2px solid rgba(255, 255, 255, 0.1)"; // Subtle border

// Label styling
const labelStyle: React.CSSProperties = {
  color: PANE_TEXT_COLOR,
  fontWeight: "bold",
  fontSize: 45,
  fontFamily: "Mona Sans",
};

type Props = {
  value: string; // Selected value (e.g., "Monday" or "14")
  label: string; // Display label (e.g., "Most productive day")
  values: string[]; // All possible values for the wheel
  radius: number; // Wheel size
  renderLabel: (value: string) => React.ReactNode; // Custom formatter
  delay: number; // Animation delay in frames
  soundDelay: number; // Sound delay (not used in this version)
};

export const TopDay: React.FC<Props> = ({
  value,
  label,
  values,
  radius,
  renderLabel,
  delay,
  soundDelay,
}) => {
  /**
   * GRADIENT MASK
   *
   * Creates a fade effect on top and bottom of the wheel:
   * - transparent 0%: Fully invisible at top
   * - rgba(0,0,0,1) 30%: Fade in
   * - rgba(0,0,0,1) 70%: Stay visible in middle
   * - transparent 100%: Fade out at bottom
   *
   * This creates the illusion of values "entering" and "exiting" view
   */
  const maskImage = `linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, transparent 100%)`;

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: PANE_BACKGROUND,
        height: 200,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 50,
        borderRadius: 50,
        position: "relative",
        overflow: "hidden", // Hide content outside rounded corners
        border: PANE_BORDER,
      }}
    >
      {/* Label text on the left */}
      <div style={labelStyle}>{label}</div>

      {/* Wheel container on the right */}
      <div
        style={{
          position: "absolute",
          right: 0,
          height: "100%",
          width: 400,
        }}
      >
        {/* White-to-transparent gradient background */}
        <AbsoluteFill>
          <div
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(255, 255, 255, 0.3))",
            }}
          />
        </AbsoluteFill>

        {/* Wheel with gradient mask applied */}
        <AbsoluteFill
          style={{
            maskImage, // Apply the fade effect
            WebkitMaskImage: maskImage, // Safari support
          }}
        >
          <Wheel
            renderLabel={renderLabel}
            radius={radius}
            values={values}
            value={value}
            delay={delay}
            soundDelay={soundDelay}
          />
        </AbsoluteFill>
      </div>
    </div>
  );
};
