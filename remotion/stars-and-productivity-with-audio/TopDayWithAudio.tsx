import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { AUDIO_FILES, AUDIO_TIMING, AUDIO_VOLUMES } from "./audio-constants";
import { WheelWithAudio } from "./WheelWithAudio";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOPDAY COMPONENT WITH AUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Displays a pane with a label and a 3D rotating wheel showing the most
 * productive day/hour. This is a wrapper component that combines the wheel
 * with styling, masking effects, and audio.
 *
 * WHAT IT DOES:
 * 1. Creates a rounded pane with glass-morphism styling
 * 2. Displays a label on the left (e.g., "Most productive day")
 * 3. Shows a rotating wheel on the right
 * 4. Applies gradient mask for fade effect
 * 5. Plays sound when wheel starts spinning
 *
 * KEY CONCEPTS TO LEARN:
 * ✅ Component composition (wrapping child components)
 * ✅ CSS masking with linear gradients
 * ✅ Absolute positioning and layering
 * ✅ Props forwarding to child components
 * ✅ Glass-morphism styling patterns
 * ✅ Audio integration with timing
 *
 * VISUAL DESIGN:
 * - Semi-transparent background (glass effect)
 * - Rounded corners (modern aesthetic)
 * - Gradient mask (fade in/out effect)
 * - White-to-transparent overlay (depth)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

/**
 * PANE_BACKGROUND
 *
 * Semi-transparent light purple background
 * Creates "glass-morphism" or "frosted glass" effect
 *
 * Color: rgba(230, 225, 252, 0.8)
 * - R: 230 (light)
 * - G: 225 (light)
 * - B: 252 (purple tint)
 * - A: 0.8 (80% opacity = semi-transparent)
 *
 * Why this color?
 * - Matches GitHub Unwrapped theme
 * - Light enough to not overpower content
 * - Purple tint ties to overall color scheme
 * - Transparency creates depth
 */
export const PANE_BACKGROUND = "rgba(230, 225, 252, 0.8)";

/**
 * PANE_TEXT_COLOR
 *
 * Dark blue text color for maximum contrast
 *
 * Color: #01064A (very dark blue)
 * - Almost black, but with blue tint
 * - High contrast against light background
 * - Professional and readable
 *
 * Why not pure black?
 * - Pure black (#000) can be harsh
 * - Dark blue is softer, more elegant
 * - Ties to overall color scheme
 */
export const PANE_TEXT_COLOR = "#01064A";

/**
 * PANE_BORDER
 *
 * Subtle white border for definition
 *
 * Border: 2px solid rgba(255, 255, 255, 0.1)
 * - Width: 2px (thin but visible)
 * - Color: White at 10% opacity (very subtle)
 *
 * Why such a subtle border?
 * - Creates separation without being obvious
 * - Adds polish and refinement
 * - Enhances glass-morphism effect
 */
export const PANE_BORDER = "2px solid rgba(255, 255, 255, 0.1)";

// ============================================================================
// LABEL STYLING
// ============================================================================

/**
 * Label text styling
 *
 * Typography:
 * - Color: Dark blue (PANE_TEXT_COLOR)
 * - Weight: Bold (emphasis)
 * - Size: 45px (large but not overwhelming)
 * - Font: Mona Sans (GitHub's font)
 *
 * Why these choices?
 * - Bold: Creates hierarchy, draws attention
 * - 45px: Large enough to read, small enough to fit
 * - Mona Sans: Consistent with GitHub branding
 */
const labelStyle: React.CSSProperties = {
  color: PANE_TEXT_COLOR,
  fontWeight: "bold",
  fontSize: 45,
  fontFamily: "Mona Sans",
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Props = {
  /**
   * Selected value (e.g., "Monday" or "14")
   * This is what the wheel will stop on
   */
  value: string;

  /**
   * Display label (e.g., "Most productive day")
   * Shown on the left side of the pane
   */
  label: string;

  /**
   * All possible values for the wheel
   * Example: ["Monday", "Tuesday", ...] or ["0", "1", ...]
   */
  values: string[];

  /**
   * Wheel size (distance from center to items)
   * Larger radius = bigger wheel
   */
  radius: number;

  /**
   * Custom label formatter function
   * Transforms values before display
   */
  renderLabel: (value: string) => React.ReactNode;

  /**
   * Animation delay in frames
   * When the wheel starts spinning
   */
  delay: number;

  /**
   * Sound delay in frames
   * When the audio should play
   */
  soundDelay: number;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const TopDayWithAudio: React.FC<Props> = ({
  value,
  label,
  values,
  radius,
  renderLabel,
  delay,
  soundDelay,
}) => {
  // ══════════════════════════════════════════════════════════════════════════
  // GRADIENT MASK CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Gradient mask for fade effect
   *
   * What: Creates a fade in/out effect on top and bottom of wheel
   * How: CSS mask-image with linear gradient
   *
   * Gradient stops:
   * - 0%: transparent (fully hidden)
   * - 30%: rgba(0,0,0,1) (fully visible)
   * - 70%: rgba(0,0,0,1) (fully visible)
   * - 100%: transparent (fully hidden)
   *
   * Visual effect:
   *    ┌─────────────┐
   *    │   (fade)    │ ← transparent (0%)
   *    ├─────────────┤
   *    │   visible   │ ← solid (30%)
   *    │   visible   │ ← solid (70%)
   *    ├─────────────┤
   *    │   (fade)    │ ← transparent (100%)
   *    └─────────────┘
   *
   * Why this effect?
   * - Creates illusion of values "entering" and "exiting" view
   * - Focuses attention on center (selected value)
   * - Adds polish and sophistication
   * - Hides abrupt appearance/disappearance
   *
   * Why rgba(0,0,0,1) instead of white?
   * - Mask uses alpha channel, not color
   * - Black (0,0,0) with alpha 1 = fully visible
   * - Transparent = fully hidden
   * - Color doesn't matter, only alpha
   */
  const maskImage = `linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, transparent 100%)`;

  // ══════════════════════════════════════════════════════════════════════════
  // AUDIO CONFIGURATION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Determine which audio to play
   *
   * Logic:
   * - If soundDelay is 95: Weekday wheel (first wheel)
   * - If soundDelay is 120: Hour wheel (second wheel)
   *
   * Why different sounds?
   * - Could use same sound for both
   * - Or different sounds for variety
   * - Currently using same sound (glockenspiel)
   *
   * Timing:
   * - soundDelay is relative to tablet scene start (frame 150)
   * - Actual frame = 150 + soundDelay
   * - Weekday: 150 + 95 = 245
   * - Hour: 150 + 120 = 270
   */
  const isWeekdayWheel = soundDelay === 95;
  const audioFile = isWeekdayWheel
    ? AUDIO_FILES.WEEKDAY_WHEEL
    : AUDIO_FILES.HOUR_WHEEL;
  const audioTiming = isWeekdayWheel
    ? AUDIO_TIMING.WEEKDAY_WHEEL
    : AUDIO_TIMING.HOUR_WHEEL;
  const audioVolume = isWeekdayWheel
    ? AUDIO_VOLUMES.WEEKDAY_WHEEL
    : AUDIO_VOLUMES.HOUR_WHEEL;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div
      style={{
        /**
         * Layout: Horizontal flexbox
         * - Items arranged left to right
         * - Label on left, wheel on right
         */
        display: "flex",
        flexDirection: "row",
        alignItems: "center",

        /**
         * Styling: Glass-morphism pane
         */
        backgroundColor: PANE_BACKGROUND, // Semi-transparent purple
        border: PANE_BORDER, // Subtle white border
        borderRadius: 50, // Rounded corners (50px radius)

        /**
         * Sizing and spacing
         */
        height: 200, // Fixed height
        paddingLeft: 50, // Space for label

        /**
         * Positioning and overflow
         */
        position: "relative", // For absolute children
        overflow: "hidden", // Hide content outside rounded corners

        /**
         * Why overflow: hidden?
         * - Wheel extends beyond pane boundaries
         * - Without this, wheel would show outside rounded corners
         * - Creates clean, contained appearance
         */
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AUDIO: WHEEL SPINNING SOUND                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Wheel spinning sound effect
       *
       * Plays when wheel starts spinning
       * Glockenspiel sound (bell-like, pleasant)
       *
       * Timing:
       * - Weekday: Frame 195
       * - Hour: Frame 220
       */}
      <Audio src={audioFile} startFrom={audioTiming} volume={audioVolume} />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LABEL TEXT (LEFT SIDE)                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Label text
       *
       * Examples:
       * - "Most productive day"
       * - "Most productive time"
       *
       * Styling: Bold, dark blue, 45px
       * Position: Left side with padding
       */}
      <div style={labelStyle}>{label}</div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* WHEEL CONTAINER (RIGHT SIDE)                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Wheel container
       *
       * Position: Absolute, anchored to right side
       * Size: 400px wide, full height
       *
       * Why absolute positioning?
       * - Allows wheel to extend beyond pane
       * - Precise control over placement
       * - Doesn't affect label positioning
       */}
      <div
        style={{
          position: "absolute",
          right: 0, // Anchor to right edge
          height: "100%", // Full height of pane
          width: 400, // Fixed width for wheel area
        }}
      >
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* BACKGROUND GRADIENT OVERLAY                                      */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/**
         * White-to-transparent gradient
         *
         * What: Fades from transparent (left) to white (right)
         * Why: Creates depth and separation
         *
         * Gradient: linear-gradient(to left, transparent, rgba(255,255,255,0.3))
         * - Direction: to left (right to left)
         * - Start (right): transparent
         * - End (left): white at 30% opacity
         *
         * Visual effect:
         * ┌──────────────┐
         * │ Label  ░░▒▒▓▓│ ← Gradient overlay
         * └──────────────┘
         *
         * Purpose:
         * - Softens transition between label and wheel
         * - Adds depth to the pane
         * - Creates visual interest
         */}
        <AbsoluteFill>
          <div
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(255, 255, 255, 0.3))",
            }}
          />
        </AbsoluteFill>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* WHEEL WITH GRADIENT MASK                                         */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/**
         * Wheel container with mask
         *
         * Mask: Gradient fade on top and bottom
         * - Top: Fades in (0% → 30%)
         * - Middle: Fully visible (30% → 70%)
         * - Bottom: Fades out (70% → 100%)
         *
         * Why two mask properties?
         * - maskImage: Standard CSS
         * - WebkitMaskImage: Safari support
         * - Ensures cross-browser compatibility
         */}
        <AbsoluteFill
          style={{
            maskImage, // Standard
            WebkitMaskImage: maskImage, // Safari
          }}
        >
          {/**
           * Render the wheel
           *
           * Props forwarded from parent:
           * - renderLabel: Custom formatter
           * - radius: Wheel size
           * - values: All possible values
           * - value: Selected value
           * - delay: Animation start time
           * - soundDelay: Audio start time
           */}
          <WheelWithAudio
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

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Weekday wheel
 *
 * <TopDayWithAudio
 *   values={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
 *   label="Most productive day"
 *   value="3"  // Thursday
 *   radius={130}
 *   renderLabel={(value) => value}
 *   delay={60}
 *   soundDelay={95}
 * />
 */

/**
 * Example 2: Hour wheel
 *
 * <TopDayWithAudio
 *   values={["0", "1", "2", ..., "23"]}
 *   label="Most productive time"
 *   value="14"  // 2 PM
 *   radius={300}
 *   renderLabel={(value) => {
 *     if (value === "12") return "12 pm";
 *     if (value === "0") return "12 am";
 *     if (Number(value) > 12) return `${Number(value) - 12} pm`;
 *     return `${value} am`;
 *   }}
 *   delay={70}
 *   soundDelay={120}
 * />
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To change pane colors:
 * 1. Update PANE_BACKGROUND for background color
 * 2. Update PANE_TEXT_COLOR for label color
 * 3. Update PANE_BORDER for border color
 * 4. Test contrast and readability
 *
 * To adjust mask fade:
 * 1. Change gradient stops (0%, 30%, 70%, 100%)
 * 2. Try: transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%
 * 3. Test in Remotion Studio
 *
 * To modify layout:
 * 1. Adjust height (currently 200px)
 * 2. Change paddingLeft for label spacing
 * 3. Modify wheel container width (currently 400px)
 * 4. Test with different content
 *
 * To change audio:
 * 1. Update audio files in audio-constants.ts
 * 2. Adjust timing if needed
 * 3. Fine-tune volume levels
 */

/**
 * Design principles used:
 * ✅ Glass-morphism (semi-transparent background)
 * ✅ Subtle borders (low opacity white)
 * ✅ Rounded corners (modern aesthetic)
 * ✅ Gradient masks (smooth fades)
 * ✅ Layering (background, mask, content)
 * ✅ Typography hierarchy (bold labels)
 */
