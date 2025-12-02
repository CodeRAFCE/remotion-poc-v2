# 🎡 3D Wheel Component - Complete Deep Dive

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [3D Circular Positioning](#3d-circular-positioning)
- [Spring Physics](#spring-physics)
- [Counter-Rotation Technique](#counter-rotation-technique)
- [Value Selection](#value-selection)
- [Code Deep Dive](#code-deep-dive)
- [Math Explained](#math-explained)
- [Audio Integration](#audio-integration)
- [Visual Polish](#visual-polish)
- [Experimentation Guide](#experimentation-guide)

---

## Overview

The Wheel component creates a 3D rotating carousel effect, displaying values (like days or hours) in a circular arrangement. It spins to highlight the selected value, creating an engaging, interactive-looking visualization.

### Key Features

- **3D Circular Layout** - Values arranged in circle using trigonometry
- **Spring Animation** - Physics-based rotation to selected value
- **Counter-Rotation** - Labels stay readable despite wheel rotation
- **Depth Perception** - Z-axis positioning for front/back effect
- **Audio Feedback** - Sound effect when wheel stops

### Visual Concept

```
       ╱──────╲
      │ Monday │  ← Back (faded, small)
      ├────────┤
     │ Tuesday │  ← Middle
    ┌──────────┐
    │Wednesday │  ← Front (highlighted, large)
    └──────────┘
     │Thursday │  ← Middle
      ├────────┤
      │ Friday │  ← Back (faded, small)
       ╲──────╱
```

---

## Architecture

### Component Hierarchy

```
Wheel (Container with perspective)
│
├── Audio (Stop sound)
│
└── AbsoluteFill (3D space)
    │
    └── Map over values
        │
        └── AbsoluteFill (Each value)
            │
            ├── 3D Transform (Position in circle)
            ├── Z-position (Depth)
            ├── Y-position (Vertical offset)
            ├── Rotation (Face camera)
            │
            └── div (Label with counter-rotation)
                └── renderLabel(value)
```

### Data Flow

```
Props: { value, values, radius, renderLabel, delay }
        ↓
Calculate rotation from spring
        ↓
For each value in values:
    ↓
  Calculate index position
    ↓
  Compute 3D coordinates (x, y, z)
    ↓
  Apply transforms
    ↓
  Render label (counter-rotated)
```

---

## 3D Circular Positioning

### Circle Math Fundamentals

**File:** `Wheel.tsx` (Lines 60-65)

```typescript
const index = i / values.length + rotation;

const zPosition = Math.cos(index * -Math.PI * 2) * radius;
const y = Math.sin(index * Math.PI * 2) * radius;
const r = interpolate(index, [0, 1], [0, Math.PI * 2]);
```

### Understanding the Formula

**Step 1: Calculate Index (0-1 range)**

```typescript
const index = i / values.length + rotation;
```

Example with 7 days:

```
i = 0:  index = 0/7 + rotation = 0.000 + rotation
i = 1:  index = 1/7 + rotation = 0.143 + rotation
i = 2:  index = 2/7 + rotation = 0.286 + rotation
...
i = 6:  index = 6/7 + rotation = 0.857 + rotation
```

**Step 2: Convert to Circular Coordinates**

```typescript
const zPosition = Math.cos(index * -Math.PI * 2) * radius;
const y = Math.sin(index * Math.PI * 2) * radius;
```

**Math Breakdown:**

```
index * -Math.PI * 2 = angle in radians
    ↓
index = 0   → angle = 0°    → Front center
index = 0.25 → angle = 90°  → Top
index = 0.5  → angle = 180° → Back center
index = 0.75 → angle = 270° → Bottom
index = 1    → angle = 360° → Front center (full circle)
```

### Circular Positioning Diagram

```
           Top (90°)
        index = 0.25
             ↑
             │
             │
Left ────────●──────── Right
(180°)  index = 0  (0°)
index=0.5    │
             │
             ↓
        index = 0.75
          Bottom (270°)
```

### Z and Y Coordinates

**Z-Position (Depth):**

```typescript
const zPosition = Math.cos(index * -Math.PI * 2) * radius;
```

```
index = 0    → cos(0°)   = 1   → z = radius   (front)
index = 0.25 → cos(90°)  = 0   → z = 0        (side)
index = 0.5  → cos(180°) = -1  → z = -radius  (back)
index = 0.75 → cos(270°) = 0   → z = 0        (side)
```

**Y-Position (Vertical):**

```typescript
const y = Math.sin(index * Math.PI * 2) * radius;
```

```
index = 0    → sin(0°)   = 0   → y = 0        (center)
index = 0.25 → sin(90°)  = 1   → y = radius   (top)
index = 0.5  → sin(180°) = 0   → y = 0        (center)
index = 0.75 → sin(270°) = -1  → y = -radius  (bottom)
```

### 3D Visualization

Side view of wheel:

```
        radius = 300px

    y = +300 ────●──── (Top, index=0.25)
                 │
                 │
    y = 0 ───────●──── (Center, index=0)
                 │      z = +300 (front)
                 │
    y = -300 ────●──── (Bottom, index=0.75)


Front view:

              ●  ← z = -300 (back, faded)
             ╱ ╲
            ╱   ╲
           ●     ●  ← z = 0 (side)
           │     │
           ●  ●  ●  ← z = +300 (front, visible)
```

---

## Spring Physics

### Wheel Spring Configuration

**File:** `Wheel.tsx` (Lines 20-30)

```typescript
const wheelSpring = ({
  fps,
  frame,
  delay,
}: {
  fps: number;
  frame: number;
  delay: number;
}) => {
  return spring({
    fps,
    frame,
    config: {
      mass: 10, // Heavy wheel
      damping: 200, // Smooth stop
      stiffness: 200, // Moderate spring
    },
    durationInFrames: 100,
    delay,
    durationRestThreshold: 0.0001,
  });
};
```

### Spring Parameters Explained

**Mass: 10**

- Heavy wheel = slow rotation
- Creates realistic momentum
- Feels weighty and substantial

**Damping: 200**

- High damping = no bounce
- Smooth deceleration
- Professional feel

**Stiffness: 200**

- Moderate spring force
- Balanced with mass for smooth motion
- Not too stiff (would be jerky)

### Initial Speed Calculation

**File:** `Wheel.tsx` (Lines 32-34)

```typescript
const WHEEL_INIT_SPEED =
  wheelSpring({ fps: FPS, frame: 10, delay: 0 }) -
  wheelSpring({ fps: FPS, frame: 0, delay: 0 });
```

**Purpose:** Calculate velocity at start for smooth initial movement

**Usage:**

```typescript
const progress =
  wheelSpring({ fps, frame, delay }) +
  interpolate(frame, [delay - 1, delay], [-WHEEL_INIT_SPEED / 10, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "extend",
  });
```

**Effect:**

- Adds slight "wind-up" before spin starts
- Prevents sudden jerk at beginning
- Smoother, more natural motion

### Rotation Calculation

**File:** `Wheel.tsx` (Line 51)

```typescript
const rotation = interpolate(progress, [0, 1], [1, 0]) % Math.PI;
```

**Why [1, 0] (reverse)?**

- progress: 0 → 1 over time
- rotation: 1 → 0 over time
- Creates counter-clockwise spin
- Modulo π for continuous rotation

**Example:**

```
progress = 0   → rotation = 1
progress = 0.5 → rotation = 0.5
progress = 1   → rotation = 0
```

---

## Counter-Rotation Technique

### The Problem

Without counter-rotation:

```
Wheel rotates:     Labels rotate with wheel:
    ╱──────╲            ╱──────╲
   │ Monday │          ╱ Monday ╲  ← Upside down!
   └────────┘         └──────────┘
```

Labels become unreadable!

### The Solution

**File:** `Wheel.tsx` (Lines 67-100)

```typescript
<AbsoluteFill
  key={i}
  style={{
    justifyContent: "center",
    fontSize: 65,
    transform: `translateZ(${zPosition}px)
                translateY(${y}px)
                rotateX(${r}deg)`,  ← Rotates label
    backfaceVisibility: "hidden",
  }}
>
  <div
    style={{
      transform: `rotateX(-${r}rad)`,  ← Counter-rotates!
      backfaceVisibility: "hidden",
      textAlign: "right",
    }}
  >
    {renderLabel(values[thisIndex])}
  </div>
</AbsoluteFill>
```

### Counter-Rotation Math

**Parent Rotation:**

```typescript
rotateX(${r}deg)  // Rotate with wheel
```

**Child Counter-Rotation:**

```typescript
rotateX(-${r}rad)  // Rotate opposite direction
```

**Net Effect:**

```
Parent: +r degrees
Child:  -r degrees
─────────────────────
Total:   0 degrees   ← Labels stay upright!
```

**Visual:**

```
Step 1: Parent rotates 45°
    ╱──────╲
   ╱ Label  ╲  ← Rotated 45°

Step 2: Child counter-rotates -45°
    ┌──────┐
    │ Label │  ← Back to 0°, readable!
    └──────┘
```

---

## Value Selection

### Index Calculation

**File:** `Wheel.tsx` (Line 66)

```typescript
const thisIndex = (i + Number(value)) % values.length;
```

**Example with days (value = "3" = Wednesday):**

```
values = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

i = 0:  thisIndex = (0 + 3) % 7 = 3  → "Thu"
i = 1:  thisIndex = (1 + 3) % 7 = 4  → "Fri"
i = 2:  thisIndex = (2 + 3) % 7 = 5  → "Sat"
i = 3:  thisIndex = (3 + 3) % 7 = 6  → "Sun"
i = 4:  thisIndex = (4 + 3) % 7 = 0  → "Mon"
i = 5:  thisIndex = (5 + 3) % 7 = 1  → "Tue"
i = 6:  thisIndex = (6 + 3) % 7 = 2  → "Wed"  ← Selected!
```

Modulo (%) wraps around: 7 becomes 0, 8 becomes 1, etc.

### Highlighting Selected Value

**File:** `Wheel.tsx` (Lines 79-84)

```typescript
color:
  Number(value) === thisIndex && frame - 5 > delay
    ? PANE_TEXT_COLOR
    : transparentize(0.7, PANE_TEXT_COLOR),
```

**Logic:**

1. `Number(value) === thisIndex` - Is this the selected value?
2. `frame - 5 > delay` - Has wheel been visible for 5+ frames?
3. If both true: Full color (highlighted)
4. Otherwise: 70% transparent (faded)

**Effect:**

```
Not selected:  ░░░ Monday ░░░  (70% transparent)
Selected:      ███ Wednesday ███  (Full color, bold)
```

---

## Code Deep Dive

### Perspective Setup

**File:** `Wheel.tsx` (Lines 52-56)

```typescript
<AbsoluteFill
  style={{
    perspective: 10000,
  }}
>
```

**Purpose:**

- Creates 3D space for wheel
- High value (10000px) = subtle perspective
- Lower values = more dramatic perspective

**Comparison:**

```
perspective: 500         perspective: 10000
    ╱─╲                      │─│
   ╱   ╲                     │ │
  ╱     ╲                    │ │
 ╱       ╲                   │ │
Dramatic               Subtle, realistic
```

### Backface Visibility

**File:** `Wheel.tsx` (Lines 73, 91)

```typescript
backfaceVisibility: "hidden",
```

**Purpose:**

- Hides labels when rotated to back of wheel
- Prevents seeing text "through" wheel
- Cleaner visual presentation

**Effect:**

```
Without hidden:          With hidden:
   ┌──────┐                ┌──────┐
   │ Mon  │                │ Mon  │
   │ Wed  │  ← Both         │      │  ← Only front
   └──────┘   visible       └──────┘   visible
```

### Transform Application

**File:** `Wheel.tsx` (Lines 70-78)

```typescript
style={{
  justifyContent: "center",
  fontSize: 65,
  transform: `translateZ(${zPosition}px)
              translateY(${y}px)
              rotateX(${r}deg)`,
  backfaceVisibility: "hidden",
  perspective: 1000,
}}
```

**Transform Order (Right to Left):**

1. `rotateX(r deg)` - Rotate label to face forward
2. `translateY(y px)` - Position vertically in circle
3. `translateZ(z px)` - Position in depth

**Why this order?**

- Rotate first: Orients label correctly
- Then translate: Moves to final position
- Maintains label readability

---

## Math Explained

### Trigonometry Review

**Sine (sin):**

- Calculates **vertical** position
- Range: -1 to 1
- sin(0°) = 0, sin(90°) = 1, sin(180°) = 0, sin(270°) = -1

**Cosine (cos):**

- Calculates **depth** position
- Range: -1 to 1
- cos(0°) = 1, cos(90°) = 0, cos(180°) = -1, cos(270°) = 0

### Circular Motion Formula

For point on circle with radius `r`:

```
x = r × cos(angle)
y = r × sin(angle)
```

In our wheel:

```
z = radius × cos(angle)  ← Depth (front/back)
y = radius × sin(angle)  ← Height (up/down)
```

### Example Calculation

**Inputs:**

- radius = 300
- index = 0.25 (top of wheel)

**Calculations:**

```
angle = index × -2π = 0.25 × -6.28 = -1.57 rad = -90°

zPosition = 300 × cos(-90°) = 300 × 0 = 0
y = 300 × sin(-90°) = 300 × -1 = -300

Result: Item at top of wheel (y=-300, z=0)
```

### Rotation Interpolation

```typescript
const r = interpolate(index, [0, 1], [0, Math.PI * 2]);
```

**Maps index to rotation angle:**

| index | Math.PI × 2 | Angle | Rotation        |
| ----- | ----------- | ----- | --------------- |
| 0     | 0           | 0°    | Facing forward  |
| 0.25  | 1.57        | 90°   | Rotated right   |
| 0.5   | 3.14        | 180°  | Facing backward |
| 0.75  | 4.71        | 270°  | Rotated left    |
| 1     | 6.28        | 360°  | Full circle     |

---

## Audio Integration

**File:** `Wheel.tsx` (Lines 58-62)

```typescript
{isMobileDevice() ? null : (
  <Sequence from={soundDelay}>
    <Audio src={staticFile("stop.mp3")} volume={0.3} />
  </Sequence>
)}
```

**Timing:**

- Plays at `soundDelay` frame
- Coincides with wheel stopping
- Low volume (0.3) for subtlety

**Purpose:**

- Provides feedback for wheel selection
- Enhances feeling of physical interaction
- Desktop only (mobile compatibility)

---

## Visual Polish

### 1. Opacity Fade

**File:** `Wheel.tsx` (Lines 79-84)

```typescript
color:
  Number(value) === thisIndex && frame - 5 > delay
    ? PANE_TEXT_COLOR
    : transparentize(0.7, PANE_TEXT_COLOR),
```

**Effect:**

- Selected value: 100% opacity (bold, clear)
- Other values: 30% opacity (faded, background)
- Creates clear visual hierarchy

### 2. Text Alignment

**File:** `Wheel.tsx` (Lines 92-97)

```typescript
style={{
  transform: `rotateX(-${r}rad)`,
  backfaceVisibility: "hidden",
  textAlign: "right",
  lineHeight: 1,
  width: 410,
  paddingRight: 50,
}}
```

**Layout:**

- `width: 410` - Fixed width for consistency
- `textAlign: "right"` - Align to wheel edge
- `paddingRight: 50` - Spacing from edge
- `lineHeight: 1` - Compact vertical spacing

### 3. Font Styling

**File:** `Wheel.tsx` (Lines 82-84)

```typescript
fontFamily: "Mona Sans",
fontWeight: "bold",
fontSize: 65,
```

**Choices:**

- **Mona Sans:** Clean, modern sans-serif
- **Bold:** Improves readability at distance
- **65px:** Large enough to see on back of wheel

---

## Experimentation Guide

### Change Wheel Radius

**File:** `TopDay.tsx` (Lines 85-90)

```typescript
// Current: radius={130} for weekday, radius={300} for hour
<Wheel radius={130} />

// Try: Larger wheel
<Wheel radius={200} />

// Try: Smaller wheel
<Wheel radius={80} />
```

**Effect:** Larger radius = more dramatic 3D depth

### Adjust Spring Physics

**File:** `Wheel.tsx` (Lines 20-30)

```typescript
// Current: mass=10, damping=200, stiffness=200
config: {
  mass: 10,
  damping: 200,
  stiffness: 200,
}

// Try: Bouncy wheel
config: {
  mass: 2,
  damping: 50,
  stiffness: 300,
}

// Try: Super heavy wheel
config: {
  mass: 50,
  damping: 300,
  stiffness: 100,
}
```

### Modify Perspective

**File:** `Wheel.tsx` (Line 54)

```typescript
// Current: perspective: 10000 (subtle)
perspective: 10000,

// Try: Dramatic perspective
perspective: 500,

// Try: Almost flat
perspective: 50000,
```

### Change Fade Amount

**File:** `Wheel.tsx` (Lines 82-84)

```typescript
// Current: 70% transparent for unselected
transparentize(0.7, PANE_TEXT_COLOR);

// Try: More visible (50% transparent)
transparentize(0.5, PANE_TEXT_COLOR);

// Try: Nearly invisible (90% transparent)
transparentize(0.9, PANE_TEXT_COLOR);
```

### Adjust Rotation Speed

**File:** `Wheel.tsx` (Lines 25-27)

```typescript
// Current: 100 frames duration
durationInFrames: 100,

// Try: Faster spin
durationInFrames: 50,

// Try: Slower spin
durationInFrames: 200,
```

---

## Key Takeaways

### 3D Techniques

1. **Circular Positioning** - Use sin/cos for circular layouts
2. **Counter-Rotation** - Keep text readable with opposite rotation
3. **Z-axis Depth** - Create front/back with translateZ
4. **Perspective** - Control 3D effect strength
5. **Backface Culling** - Hide back-facing elements

### Animation Principles

1. **Spring Physics** - Natural, realistic motion
2. **Mass/Damping** - Control weight and bounce
3. **Initial Velocity** - Smooth start to animation
4. **Delayed Highlight** - Wait for animation to settle
5. **Audio Feedback** - Enhance interaction feeling

### Math Concepts

1. **Trigonometry** - Sin for Y, cos for Z
2. **Modulo Arithmetic** - Wrap values around (0-6 → 0)
3. **Interpolation** - Map ranges smoothly
4. **Index Normalization** - Scale to 0-1 range
5. **Circular Rotation** - 2π radians = full circle

---

## Advanced Concepts

### Why Negative Angle?

**File:** `Wheel.tsx` (Line 63)

```typescript
const zPosition = Math.cos(index * -Math.PI * 2) * radius;
```

**Negative angle:**

- Creates counter-clockwise rotation
- Front (z=+radius) is at index=0
- Matches expected visual behavior

**If positive:**

- Clockwise rotation
- Front would be at index=1
- Counterintuitive

### Transform Origin

Default transform origin is center of element. This works because:

- Rotation around center keeps labels in place
- Translation moves after rotation
- No need to adjust origin

### Performance Optimization

**File:** `Wheel.tsx` (Line 67)

```typescript
key = { i }; // Stable key prevents re-mounts
```

Using index as key:

- Consistent identity across renders
- No unnecessary unmount/remount
- Smooth animation performance

---

## Next Steps

**Continue Learning:**

**← [04-TABLET-SCENE.md](./04-TABLET-SCENE.md)** - Review 3D tablet transforms

**← [03-COCKPIT-SPACESHIP.md](./03-COCKPIT-SPACESHIP.md)** - Review HUD system

**← [02-STARS-ANIMATION.md](./02-STARS-ANIMATION.md)** - Review animation mechanics

**← [00-SCENE-OVERVIEW.md](./00-SCENE-OVERVIEW.md)** - See complete architecture

---

**Happy Learning!** 🚀✨

The 3D wheel component demonstrates advanced circular positioning mathematics, counter-rotation techniques, and spring physics for creating engaging, realistic 3D UI elements!
