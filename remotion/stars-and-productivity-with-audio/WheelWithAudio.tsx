import gsap from "gsap";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WHEEL COMPONENT WITH AUDIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * Creates a 3D rotating wheel effect that displays multiple values arranged
 * in a circle. Used to show weekday/hour selection with smooth spinning animation.
 *
 * WHAT IT DOES:
 * 1. Arranges items in a 3D circle using trigonometry
 * 2. Rotates the wheel from high speed to stop
 * 3. Highlights the selected value
 * 4. Uses perspective for realistic 3D depth
 * 5. Counter-rotates text to keep it readable
 *
 * KEY CONCEPTS TO LEARN:
 * ✅ 3D CSS Transforms (rotateX, translateZ, translateY)
 * ✅ Perspective and backface-visibility for 3D effects
 * ✅ GSAP easing with frame-based animation
 * ✅ Trigonometry for circular positioning (Math.cos, Math.sin)
 * ✅ Conditional styling based on selection
 * ✅ Transform order and composition
 *
 * MATH CONCEPTS:
 * - Circle positioning: angle = (index / total) * 2π
 * - X position: cos(angle) * radius
 * - Y position: sin(angle) * radius
 * - Rotation: Modulo to keep in range
 *
 * ANIMATION:
 * - Duration: 100 frames
 * - Easing: power2.out (deceleration)
 * - Effect: Slot machine / roulette wheel
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Props = {
  /**
   * Currently selected value (e.g., "Monday" or "14")
   * This is what the wheel will stop on
   */
  value: string;

  /**
   * All possible values to display in the wheel
   * Example: ["Monday", "Tuesday", ...] or ["0", "1", "2", ...]
   */
  values: string[];

  /**
   * Size of the wheel (distance from center to items)
   * Larger radius = bigger wheel
   * Example: 130 for weekday, 300 for hour
   */
  radius: number;

  /**
   * Custom label formatter function
   * Transforms the value before display
   * Example: (value) => value === "0" ? "12 am" : `${value} am`
   */
  renderLabel: (value: string) => React.ReactNode;

  /**
   * When the wheel animation starts (in frames)
   * Allows staggering multiple wheels
   * Example: 60 for weekday, 70 for hour
   */
  delay: number;

  /**
   * When sound should play (not used in this component)
   * Sound is triggered in parent component
   */
  soundDelay: number;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const WheelWithAudio: React.FC<Props> = ({
  value,
  values,
  radius,
  renderLabel,
  delay,
}) => {
  // Get current frame number
  const frame = useCurrentFrame();

  // ══════════════════════════════════════════════════════════════════════════
  // ANIMATION LOGIC
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Animation parameters
   *
   * We're replicating Spring physics with GSAP easing:
   * - Original uses: mass, damping, stiffness
   * - We use: duration + easing curve
   * - Result: Similar visual effect, simpler implementation
   *
   * Duration: 100 frames (3.33 seconds at 30fps)
   * - Long enough to see the spin
   * - Short enough to not be boring
   * - Matches GitHub Unwrapped timing
   */
  const DURATION_FRAMES = 100;

  /**
   * Calculate animation progress (0 to 1)
   *
   * Formula: (currentFrame - delayFrame) / duration
   *
   * Examples:
   * Frame 60 (delay): (60 - 60) / 100 = 0.0 (start)
   * Frame 110:        (110 - 60) / 100 = 0.5 (halfway)
   * Frame 160:        (160 - 60) / 100 = 1.0 (complete)
   * Frame 200:        (200 - 60) / 100 = 1.4 → clamped to 1.0
   *
   * Math.max(0, ...): Don't go below 0 (before animation starts)
   * Math.min(1, ...): Don't go above 1 (after animation ends)
   */
  const framesSinceStart = Math.max(0, frame - delay);
  const rawProgress = Math.min(1, framesSinceStart / DURATION_FRAMES);

  /**
   * Apply GSAP easing curve
   *
   * "power2.out" characteristics:
   * - Starts fast (wheel spins quickly)
   * - Slows down at end (smooth stop)
   * - Creates "slot machine" effect
   *
   * Progress curve:
   * 0.0 → 0.0  (not started)
   * 0.1 → 0.19 (fast initial spin)
   * 0.5 → 0.75 (slowing down)
   * 0.9 → 0.99 (almost stopped)
   * 1.0 → 1.0  (stopped)
   */
  const ease = gsap.parseEase("power2.out");
  const progress = ease(rawProgress);

  /**
   * Rotation calculation
   *
   * What: Controls how much the wheel has rotated
   * Range: 0 to π (half circle)
   *
   * Formula: (1 - progress) % Math.PI
   *
   * Breakdown:
   * - (1 - progress): Inverted progress (1 → 0)
   *   - Start: 1 - 0 = 1 (full rotation)
   *   - End: 1 - 1 = 0 (stopped)
   *
   * - % Math.PI: Modulo keeps rotation in range
   *   - Math.PI ≈ 3.14159 (half circle in radians)
   *   - Prevents rotation from going too far
   *
   * Why modulo Math.PI?
   * - Keeps rotation smooth and continuous
   * - Prevents visual jumps
   * - Creates realistic deceleration
   *
   * Examples:
   * progress = 0.0: rotation = 1.0 (spinning fast)
   * progress = 0.5: rotation = 0.5 (slowing down)
   * progress = 1.0: rotation = 0.0 (stopped)
   */
  const rotationValue = (1 - progress) % Math.PI;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <AbsoluteFill
      style={{
        /**
         * Perspective: Creates 3D depth
         *
         * What: Distance from viewer to the 3D scene
         * Value: 10000px (very far = subtle 3D effect)
         *
         * How it works:
         * - Lower values (500px): Dramatic, exaggerated 3D
         * - Higher values (10000px): Subtle, realistic 3D
         * - Infinite: No 3D effect (flat)
         *
         * Why 10000px?
         * - Matches GitHub Unwrapped
         * - Creates subtle depth without distortion
         * - Text remains readable
         */
        perspective: 10000,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RENDER EACH WHEEL ITEM                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {values.map((item, index) => {
        // ════════════════════════════════════════════════════════════════════
        // CIRCULAR POSITIONING MATH
        // ════════════════════════════════════════════════════════════════════

        /**
         * Calculate position on the circle
         *
         * Step 1: Normalize index (0 to 1)
         * - index / values.length
         * - Example with 7 days:
         *   - Monday (0): 0/7 = 0.0
         *   - Tuesday (1): 1/7 = 0.14
         *   - Sunday (6): 6/7 = 0.86
         *
         * Step 2: Add rotation
         * - + rotationValue
         * - Shifts all items by the same amount
         * - Creates the spinning effect
         *
         * Result: normalizedIndex (0 to 1 + rotation)
         */
        const normalizedIndex = index / values.length + rotationValue;

        /**
         * Calculate which value is at this position
         *
         * Formula: (index + Number(value)) % values.length
         *
         * Why?
         * - We need to know which day/hour is at each position
         * - As the wheel rotates, values shift
         * - Modulo wraps around (7 → 0, 24 → 0)
         *
         * Example with weekday (value = "3" = Thursday):
         * - Position 0: (0 + 3) % 7 = 3 (Thursday)
         * - Position 1: (1 + 3) % 7 = 4 (Friday)
         * - Position 6: (6 + 3) % 7 = 2 (Wednesday)
         */
        const currentValueIndex = (index + Number(value)) % values.length;

        /**
         * Calculate 3D position on the wheel
         *
         * Angle: Full circle = 2π radians (360°)
         * - normalizedIndex * -Math.PI * 2
         * - Negative: Rotate counter-clockwise
         * - Example: 0.5 * -2π = -π (-180°)
         *
         * Z Position (depth): cos(angle) * radius
         * - Math.cos(angle): -1 to 1
         * - Multiply by radius for distance
         * - Positive Z: Closer to viewer
         * - Negative Z: Further from viewer
         *
         * Y Position (vertical): sin(angle) * radius
         * - Math.sin(angle): -1 to 1
         * - Multiply by radius for distance
         * - Positive Y: Below center
         * - Negative Y: Above center
         *
         * Visual representation:
         *        Top (Y = -radius)
         *           |
         *    Back --+-- Front
         *    (Z-)   |   (Z+)
         *           |
         *      Bottom (Y = +radius)
         */
        const angle = normalizedIndex * -Math.PI * 2;
        const zPosition = Math.cos(angle) * radius; // Forward/backward
        const yPosition = Math.sin(angle) * radius; // Up/down

        // ════════════════════════════════════════════════════════════════════
        // HIGHLIGHTING LOGIC
        // ════════════════════════════════════════════════════════════════════

        /**
         * Determine if this item is selected
         *
         * Comparison: Number(value) === currentValueIndex
         * - value: Selected value from props (e.g., "3")
         * - currentValueIndex: Value at this position
         * - If they match, this is the selected item
         */
        const isSelected = Number(value) === currentValueIndex;

        /**
         * Should we highlight this item?
         *
         * Conditions:
         * 1. Item is selected (isSelected)
         * 2. Animation has started (frame > delay + 5)
         *
         * Why delay + 5?
         * - Give wheel time to start spinning
         * - Prevents highlighting before animation
         * - Creates cleaner visual effect
         */
        const shouldHighlight = frame - 5 > delay;

        /**
         * Text opacity based on selection
         *
         * Selected item: opacity = 1.0 (fully visible)
         * Other items: opacity = 0.3 (semi-transparent)
         *
         * Why 0.3 for non-selected?
         * - Still visible (shows context)
         * - Clearly de-emphasized
         * - Creates visual hierarchy
         */
        const textOpacity = isSelected && shouldHighlight ? 1 : 0.3;

        // ════════════════════════════════════════════════════════════════════
        // RENDER WHEEL ITEM
        // ════════════════════════════════════════════════════════════════════

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
               * Order matters! Transforms apply RIGHT TO LEFT:
               *
               * 1. rotateX(angle): Tilt text to face viewer
               *    - Without this, text would be flat on the wheel
               *    - Angle matches position on circle
               *    - Makes text readable from front
               *
               * 2. translateY(yPosition): Move up/down
               *    - Positions item vertically on circle
               *    - Positive = down, negative = up
               *
               * 3. translateZ(zPosition): Move forward/backward
               *    - Positions item in depth
               *    - Positive = closer, negative = further
               *    - Creates 3D circular effect
               *
               * Visual result:
               * - Items arranged in a circle
               * - Facing toward the viewer
               * - Rotating around Y axis
               */
              transform: `translateZ(${zPosition}px) translateY(${yPosition}px) rotateX(${angle}rad)`,

              /**
               * backfaceVisibility: "hidden"
               *
               * What: Hides elements when rotated away from viewer
               * Why: Items on back of wheel shouldn't be visible
               * Result: Cleaner visual, no text showing through
               */
              backfaceVisibility: "hidden",

              /**
               * perspective: 1000
               *
               * What: Additional perspective for this item
               * Why: Enhances 3D effect on individual items
               * Note: Different from parent perspective
               */
              perspective: 1000,
            }}
          >
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* COUNTER-ROTATED TEXT                                            */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            {/**
             * Text container with counter-rotation
             *
             * Why counter-rotate?
             * - Parent rotates text to face viewer
             * - But text itself would be tilted
             * - Counter-rotation makes text upright
             *
             * Transform: rotateX(-angle)
             * - Negative of parent rotation
             * - Cancels out the tilt
             * - Text appears horizontal
             *
             * Example:
             * - Parent: rotateX(45deg)
             * - Child: rotateX(-45deg)
             * - Result: Text is upright (0deg)
             */}
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
              {/**
               * Render the label
               *
               * renderLabel() allows custom formatting:
               * - Weekday: "Monday" → "Monday"
               * - Hour: "14" → "2 pm"
               * - Custom: Any transformation needed
               */}
              {renderLabel(values[currentValueIndex])}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Weekday wheel
 *
 * <WheelWithAudio
 *   values={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
 *   value="3"  // Thursday (0-indexed)
 *   radius={130}
 *   renderLabel={(value) => value}
 *   delay={60}
 *   soundDelay={95}
 * />
 */

/**
 * Example 2: Hour wheel with formatting
 *
 * <WheelWithAudio
 *   values={["0", "1", "2", ..., "23"]}
 *   value="14"  // 2 PM
 *   radius={300}
 *   renderLabel={(value) => {
 *     if (value === "0") return "12 am";
 *     if (value === "12") return "12 pm";
 *     if (Number(value) > 12) return `${Number(value) - 12} pm`;
 *     return `${value} am`;
 *   }}
 *   delay={70}
 *   soundDelay={120}
 * />
 */

// ============================================================================
// MATH VISUALIZATION
// ============================================================================

/**
 * Circle positioning visualization:
 *
 *           Top (angle = -π/2)
 *               Y = -radius
 *                   |
 *                   |
 *    Left -------- Center -------- Right
 *    (angle = π)    |    (angle = 0)
 *                   |
 *                   |
 *          Bottom (angle = π/2)
 *             Y = +radius
 *
 * Z-axis (depth):
 * - Front (Z = +radius): angle = 0
 * - Back (Z = -radius): angle = π
 *
 * For 7 items (weekdays):
 * - Item 0: angle = 0 * (2π/7) = 0
 * - Item 1: angle = 1 * (2π/7) ≈ 0.9
 * - Item 2: angle = 2 * (2π/7) ≈ 1.8
 * - ...
 * - Item 6: angle = 6 * (2π/7) ≈ 5.4
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To adjust wheel size:
 * - Change radius prop (larger = bigger wheel)
 * - Adjust font size for readability
 * - Test with different values
 *
 * To change animation speed:
 * - Modify DURATION_FRAMES (lower = faster)
 * - Try different easing: "power1.out", "power3.out"
 * - Test in Remotion Studio
 *
 * To change 3D effect:
 * - Adjust perspective value (lower = more dramatic)
 * - Modify radius (affects depth perception)
 * - Experiment with different angles
 *
 * To customize highlighting:
 * - Change textOpacity values (1 and 0.3)
 * - Adjust shouldHighlight delay (frame - 5)
 * - Add color changes for selected item
 */
