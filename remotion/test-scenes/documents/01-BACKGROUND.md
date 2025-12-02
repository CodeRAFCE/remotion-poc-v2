# 🌌 Background System - Gradient & Noise

## 📚 Table of Contents

- [Overview](#overview)
- [The Gradient System](#the-gradient-system)
- [The Noise Overlay](#the-noise-overlay)
- [How They Work Together](#how-they-work-together)
- [Code Deep Dive](#code-deep-dive)

---

## Overview

The background of the Stars and Productivity scene consists of **two layered visual elements**:

1. **📐 Gradient**: A smooth color gradient (blueRadial) that provides the base atmosphere
2. **✨ Noise**: An animated grain texture overlay that adds depth and visual interest

Together, they create a rich, dynamic space-like background that persists throughout the entire scene.

### Visual Composition

```
┌─────────────────────────────────────┐
│                                     │  ← Top: Dark blue (#060842)
│         GRADIENT LAYER              │
│      (blueRadial - Static)          │  ← Middle: Purple (#474280)
│                                     │
│                                     │  ← Bottom: Teal (#396A91)
├─────────────────────────────────────┤
│    ·  · ·   ·   ·  ·      ·   ·    │  ← NOISE LAYER
│  ·    ·   ·   ·     ·  ·    ·   ·  │  (Animated dots - Moving)
│     ·   ·   ·    ·    ·  ·     ·   │
└─────────────────────────────────────┘
```

---

## The Gradient System

### What is blueRadial?

The `blueRadial` gradient creates a smooth vertical transition through three shades of blue/purple:

```typescript
"linear-gradient(180deg, #060842 0%, #474280 50%, #396A91 100%)";
```

**Color Breakdown:**

- **#060842** (Top): Deep space blue - almost black
- **#474280** (Middle): Purple-blue - creates depth
- **396A91** (Bottom): Teal-blue - lighter, atmospheric

### Implementation

**📄 File:** [`components/NativeGradient.tsx`](../components/NativeGradient.tsx)

**Key Code Section (Lines 1-26):**

```typescript
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { GradientType } from "./available-gradients";
import { availableGradients } from "./available-gradients";

type Props = {
  readonly gradient: GradientType;  // Which gradient to use
};

export const NativeGradient: React.FC<Props> = ({ gradient }) => {
  // Memoize the style to prevent recalculation every frame
  const style: React.CSSProperties = useMemo(() => {
    return {
      backgroundImage: availableGradients[gradient],
    };
  }, [gradient]);

  return <AbsoluteFill style={style} />;
};

// Simplified wrapper for consistency
export const Gradient: React.FC<Props> = ({ gradient }) => {
  return <NativeGradient gradient={gradient} />;
};
```

**How it works:**

1. **`gradient` prop**: Specifies which gradient to use (e.g., "blueRadial")
2. **`availableGradients`**: Object containing all gradient CSS strings
3. **`useMemo`**: Caches the style object to avoid recreating it every frame
4. **`AbsoluteFill`**: Remotion component that fills the entire canvas

### Available Gradients

**📄 File:** [`components/available-gradients.ts`](../components/available-gradients.ts)

The scene uses `blueRadial` but many other gradients are available:

| Gradient Name | Type   | Colors                      | Use Case           |
| ------------- | ------ | --------------------------- | ------------------ |
| `blueRadial`  | Linear | #060842 → #474280 → #396A91 | **✅ Our scene**   |
| `orange`      | Radial | #DD8B5A → transparent       | Planet/sun effects |
| `blue`        | Radial | #32588D → transparent       | Water/ice planets  |
| `greenAlien`  | Linear | Dark green → bright green   | Alien atmospheres  |
| `glow`        | Radial | Yellow → blue → dark        | Glowing effects    |

**Full gradient definitions:** Lines 1-35 in `available-gradients.ts`

### Why Memoization?

```typescript
const style = useMemo(() => {
  return { backgroundImage: availableGradients[gradient] };
}, [gradient]);
```

**Without memoization:**

- Style object recreated 30 times per second (900 times in 30s video)
- React re-renders component unnecessarily

**With memoization:**

- Style object created once
- Only recreated if `gradient` prop changes
- **Performance boost:** ~99% fewer object creations

---

## The Noise Overlay

### What is Noise?

The noise overlay creates an animated "grain" effect - like film grain or dust particles floating in space.

**Visual Effect:**

- Small circular dots
- Various sizes (2-6 pixels diameter)
- Various colors (blues, grays, teals)
- Semi-transparent (60-65% opacity)
- Appears to move slowly (parallax effect)

### Implementation

**📄 File:** [`components/Noise.tsx`](../components/Noise.tsx)

**Key Code Sections:**

#### 1. Configuration (Lines 1-29)

```typescript
import { noise2D } from "@remotion/noise";
import React, { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

// Size of each noise "unit" in pixels
const unitSize = 15;

// Color palette for noise dots (10 colors)
const palette = [
  "#15466C", // Dark blue
  "#808080", // Gray
  "#615955", // Brown-gray
  "#726455", // Tan
  "#7CA2C3", // Light blue
  "#A1C2C0", // Teal
  "#AAA8A8", // Light gray
  "#1C394A", // Deep blue
  "#3B6773", // Sea blue
  "#465B79", // Slate blue
];
```

**Why 10 colors?** Matches with single-digit random numbers (0-9) extracted from noise values.

#### 2. Noise Generation (Lines 31-50)

```typescript
export const Noise: React.FC<Props> = ({ translateX, translateY }) => {
  const { width, height } = useVideoConfig();

  // Generate noise samples for entire canvas
  const samples = useMemo(() => {
    // Calculate how many units fit horizontally and vertically
    const unitsHorizontal = width / unitSize;   // e.g., 1080 / 15 = 72
    const unitsVertical = height / unitSize;     // e.g., 1080 / 15 = 72

    // Calculate offset for animation
    const unitOffsetX = Math.floor(translateX / unitSize);
    const unitOffsetY = Math.floor(translateY / unitSize);

    // Create 2D array of noise values
    return Array.from({ length: unitsHorizontal }, (_, column) => {
      return Array.from({ length: unitsVertical }, (__, row) => {
        const x = column - unitOffsetY;
        const y = row - unitOffsetX - x * unitsHorizontal;

        // Generate noise value for this position
        return { x: noise2D("seedx", y * 6, x * 6) };
      });
    });
  }, [height, translateX, translateY, width]);
```

**What is `noise2D`?**

- Function from Remotion's noise library
- Generates "Perlin noise" (smooth, natural-looking randomness)
- Takes: seed string, x coordinate, y coordinate
- Returns: Number between -1 and 1

**Why multiply by 6?**

- Scales the noise pattern
- Lower values = larger patterns
- Higher values = more detailed patterns

#### 3. Rendering Noise Dots (Lines 52-95)

```typescript
const memoizedSamples = useMemo(() => {
  return samples.map((sample, i) => {
    return (
      <div key={i} style={{ display: "flex", flexDirection: "row" }}>
        {sample.map((s, j) => {
          // Only render dots where noise value is high enough
          if (s.x < 0.9) {
            return null;  // Skip this position (90% of positions)
          }

          // Extract random digits from noise value
          const str = String(s.x);         // e.g., "0.942837465"
          const randomDigit = Number(str[2]);   // Color: 4
          const randomDigit2 = Number(str[4]);  // Size: 2
          const randomDigit3 = Number(str[6]);  // Opacity: 3

          return (
            <div
              key={`${i}-${j}`}
              style={{
                // Size varies: 2-6 pixels
                width: 6 * randomDigit2 * 0.1,
                height: 6 * randomDigit2 * 0.1,

                // Position in grid
                left: i * unitSize,
                top: j * unitSize,
                position: "absolute",

                // Animation: Moves based on translateX/Y
                transform: `translateY(${
                  translateX % unitSize
                }px) translateX(${translateY % unitSize}px)`,

                // Random color from palette
                backgroundColor: palette[randomDigit],
                fontSize: 10,
                borderRadius: "50%",  // Make circular

                // Random opacity: 60-65%
                opacity: randomDigit3 * 0.05 + 0.6,
              }}
            />
          );
        })}
      </div>
    );
  });
}, [samples, translateX, translateY]);
```

**Key Algorithm Steps:**

1. **Threshold Check:** Only render if `s.x >= 0.9` (10% of positions)
2. **Extract Randomness:** Use digits from noise value for variation
3. **Apply Styles:** Size, color, opacity, position
4. **Transform:** Animate position based on `translateX`/`translateY`

### Noise Props

```typescript
type Props = {
  translateX: number; // Horizontal movement
  translateY: number; // Vertical movement
};
```

**In our scene:** Both are set to 0 (stationary noise)

```typescript
<Noise translateX={0} translateY={0} />
```

**Could animate by:** Changing translateX/Y over time

```typescript
<Noise translateX={frame * 0.5} translateY={0} />
```

Result: Noise moves right slowly

---

## How They Work Together

### Layering in StarsAndProductivityReplica

**📄 File:** [`StarsAndProductivityReplica.tsx`](../StarsAndProductivityReplica.tsx) (Lines 217-223)

```typescript
{/* Background Layer - Always Visible */}
<AbsoluteFill style={{ opacity: gradientOpacity }}>
  <Gradient gradient="blueRadial" />
  <Noise translateX={0} translateY={0} />
</AbsoluteFill>
```

**Rendering Order (back to front):**

1. **`AbsoluteFill`** - Container with fade-in opacity
2. **`Gradient`** - Rendered first (back layer)
3. **`Noise`** - Rendered second (front layer)

### The Fade-In Effect

**Code:** Lines 209-212 in `StarsAndProductivityReplica.tsx`

```typescript
const gradientOpacity = interpolate(frame, [0, 10], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**What this does:**

| Frame | Opacity    | Visual Effect          |
| ----- | ---------- | ---------------------- |
| 0     | 0.0 (0%)   | Completely transparent |
| 5     | 0.5 (50%)  | Half visible           |
| 10    | 1.0 (100%) | Fully visible          |
| 10+   | 1.0 (100%) | Stays fully visible    |

**Why fade in?**

- Smooth entrance (not jarring)
- Professional animation feel
- Matches scene opening timing

### CSS Compositing

```
z-index visualization:
┌─────────────────────┐
│  NOISE LAYER (top)  │  opacity: 60-65%
├─────────────────────┤  ← Blends with gradient below
│ GRADIENT (bottom)   │  opacity: 100%
└─────────────────────┘
     ↓
  Combined result: Textured gradient background
```

**How transparency works:**

- Noise dots are semi-transparent (60-65%)
- You see both the dot color AND the gradient beneath
- Creates depth and layering effect

---

## Code Deep Dive

### Performance Optimizations

#### 1. Memoization in Gradient

**File:** `NativeGradient.tsx` Line 10

```typescript
const style = useMemo(() => {
  return { backgroundImage: availableGradients[gradient] };
}, [gradient]);
```

**Benefit:** Style object created once, not 900 times (30-second video)

#### 2. Memoization in Noise (Samples)

**File:** `Noise.tsx` Line 33

```typescript
const samples = useMemo(() => {
  // Heavy computation here
  return Array.from({ length: unitsHorizontal }, ...);
}, [height, translateX, translateY, width]);
```

**Benefit:** Noise grid recalculated only when dimensions or translation changes

#### 3. Memoization in Noise (Rendering)

**File:** `Noise.tsx` Line 52

```typescript
const memoizedSamples = useMemo(() => {
  return samples.map(...);
}, [samples, translateX, translateY]);
```

**Benefit:** DOM elements created only when samples or position changes

### Why AbsoluteFill?

```typescript
<AbsoluteFill>
  <Gradient />
  <Noise />
</AbsoluteFill>
```

**`AbsoluteFill` is a Remotion component that:**

- Sets `position: absolute`
- Sets `top: 0`, `left: 0`, `right: 0`, `bottom: 0`
- Fills 100% of parent container
- Simplifies full-canvas layouts

**Equivalent CSS:**

```css
.absolute-fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
```

---

## Experimentation Guide

### Try Different Gradients

In `StarsAndProductivityReplica.tsx`, change line 219:

```typescript
// Current:
<Gradient gradient="blueRadial" />

// Try these:
<Gradient gradient="orange" />      // Orange radial glow
<Gradient gradient="greenAlien" />  // Green alien atmosphere
<Gradient gradient="glow" />        // Multi-color glow
<Gradient gradient="purple" />      // Deep purple space
```

### Animate the Noise

Change the Noise component on line 220:

```typescript
// Current (static):
<Noise translateX={0} translateY={0} />

// Slow horizontal drift:
<Noise translateX={frame * 0.3} translateY={0} />

// Slow vertical rise:
<Noise translateX={0} translateY={-frame * 0.2} />

// Diagonal movement:
<Noise translateX={frame * 0.2} translateY={-frame * 0.2} />
```

### Adjust Noise Density

In `Noise.tsx`, change the threshold on line 58:

```typescript
// Current (sparse - 10% density):
if (s.x < 0.9) return null;

// More dots (25% density):
if (s.x < 0.75) return null;

// Fewer dots (5% density):
if (s.x < 0.95) return null;
```

### Change Noise Colors

In `Noise.tsx`, modify the palette array (lines 13-24):

```typescript
// Add more blues:
const palette = [
  "#0A1128",
  "#001F54",
  "#034078",
  "#1282A2",
  "#0A1045",
  "#0D3B66",
  "#1C77C3",
  "#39A9DB",
  "#4B86B4",
  "#2A628F",
];

// Space theme:
const palette = [
  "#000000",
  "#0B0C10",
  "#1F2833",
  "#C5C6C7",
  "#45A29E",
  "#66FCF1",
  "#1E2749",
  "#283655",
  "#4D648D",
  "#D0E1F9",
];
```

---

## Key Takeaways

### What You Learned

✅ **Gradient System:** How to use CSS gradients in Remotion
✅ **Noise Generation:** How Perlin noise creates natural randomness
✅ **Layering:** How multiple visual elements combine
✅ **Performance:** Why memoization matters in animations
✅ **Interpolation:** How to create smooth fade-in effects

### Best Practices

1. **Always memoize expensive computations** in animation components
2. **Layer visual effects** from back to front
3. **Use AbsoluteFill** for full-canvas elements
4. **Fade in backgrounds** for professional feel
5. **Keep noise subtle** (60-65% opacity, sparse distribution)

---

## Next Steps

Now that you understand the background system, continue to:

**➡️ [02-STARS-ANIMATION.md](./02-STARS-ANIMATION.md)** - Learn how stars shoot across this background!

---

**Questions or want to experiment?** Try modifying the gradient or noise settings and see what happens! 🎨
