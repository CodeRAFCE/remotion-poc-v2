import gsap from "gsap";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame } from "remotion";
import { AUDIO_FILES, AUDIO_TIMING, AUDIO_VOLUMES } from "./audio-constants";
import type { ProductivityDataPoint } from "./constants";
import { TopDayWithAudio } from "./TopDayWithAudio";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCTIVITY COMPONENT WITH AUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Main component that displays the complete productivity visualization:
 * 1. Weekday wheel (most productive day)
 * 2. Hour wheel (most productive time)
 * 3. Bar graph (hourly productivity data)
 * 4. Sound effects for animations
 *
 * LAYOUT:
 * ┌─────────────────────────────────┐
 * │  Most productive day   [Wheel]  │ ← TopDay component
 * ├─────────────────────────────────┤
 * │  Most productive time  [Wheel]  │ ← TopDay component
 * ├─────────────────────────────────┤
 * │                                 │
 * │      [Bar Graph - 24 bars]      │ ← ProductivityGraph component
 * │                                 │
 * └─────────────────────────────────┘
 *
 * ANIMATION TIMELINE:
 * Frame 30-90:   Bars animate in (staggered)
 * Frame 60-160:  Weekday wheel spins
 * Frame 70-170:  Hour wheel spins
 *
 * AUDIO:
 * Frame 180: Bars animation sound (wham)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// BAR COMPONENT
// ============================================================================

/**
 * Bar Component
 *
 * Displays a single animated bar in the productivity graph
 *
 * Animation:
 * - Delay: 30 + (index * 2) frames (staggered)
 * - Duration: 60 frames
 * - Easing: power2.out (smooth deceleration)
 * - Effect: Grows from 0% to full height
 */
const Bar = (props: {
  productivity: number; // 0-1 (normalized value)
  index: number; // 0-23 (hour of day)
  mostProductive: boolean; // Is this the peak hour?
}) => {
  const frame = useCurrentFrame();

  /**
   * STAGGERED DELAY CALCULATION
   *
   * Formula: baseDelay + (index * staggerAmount)
   * - baseDelay: 30 frames (wait for tablet to enter)
   * - staggerAmount: 2 frames per bar
   *
   * Result: Wave effect from left to right
   * - Bar 0 (midnight): starts at frame 30
   * - Bar 1 (1am): starts at frame 32
   * - Bar 12 (noon): starts at frame 54
   * - Bar 23 (11pm): starts at frame 76
   *
   * Why stagger?
   * - More interesting than all at once
   * - Creates visual flow
   * - Easier to track individual bars
   */
  const DELAY_FRAMES = 30 + props.index * 2;
  const DURATION_FRAMES = 60;

  /**
   * PROGRESS CALCULATION
   *
   * Steps:
   * 1. Calculate frames since this bar's start time
   * 2. Divide by duration to get 0-1 progress
   * 3. Clamp to 0-1 range
   * 4. Apply easing curve
   *
   * Examples:
   * Frame 30, Bar 0: (30-30)/60 = 0.0 (start)
   * Frame 60, Bar 0: (60-30)/60 = 0.5 (halfway)
   * Frame 90, Bar 0: (90-30)/60 = 1.0 (complete)
   */
  const framesSinceStart = Math.max(0, frame - DELAY_FRAMES);
  const progress = Math.max(0, Math.min(1, framesSinceStart / DURATION_FRAMES));

  /**
   * EASING APPLICATION
   *
   * power2.out curve:
   * - Fast start: Bar shoots up quickly
   * - Slow end: Smooth landing at final height
   * - Natural feel: Like a spring settling
   */
  const easedProgress = gsap.parseEase("power2.out")(progress);

  /**
   * HEIGHT CALCULATION
   *
   * Outer container height: 0% → 100% (full available space)
   * Inner bar height: productivity% of container
   *
   * Two-layer approach:
   * 1. Outer div: Animates from 0 to 100% (creates growth effect)
   * 2. Inner div: Fixed at productivity% (actual data value)
   *
   * Why two layers?
   * - Separates animation from data
   * - Allows bars of different heights to animate together
   * - Creates clean, synchronized effect
   */
  const height = easedProgress * 100;

  return (
    <div
      style={{
        width: 30, // Fixed width for each bar
        height: `${height}%`, // Animated height (0% → 100%)
        display: "flex",
        alignItems: "flex-end", // Align inner bar to bottom
        borderRadius: 4, // Rounded corners
      }}
    >
      {/**
       * Inner bar (actual data visualization)
       *
       * Height: productivity percentage
       * Color: Pink if most productive, dark if not
       * Border: Subtle white outline
       */}
      <div
        style={{
          width: "100%",
          height: `${props.productivity * 100}%`, // Data value
          borderRadius: 4,
          backgroundColor: props.mostProductive ? "#FF6B9D" : "#181B28",
          border: "3px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
};

// ============================================================================
// PRODUCTIVITY GRAPH COMPONENT
// ============================================================================

/**
 * ProductivityGraph Component
 *
 * Displays all 24 bars (one per hour) with labels
 */
const ProductivityGraph = (props: {
  productivityPerHour: Array<ProductivityDataPoint>;
  style?: React.CSSProperties;
}) => {
  /**
   * Find maximum productivity value
   *
   * Why?
   * - Need to normalize all values to 0-1 range
   * - Ensures tallest bar reaches 100% height
   * - Other bars are proportional
   *
   * Example:
   * If max = 70:
   * - Bar with 70: 70/70 = 1.0 (100% height)
   * - Bar with 35: 35/70 = 0.5 (50% height)
   * - Bar with 0: 0/70 = 0.0 (0% height)
   */
  const maxProductivity = Math.max(
    ...props.productivityPerHour.map((p) => p.productivity),
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end", // Align bars to bottom
        justifyContent: "center", // Center horizontally
        gap: 10, // Space between bars
        height: 480, // Fixed height for graph area
        ...props.style,
      }}
    >
      {props.productivityPerHour.map((point) => (
        <div
          key={point.time}
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexDirection: "column",
            gap: 12, // Space between bar and label
          }}
        >
          {/* Animated bar */}
          <Bar
            index={point.time}
            productivity={point.productivity / maxProductivity} // Normalize
            mostProductive={
              point.productivity === maxProductivity && maxProductivity > 0
            }
          />

          {/* Hour label (0-23) */}
          <div
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "Mona Sans",
            }}
          >
            {point.time}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN PRODUCTIVITY COMPONENT
// ============================================================================

interface ProductivityProps {
  graphData: ProductivityDataPoint[]; // 24 hours of data
  weekday: string; // Selected weekday (0-6)
  hour: string; // Selected hour (0-23)
}

/**
 * Main Productivity Component
 *
 * Combines all elements:
 * - Two TopDay wheels (weekday and hour)
 * - Productivity bar graph
 * - Audio effects
 */
export const ProductivityWithAudio: React.FC<ProductivityProps> = ({
  graphData,
  weekday,
  hour,
}) => {
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AUDIO: BARS ANIMATION SOUND                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Bars animation sound effect
       *
       * Plays when bars start animating (frame 180)
       * Wham sound (impact/emphasis)
       *
       * Timing:
       * - Tablet scene starts at frame 150
       * - First bar starts at frame 30 (relative)
       * - 150 + 30 = 180 (absolute frame)
       */}
      <Audio
        src={AUDIO_FILES.BARS_ANIMATE}
        startFrom={AUDIO_TIMING.BARS_ANIMATE}
        volume={AUDIO_VOLUMES.BARS_ANIMATE}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* WEEKDAY WHEEL                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Most productive day wheel
       *
       * Values: 7 days (Monday-Sunday)
       * Radius: 130px (smaller wheel)
       * Delay: 60 frames (relative to tablet scene)
       * Sound: Frame 195 (150 + 45)
       */}
      <TopDayWithAudio
        values={[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ]}
        label="Most productive day"
        value={weekday}
        radius={130}
        renderLabel={(value) => value} // No formatting needed
        delay={60}
        soundDelay={95}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HOUR WHEEL                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Most productive hour wheel
       *
       * Values: 24 hours (0-23)
       * Radius: 300px (larger wheel)
       * Delay: 70 frames (10 frames after weekday)
       * Sound: Frame 220 (150 + 70)
       *
       * Label formatting:
       * - 0 → "12 am"
       * - 12 → "12 pm"
       * - 14 → "2 pm"
       * - 23 → "11 pm"
       */}
      <TopDayWithAudio
        values={[
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
          "19",
          "20",
          "21",
          "22",
          "23",
        ]}
        label="Most productive time"
        value={hour}
        radius={300}
        delay={70}
        renderLabel={(value) => {
          // Format hour as 12-hour time
          if (value === "12") return "12 pm";
          if (value === "0") return "12 am";
          if (Number(value) > 12) return `${Number(value) - 12} pm`;
          return `${value} am`;
        }}
        soundDelay={120}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BAR GRAPH                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/**
       * Productivity bar graph
       *
       * Shows 24 bars (one per hour)
       * Bars animate in with stagger effect
       * Peak hour is highlighted in pink
       */}
      <div
        style={{
          display: "flex",
          flex: 1, // Take remaining space
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProductivityGraph productivityPerHour={graphData} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * <ProductivityWithAudio
 *   graphData={MOCK_PRODUCTIVITY_DATA}
 *   weekday="3"  // Thursday (0-indexed)
 *   hour="10"    // 10 AM
 * />
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To adjust bar animation:
 * - Change DELAY_FRAMES for start time
 * - Modify stagger (index * 2) for wave speed
 * - Adjust DURATION_FRAMES for animation speed
 *
 * To change bar colors:
 * - Update backgroundColor for normal bars
 * - Change #FF6B9D for highlighted bar
 * - Adjust border color/width
 *
 * To modify wheel timing:
 * - Change delay prop (when wheel starts)
 * - Adjust soundDelay (when sound plays)
 * - Update radius for wheel size
 */
