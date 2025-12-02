# StarsAndProductivity Scene - Learning Guide

## 🎯 Purpose

This guide walks you through the complete StarsAndProductivity scene implementation. Read the files in order to understand how everything connects.

---

## 📚 Reading Order & Key Concepts

### **LEVEL 1: Foundation Components (Start Here)**

#### 1. `remotion/productivity/constants.ts`

**What to learn:**

- TypeScript interfaces for type safety
- Mock data structure for testing
- Exporting constants for reusability

**Key concepts:**

```typescript
export interface ProductivityDataPoint {
  time: number; // Hour of day (0-23)
  productivity: number; // Activity level
}
```

**Questions to ask yourself:**

- Why use an interface instead of just an array?
- How does mock data help during development?

---

#### 2. `remotion/productivity/TabletSVG.tsx`

**What to learn:**

- Remotion's `staticFile()` for asset loading
- Component props with optional styling
- Exporting constants for theme consistency

**Key concepts:**

```typescript
export const HANDS_ASSET = staticFile("hands.png");
```

**Questions to ask yourself:**

- Why use staticFile() instead of a regular img src?
- How does optional styling (style?) make components reusable?

---

### **LEVEL 2: Animation Fundamentals**

#### 3. `remotion/productivity/Productivity.tsx` (Bar Component)

**What to learn:**

- Frame-based animation timing
- GSAP easing functions in Remotion
- Staggered animation delays
- Progress calculation (0 to 1 mapping)

**Key concepts:**

```typescript
const DELAY_FRAMES = 30 + props.index * 2; // Stagger effect
const progress = framesSinceStart / DURATION_FRAMES; // 0→1
const easedProgress = gsap.parseEase("power2.out")(progress);
```

**Animation formula:**

1. Calculate when animation should start (delay)
2. Calculate how far through animation we are (progress)
3. Apply easing for smooth motion
4. Map to final value (height)

**Questions to ask yourself:**

- Why multiply index by 2 for stagger?
- What's the difference between linear progress and eased progress?
- Why use Math.max and Math.min for clamping?

---

#### 4. `remotion/productivity/Wheel.tsx`

**What to learn:**

- 3D CSS transforms (rotateX, translateZ, translateY)
- Perspective and backface-visibility
- Trigonometry for circular positioning
- Conditional styling based on state

**Key concepts:**

```typescript
// Circular math
const angle = normalizedIndex * -Math.PI * 2;
const zPosition = Math.cos(angle) * radius; // Depth
const yPosition = Math.sin(angle) * radius; // Height
```

**Transform order matters:**

```typescript
transform: `translateZ(${z}px) translateY(${y}px) rotateX(${angle}rad)`;
```

**Questions to ask yourself:**

- Why does transform order matter?
- How does Math.cos/sin create circular motion?
- Why counter-rotate the text (rotateX(-angle))?
- What does backfaceVisibility: "hidden" do?

---

#### 5. `remotion/productivity/TopDay.tsx`

**What to learn:**

- Component composition (wrapping children)
- CSS masking with gradients
- Absolute positioning and layering
- Props forwarding pattern

**Key concepts:**

```typescript
const maskImage = `linear-gradient(to bottom, 
  transparent 0%, 
  rgba(0,0,0,1) 30%, 
  rgba(0,0,0,1) 70%, 
  transparent 100%)`;
```

**Questions to ask yourself:**

- Why use a gradient mask instead of overflow?
- How does absolute positioning create layers?
- Why forward props to child components?

---

### **LEVEL 3: Complex 3D Transforms**

#### 6. `remotion/productivity/Tablet.tsx`

**What to learn:**

- Multi-stage animation timing (entry + exit)
- Complex 3D transform combinations
- Transform origin and perspective
- Parent-child transform coordination

**Key concepts:**

```typescript
// Dual animation: entry - exit
const entryProgress = ease(clamp01(entryRaw));
const exitProgress = ease(clamp01(exitRaw));
const toFullscreen = 0.68 * (entryProgress - exitProgress);
```

**Transform relationships:**

```typescript
// Chart rotates one way
const rotateYChart = (1 - toFullscreen) * SCREEN_ROTATION_Y;
// Parent counter-rotates
const rotateYParent = -(1 - toFullscreen) * SCREEN_ROTATION_Y;
```

**Questions to ask yourself:**

- Why subtract exit from entry?
- Why do parent and chart have opposite rotations?
- What does the 0.68 multiplier control?
- How does transformOrigin affect the pivot point?

---

### **LEVEL 4: Scene Integration**

#### 7. `remotion/stars-given/index.tsx`

**What to learn:**

- Remotion's interpolate() function
- Fade in/out animations
- extrapolateLeft/Right clamping
- Scale + opacity combinations

**Key concepts:**

```typescript
const backgroundOpacity = interpolate(
  frame,
  [0, 10], // Input range
  [0, 1], // Output range
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
```

**Questions to ask yourself:**

- What does extrapolate "clamp" do?
- Why combine scale + opacity for smoother animation?
- How is this different from GSAP easing?

---

#### 8. `remotion/stars-and-productivity/index.tsx` (MAIN ORCHESTRATOR)

**What to learn:**

- Sequence composition and timing
- Scene transitions with shared state
- Dynamic duration calculation
- useMemo for performance
- Conditional rendering based on frame

**Key concepts:**

```typescript
// Scene visibility logic
{frame < timeUntilTabletIsEntered || frame > timeUntilTabletHides ? (
  <StarsGiven />
) : null}

// Timed sequence
<Sequence from={starFlyDuration} durationInFrames={TABLET_SCENE_LENGTH}>
  <Tablet />
</Sequence>
```

**Transition effect:**

```typescript
const zoomTransition = entryProgress - exitProgress;
const translateX = zoomTransition * 270;
const scale = 1 + zoomTransition * 0.5;
```

**Questions to ask yourself:**

- How does Sequence control timing?
- Why hide StarsGiven during tablet display?
- How do transforms create smooth transitions?
- What does useMemo optimize?

---

#### 9. `remotion/Root.tsx`

**What to learn:**

- Composition registration
- Default props pattern
- Dynamic duration calculation
- Folder organization

**Key concepts:**

```typescript
<Composition
  id="StarsAndProductivity"
  component={StarsAndProductivity}
  durationInFrames={getStarsAndProductivityDuration({ starsGiven: 42 })}
  defaultProps={{ ... }}
/>
```

**Questions to ask yourself:**

- Why calculate duration dynamically?
- How do defaultProps work with TypeScript?
- Why separate compositions into folders?

---

## 🔗 Component Connection Flow

```
Root.tsx (registers composition)
    ↓
stars-and-productivity/index.tsx (orchestrator)
    ↓
    ├─→ stars-given/index.tsx (scene 1)
    │       └─→ Gradient + Text Animation
    │
    └─→ productivity/Tablet.tsx (scene 2)
            ├─→ TabletSVG.tsx (frame image)
            └─→ Productivity.tsx (content)
                    ├─→ TopDay.tsx (weekday wheel)
                    │       └─→ Wheel.tsx (3D rotation)
                    ├─→ TopDay.tsx (hour wheel)
                    │       └─→ Wheel.tsx (3D rotation)
                    └─→ ProductivityGraph (bar chart)
                            └─→ Bar component (animated bars)
```

---

## 🎓 Core Concepts Summary

### **Animation Techniques**

1. **Frame-based timing**: `const progress = (frame - delay) / duration`
2. **Easing**: `gsap.parseEase("power2.out")(progress)`
3. **Interpolation**: `interpolate(frame, [0, 100], [0, 1])`
4. **Clamping**: `Math.max(0, Math.min(1, value))`
5. **Staggering**: `delay = baseDelay + index * increment`

### **3D Transforms**

1. **Perspective**: Creates depth illusion
2. **Transform order**: Right to left execution
3. **Counter-rotation**: Parent/child opposite transforms
4. **Backface visibility**: Hide when facing away
5. **Transform origin**: Rotation pivot point

### **Remotion Patterns**

1. **useCurrentFrame()**: Get current frame number
2. **useVideoConfig()**: Get fps, width, height
3. **Sequence**: Time-based scene composition
4. **AbsoluteFill**: Full-screen container
5. **useMemo**: Cache expensive calculations

### **Component Design**

1. **Props**: Type-safe data passing
2. **Composition**: Build complex from simple
3. **Reusability**: Generic + configurable
4. **Separation**: Logic vs presentation
5. **Defaults**: Fallback values

---

## ✅ Learning Checkpoints

After reading each file, you should be able to answer:

**Constants:**

- [ ] Why separate data from logic?

**TabletSVG:**

- [ ] How does staticFile() work?

**Productivity/Bar:**

- [ ] How is frame progress calculated?
- [ ] What does easing do?
- [ ] Why stagger animations?

**Wheel:**

- [ ] How does circular math work?
- [ ] What creates the 3D effect?
- [ ] Why hide backfaces?

**TopDay:**

- [ ] How does CSS masking work?
- [ ] Why absolute positioning?

**Tablet:**

- [ ] How do entry/exit combine?
- [ ] Why counter-rotate parent/child?
- [ ] What's the transform pipeline?

**StarsGiven:**

- [ ] How does interpolate() differ from manual progress?
- [ ] When to use extrapolate clamping?

**Orchestrator:**

- [ ] How does Sequence timing work?
- [ ] Why conditional rendering?
- [ ] How do transitions connect scenes?

**Root:**

- [ ] How are compositions registered?
- [ ] Why dynamic durations?

---

## 🚀 Next Steps

1. **Read files in order** (top to bottom)
2. **Test in Remotion Studio** - see animations live
3. **Modify values** - change delays, durations, colors
4. **Experiment** - try different easing functions
5. **Build your own** - create a custom scene with these patterns

---

## 💡 Pro Tips

- **Open Remotion Studio** while reading to see code in action
- **Change one value at a time** to understand its effect
- **Use browser DevTools** to inspect transforms
- **Log values** to console to see animation progress
- **Compare with GitHub Unwrapped** source for advanced features

---

## 🎬 Testing Your Scene

Run Remotion Studio:

```bash
npm run remotion
```

Then:

1. Find "StarsAndProductivity" in the sidebar
2. Click Play to see the full animation
3. Scrub the timeline to see frame-by-frame
4. Change props in Root.tsx to test different data

---

**Happy Learning! 🎉**

Remember: Understanding beats memorization. Focus on WHY things work, not just WHAT they do.
