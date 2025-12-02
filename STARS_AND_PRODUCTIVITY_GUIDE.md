# 📊 StarsAndProductivity Scene - Analysis & Build Guide

## 🎬 Scene Overview

**What it shows:**

- Stars given animation (flying stars)
- Productivity stats (productivity graph, top weekday/hour)
- Tablet view with stats
- Pull requests info
- Smooth transitions between elements

**Duration:** Dynamic (based on starsGiven count)

---

## 🏗️ Architecture Breakdown

### Component Structure:

```
StarsAndProductivity (Main)
├── StarsGiven (Sub-component)
│   ├── Flying stars animation
│   ├── Stats display
│   └── Cockpit view
└── Tablet (Sub-component)
    ├── Enter animation
    ├── Graph visualization
    ├── Stats display (weekday, hour)
    └── Exit animation
```

### Data Flow:

```
JSON Input:
{
  "starsGiven": 42,
  "topWeekday": "Friday",
  "topHour": 14,
  "graphData": [...],
  "totalPullRequests": 15,
  "sampleStarredRepos": [...]
}
        ↓
StarsAndProductivity receives props
        ↓
Renders StarsGiven (animation 1)
        ↓
Renders Tablet (animation 2)
        ↓
Video output
```

---

## 🔢 Key Variables & Timing

```
starFlyDuration = calculated from starsGiven (each star takes time)
TABLET_ENTER_DURATION = 45 frames
TABLET_SCENE_LENGTH = fixed length for tablet display
TABLET_SCENE_HIDE_ANIMATION = animation when hiding tablet
TABLET_SCENE_ENTER_ANIMATION = animation when entering
TABLET_SCENE_ENTER_ANIMATION_DELAY = delay before animation
```

### Timing Sequence:

```
Frame 0-X: Stars fly (duration = starFlyDuration)
Frame X-Y: Tablet enters (with zoom animation)
Frame Y-Z: Tablet shows (display stats)
Frame Z+: Tablet exits + Pull requests start
```

---

## ✨ Animations Used

1. **Spring Animation (multiple instances)**
   - Enter: Zoom in + translate
   - Exit: Zoom out + translate

2. **Interpolation**
   - translateX: `zoomTransition * 270`
   - translateY: `zoomTransition * -270`
   - scale: `1 + zoomTransition * 0.5`
   - opacity: `1 - zoomTransition * 0.7`

3. **Conditional Rendering**
   - Show StarsGiven OR Tablet based on frame number

---

## 📋 Your Build Tasks

You need to create THESE components from scratch:

### **TASK 1: Create StarsGiven Component**

- Display flying star icons
- Animate stars flying from left/right
- Show "X stars given" text
- Integrate with JSON data

### **TASK 2: Create Tablet Component**

- Show productivity stats
- Display graph visualization
- Show top weekday/hour
- Create enter/exit animations

### **TASK 3: Create Main StarsAndProductivity Component**

- Orchestrate both components
- Handle timing/sequencing
- Connect Spring animations
- Use JSON data

### **TASK 4: Integrate with Root.tsx**

- Register as Composition
- Test in Studio

---

## 🧮 Animation Math You'll Use

```
Spring Animation:
- Creates smooth, bouncy motion
- Parameters: fps, frame, delay, durationInFrames, config

Interpolation:
- Maps one range to another
- interpolate(progress, [0, 1], [startValue, endValue])

Conditional Rendering:
- Show/hide based on frame number
- if (frame < X || frame > Y) show StarsGiven
- else show Tablet
```

---

## 📊 JSON Data Structure

```json
{
  "starsGiven": 42,
  "topWeekday": "Friday",
  "topHour": 14,
  "graphData": [
    { "date": "2024-01-01", "count": 5 },
    { "date": "2024-01-02", "count": 8 },
    ...
  ],
  "totalPullRequests": 15,
  "sampleStarredRepos": [
    { "name": "repo1", "stars": 100 },
    { "name": "repo2", "stars": 250 },
    ...
  ]
}
```

---

## 🎯 Next Steps

1. **Understand the current GitHub Unwrapped implementation**
2. **Identify what needs to change** (API → JSON)
3. **Plan your component structure**
4. **Build StarsGiven first** (simpler)
5. **Build Tablet second** (more complex)
6. **Connect them together**
7. **Test in Studio**

---

## 🤔 Questions to Answer First

Before you start coding:

**Q1:** What do you think the `spring()` function does?

**Q2:** Why do you think they use BOTH spring and interpolate animations?

**Q3:** Looking at the timing logic, when does StarsGiven show vs Tablet show?

**Q4:** What JSON fields does this scene need?

Answer these, then we'll move to TASK 1! 🚀
