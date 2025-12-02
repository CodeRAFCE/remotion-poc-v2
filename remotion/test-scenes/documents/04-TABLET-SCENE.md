# 📱 Tablet Scene & Productivity Visualization - Complete Deep Dive

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [3D Transform System](#3d-transform-system)
- [Entrance Animation](#entrance-animation)
- [Productivity Graph](#productivity-graph)
- [Top Day Wheels](#top-day-wheels)
- [Code Deep Dive](#code-deep-dive)
- [Transform Math Explained](#transform-math-explained)
- [Timing Coordination](#timing-coordination)
- [Visual Polish](#visual-polish)
- [Experimentation Guide](#experimentation-guide)

---

## Overview

The Tablet Scene showcases GitHub productivity data in a visually stunning 3D tablet visualization. It features:

- Dramatic entrance animation from bottom of screen
- 3D perspective transforms for depth
- Animated bar graphs showing hourly productivity
- 3D rotating wheels for day/time selection
- Professional tablet frame design

### Visual Journey

```
Frame 0-30:   Tablet offscreen (below viewport)
              ↓
Frame 30-46:  Tablet slides up with spring animation
              ↓
Frame 46-195: Tablet visible with 3D rotation
              - Productivity bars animate in
              - Wheels spin to selected values
              - Data fully displayed
              ↓
Frame 195-240: Tablet slides back down
              ↓
Scene ends
```

---

## Architecture

### Component Hierarchy

```
Tablet (3D Transform Manager)
│
├── Entrance Spring Animation
├── Zoom-to-Fullscreen Interpolation
│   ├── Parent Transform (Tablet frame)
│   └── Child Transform (Content)
│
├── TabletSVG (Device Frame)
│   └── Vector graphic of tablet
│
└── Productivity (Data Visualization)
    │
    ├── TopDay (Weekday Wheel)
    │   └── Wheel
    │       └── 7 rotating day labels
    │
    ├── TopDay (Hour Wheel)
    │   └── Wheel
    │       └── 24 rotating hour labels
    │
    └── ProductivityGraph
        └── 24 Bar components
            └── Spring-animated bars
```

### Data Flow

```
Parent Props
    ↓
{
  graphData: ProductivityPerHour[],
  enterProgress: 0-1,
  weekday: "Monday",
  hour: "14"
}
    ↓
Tablet Component
    ↓
├─→ Calculate 3D transforms
├─→ Apply entrance animation
├─→ Render tablet frame
    ↓
Productivity Component
    ↓
├─→ TopDay wheels (spin to selected value)
├─→ ProductivityGraph (animated bars)
```

---

## 3D Transform System

### Transform Strategy

The tablet uses **opposing transforms** on parent and child to create 3D effect while maintaining content readability.

**Concept:**

```
Parent rotates LEFT  → Child rotates RIGHT  → Net effect: 3D depth
Parent skews UP      → Child skews DOWN     → Content stays readable
```

### Transform Constants

**File:** `components/Tablet.tsx` (Lines 40-43)

```typescript
const SCREEN_ROTATION_Y = 15; // Degrees of Y-axis rotation
const SCREEN_ROTATION_X = -10; // Degrees of X-axis rotation
const SKEW_X = 7; // Degrees of X skew
const SKEW_Y = -4; // Degrees of Y skew
```

**Visual Representation:**

```
Top View (rotateY: 15°):

    Normal (0°)          Rotated (15°)
    ┌──────┐                 ╱──────╲
    │      │                ╱        ╲
    │      │               │          │
    │      │               │          │
    └──────┘                ╲        ╱
                             ╲──────╱

Side View (rotateX: -10°):

    Normal (0°)          Rotated (-10°)
    ┌──────┐             ┌──────┐
    │      │              ╲      │
    │      │               ╲     │
    │      │                ╲    │
    └──────┘                 ╲───┘
```

### Parent Transform

**File:** `components/Tablet.tsx` (Lines 95-105)

```typescript
<AbsoluteFill
  style={{
    display: "flex",
    position: "absolute",
    transformOrigin: "left bottom",
    transform: `scale(${masterScale})
                rotateY(${rotateYParent}deg)
                rotateX(${rotateXParent}deg)
                skewX(${skewXParent}deg)
                skewY(${skewYParent}deg)
                scale(${scaleParent})
                translateX(${translateX}px)
                translateY(${translateY}px)`,
  }}
>
  <TabletSVG />
</AbsoluteFill>
```

**Transform Order (Right to Left):**

1. `translateX/Y` - Position adjustment
2. `scale(scaleParent)` - Compensate for child scale
3. `skewY` - Vertical skew
4. `skewX` - Horizontal skew
5. `rotateX` - X-axis rotation
6. `rotateY` - Y-axis rotation
7. `scale(masterScale)` - Overall size

### Child Transform

**File:** `components/Tablet.tsx` (Lines 115-125)

```typescript
<div
  style={{
    left,
    top,
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    transform: `perspective(1200px)
                rotateY(${rotateYChart}deg)
                rotateX(${rotateXChart}deg)
                skewX(${skewXChart}deg)
                skewY(${skewYChart}deg)
                scale(${scaleChart})`,
  }}
>
  <Productivity />
</div>
```

**Key Difference:**

- `perspective(1200px)` - Creates 3D depth
- Transforms are **opposite** of parent
- Keeps content aligned and readable

---

## Entrance Animation

### Spring Animation

**File:** `components/Tablet.tsx` (Lines 25-38)

```typescript
const toFullscreenFull =
  spring({
    fps,
    frame,
    config: {
      damping: 200,
      mass: 0.5,
    },
    delay: TABLET_SCENE_ENTER_ANIMATION_DELAY,
    durationInFrames: TABLET_SCENE_ENTER_ANIMATION,
  }) -
  spring({
    fps,
    frame,
    delay: TABLET_SCENE_LENGTH,
    config: {
      damping: 200,
      mass: 0.5,
    },
  });
```

**Two-Spring Pattern:**

```
Spring 1: Enter animation (0 → 1)
    ↓
    Delay: 30 frames
    Duration: 16 frames
    ↓
Spring 2: Exit animation (1 → 0)
    ↓
    Delay: 150 frames
    Subtracts from Spring 1
```

**Timeline:**

```
Frame 0-30:   toFullscreenFull = 0 (tablet offscreen)
Frame 30-46:  toFullscreenFull = 0→1 (sliding up)
Frame 46-150: toFullscreenFull = 1 (fully visible)
Frame 150-195: toFullscreenFull = 1→0 (sliding down)
Frame 195+:   toFullscreenFull = 0 (offscreen)
```

### Entrance Transform

**File:** `components/Tablet.tsx` (Lines 88-92)

```typescript
<AbsoluteFill
  style={{
    transform: `translateY(${800 - enterProgress * 800}px)`,
  }}
>
```

**Math:**

```
enterProgress = 0   → translateY(800px)   → Offscreen below
enterProgress = 0.5 → translateY(400px)   → Halfway up
enterProgress = 1   → translateY(0px)     → Fully visible
```

**Why 800px?**

- Viewport height consideration
- Ensures tablet completely hidden initially
- Smooth slide from bottom to center

---

## Productivity Graph

**File:** `components/Productivity.tsx` (Lines 1-150)

### Bar Component

**File:** `components/Productivity.tsx` (Lines 24-50)

```typescript
const Bar = (props: {
  readonly productivity: number;
  readonly index: number;
  readonly mostProductive: boolean;
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const height = spring({
    fps,
    frame,
    from: 0,
    to: 100,
    config: {
      mass: props.productivity * 10 + 0.1,
      damping: 200,
    },
    delay: 30 + props.index * 2,
  });

  return (
    <div style={{ width: 30, height: `${height}%` }}>
      <div
        style={{
          height: `${props.productivity * 100}%`,
          backgroundColor: props.mostProductive
            ? PANE_BACKGROUND
            : "#181B28",
          border: "3px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
};
```

**Spring Configuration:**

```typescript
mass: props.productivity * 10 + 0.1;
```

**Mass Effect:**

```
Low productivity (0.1):  mass = 1.1   → Fast animation (bouncy)
Med productivity (0.5):  mass = 5.1   → Medium speed
High productivity (1.0): mass = 10.1  → Slow animation (heavy)
```

Higher bars take longer to "grow" - simulates weight!

### Staggered Animation

```typescript
delay: 30 + props.index * 2;
```

**Timeline:**

```
Bar 0 (time=0):   starts at frame 30
Bar 1 (time=1):   starts at frame 32
Bar 2 (time=2):   starts at frame 34
...
Bar 23 (time=23): starts at frame 76
```

Creates wave effect from left to right!

### Color Highlighting

```typescript
backgroundColor: props.mostProductive
  ? PANE_BACKGROUND   // Highlighted color
  : "#181B28",        // Normal color
```

**Logic:**

```typescript
const maxProductivity = Math.max(
  ...productivityPerHour.map((p) => p.productivity),
);
mostProductive: productivityPerHour.productivity === maxProductivity &&
  maxProductivity > 0;
```

Most productive hour gets special color!

---

## Top Day Wheels

### TopDay Component

**File:** `components/TopDay.tsx` (Lines 1-80)

**Purpose:** Container for 3D rotating wheel with label

**Structure:**

```
┌────────────────────────────────────────┐
│  Most productive day                   │  ← Label
│                        ╭───────╮       │
│                        │ Tues  │       │  ← Visible value
│                        │ Wed   │       │  ← Rotating wheel
│                        │ Thurs │       │
│                        ╰───────╯       │
└────────────────────────────────────────┘
```

### Mask Gradient

**File:** `components/TopDay.tsx` (Lines 37-38)

```typescript
const maskImage = `linear-gradient(
  to bottom, 
  transparent 0%, 
  rgba(0, 0, 0, 1) 30%, 
  rgba(0, 0, 0, 1) 70%, 
  transparent 100%
)`;
```

**Effect:**

```
Top:    ░░░░░░░░  ← Transparent (faded)
        ████████  ← Opaque (visible)
Center: ████████  ← Opaque (visible) ← Selected value here
        ████████  ← Opaque (visible)
Bottom: ░░░░░░░░  ← Transparent (faded)
```

Creates focus on center value, fades out edges!

---

## Code Deep Dive

### Transform Interpolation

**File:** `components/Tablet.tsx` (Lines 45-60)

```typescript
const toFullscreen = 0.68 * toFullscreenFull;

const rotateYChart = interpolate(toFullscreen, [0, 1], [SCREEN_ROTATION_Y, 0]);
const rotateYParent = interpolate(
  toFullscreen,
  [0, 1],
  [0, -SCREEN_ROTATION_Y],
);
```

**Why multiply by 0.68?**

- Dampens the zoom effect
- toFullscreenFull goes 0→1
- toFullscreen goes 0→0.68
- Creates subtle "lean forward" rather than full face-on

**Opposing Transforms:**

```
toFullscreen = 0:
  rotateYChart = 15°   (content rotated right)
  rotateYParent = 0°   (frame normal)
  → Net: 3D tablet view from slight angle

toFullscreen = 1:
  rotateYChart = 0°    (content normal)
  rotateYParent = -15° (frame rotated left)
  → Net: Content stays readable, frame compensates
```

### Scale Compensation

**File:** `components/Tablet.tsx` (Lines 64-69)

```typescript
const scaleChart = interpolate(toFullscreen, [0, 1], [0.5 * 0.8, 1]);
const scaleParent = interpolate(
  toFullscreen,
  [0, 1],
  [1, (1 / (1 - 0.8 * 0.5)) * 1.3],
);
```

**Math Explanation:**

At toFullscreen = 0:

```
scaleChart = 0.4 (40% size)
scaleParent = 1 (100% size)
→ Content appears small inside normal frame
```

At toFullscreen = 1:

```
scaleChart = 1 (100% size)
scaleParent = 2.167 (217% size)
→ Content grows, frame grows even more
→ Creates "zoom to fill screen" effect
```

**Why this formula?**

```typescript
1 / (1 - 0.8 * 0.5) * 1.3
= 1 / 0.6 * 1.3
= 1.667 * 1.3
= 2.167
```

Compensates for child scale reduction while adding extra zoom!

### Position Interpolation

**File:** `components/Tablet.tsx` (Lines 71-74)

```typescript
const translateX = interpolate(toFullscreen, [0, 1], [0, -500]);
const translateY = interpolate(toFullscreen, [0, 1], [0, 250]);
```

**Movement:**

```
toFullscreen = 0:  (0, 0)      → Centered position
toFullscreen = 0.5: (-250, 125) → Moving left and down
toFullscreen = 1:  (-500, 250)  → Far left and down
```

**Purpose:**

- Shifts tablet to preferred viewing position
- Coordinates with scale for cinematic effect
- Creates dynamic, not-static presentation

---

## Transform Math Explained

### Skew Transform

```typescript
skewX(7deg)
```

**Visual Effect:**

```
Before:          After skewX(7°):
┌────┐           ╱────╲
│    │          ╱      ╲
│    │         │        │
└────┘         ╲        ╱
                ╲────╱
```

Creates parallelogram shape - adds depth!

### Rotation Transform

```typescript
rotateY(15deg)
```

**Visual Effect (Top View):**

```
Before:          After rotateY(15°):
┌────┐               ╱────╲
│    │              ╱      ╲
│    │             │        │
└────┘             │        │
                   ╲        ╱
                    ╲────╱
```

Rotates around Y-axis - creates 3D depth!

### Combined Transform Example

```typescript
transform: `perspective(1200px) rotateY(15deg) rotateX(-10deg) skewX(7deg)`;
```

**Visual Result:**

```
    Before                  After Combined
    ┌────┐                    ╱───╲
    │    │                   ╱     ╲
    │    │                  │       │
    │    │                   ╲     ╱
    └────┘                    ╲──╱
                               ↖
                        3D perspective!
```

---

## Timing Coordination

### Constants

**File:** `components/Tablet.tsx` (Lines 14-17)

```typescript
export const TABLET_SCENE_LENGTH = 150; // Main display time
export const TABLET_SCENE_HIDE_ANIMATION = 45; // Exit duration
export const TABLET_SCENE_ENTER_ANIMATION = 16; // Enter duration
export const TABLET_SCENE_ENTER_ANIMATION_DELAY = 30; // Delay before enter
```

### Timeline Breakdown

```
Frame 0-30:   Waiting offscreen
              enterProgress = 0

Frame 30-46:  Entering (16 frames)
              enterProgress = 0 → 1
              Spring animation

Frame 46-150: Fully visible (104 frames)
              enterProgress = 1
              Content animations playing
              - Bars growing
              - Wheels spinning

Frame 150-195: Exiting (45 frames)
              enterProgress = 1 → 0
              Spring animation (reverse)

Frame 195+:   Offscreen
              enterProgress = 0
```

### Synchronization with Parent

**File:** `StarsAndProductivityReplica.tsx` (Lines 220-230)

```typescript
{showTabletPhase && (
  <Sequence from={timeUntilTabletHides}>
    <Tablet
      enterProgress={tabletEnterProgress}
      graphData={mockData.productivity}
      weekday={mockData.topProductiveDay}
      hour={String(mockData.topProductiveHour)}
    />
  </Sequence>
)}
```

Tablet sequence starts exactly when stars phase should hide!

---

## Visual Polish

### 1. Perspective Property

```typescript
perspective(1200px)
```

**Effect:**

- Creates vanishing point
- Closer elements larger
- Further elements smaller
- More realistic 3D

**Comparison:**

```
No perspective:           With perspective:
┌─────┐                      ╱───╲
│     │                     ╱     ╲
│     │                    │       │
└─────┘                     ╲     ╱
                             ╲──╱
Flat, unrealistic         Depth, realistic!
```

### 2. Transform Origin

```typescript
transformOrigin: "left bottom";
```

**Effect:**

- Transforms pivot from bottom-left corner
- Creates realistic "hinge" behavior
- Tablet appears to "unfold" from bottom

**Comparison:**

```
Origin: center           Origin: left bottom
    ↓                          ↓
  ┌─┴─┐                      ┌───┐
  │   │                      │   │
  └───┘                      └───┘
    ↑                          ↑
Rotates here          Rotates from here
```

### 3. Audio Integration

**File:** `components/Productivity.tsx` (Lines 125-126)

```typescript
{isMobileDevice() ? null : <Audio src={DECELERATE_SOUND} volume={0.8} />}
```

**Purpose:**

- "Whoosh" sound effect on entrance
- Enhances feeling of tablet sliding in
- Desktop only (mobile compatibility)

---

## Experimentation Guide

### Change Entrance Speed

**File:** `components/Tablet.tsx` (Lines 25-38)

```typescript
// Current: damping: 200, mass: 0.5
config: { damping: 200, mass: 0.5 }

// Try: Bouncy entrance
config: { damping: 50, mass: 0.3 }

// Try: Slow, heavy entrance
config: { damping: 300, mass: 2 }
```

### Adjust 3D Rotation

**File:** `components/Tablet.tsx` (Lines 40-43)

```typescript
// Current: 15° and -10°
const SCREEN_ROTATION_Y = 15;
const SCREEN_ROTATION_X = -10;

// Try: More dramatic angle
const SCREEN_ROTATION_Y = 30;
const SCREEN_ROTATION_X = -20;

// Try: Subtle angle
const SCREEN_ROTATION_Y = 5;
const SCREEN_ROTATION_X = -3;
```

### Modify Bar Animation Stagger

**File:** `components/Productivity.tsx` (Line 35)

```typescript
// Current: 2 frames between bars
delay: 30 + props.index * 2,

// Try: Faster wave
delay: 30 + props.index * 1,

// Try: Slower wave
delay: 30 + props.index * 5,

// Try: All at once
delay: 30,
```

### Change Zoom Amount

**File:** `components/Tablet.tsx` (Line 40)

```typescript
// Current: 68% zoom
const toFullscreen = 0.68 * toFullscreenFull;

// Try: Stronger zoom
const toFullscreen = 0.9 * toFullscreenFull;

// Try: No zoom (stays 3D)
const toFullscreen = 0 * toFullscreenFull;
```

---

## Key Takeaways

### 3D Transform Techniques

1. **Opposing Transforms** - Parent and child rotate opposite directions
2. **Perspective** - Creates realistic 3D depth
3. **Transform Origin** - Controls pivot point for rotations
4. **Scale Compensation** - Adjust parent scale when child scaled
5. **Skew + Rotate** - Combine for interesting 3D effects

### Animation Patterns

1. **Two-Spring Pattern** - Enter and exit with subtraction
2. **Staggered Delays** - Create wave/cascade effects
3. **Mass-Based Springs** - Heavier elements move slower
4. **Interpolation** - Smooth transitions between states
5. **Transform Ordering** - Order matters for desired effect

### Data Visualization

1. **Normalized Heights** - Scale to max value for comparison
2. **Color Highlighting** - Draw attention to important data
3. **Progressive Reveal** - Stagger animations for impact
4. **Responsive Sizing** - Adapt to data ranges
5. **Audio Enhancement** - Sound effects increase engagement

---

## Next Steps

**Continue Learning:**

**→ [05-WHEEL-COMPONENT.md](./05-WHEEL-COMPONENT.md)** - Deep dive into 3D rotating wheels

**← [03-COCKPIT-SPACESHIP.md](./03-COCKPIT-SPACESHIP.md)** - Review HUD and shake systems

**← [02-STARS-ANIMATION.md](./02-STARS-ANIMATION.md)** - Review star animation mechanics

**← [00-SCENE-OVERVIEW.md](./00-SCENE-OVERVIEW.md)** - See overall architecture

---

**Happy Learning!** 🚀✨

The tablet scene demonstrates advanced 3D CSS transforms and how to create compelling data visualizations with physics-based animations!
