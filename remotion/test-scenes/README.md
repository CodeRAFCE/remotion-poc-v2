# Stars and Productivity Scene Replica

This directory contains a replica of the "StarsGiven" and "StarsAndProductivity" scenes from GitHub Unwrapped, adapted to use mock data and spring animations.

## 📚 Complete Documentation Available!

**All components and concepts are fully documented!** 🎉

For comprehensive learning materials, see:

### **📖 [documents/](./documents/)** - Complete Documentation Package

- **[README.md](./documents/README.md)** - Documentation index and learning path
- **[COMPLETE-SUMMARY.md](./documents/COMPLETE-SUMMARY.md)** - Overview of all documentation
- **[00-SCENE-OVERVIEW.md](./documents/00-SCENE-OVERVIEW.md)** - Scene architecture and timing
- **[01-BACKGROUND.md](./documents/01-BACKGROUND.md)** - Gradient and noise systems
- **[02-STARS-ANIMATION.md](./documents/02-STARS-ANIMATION.md)** - Star trajectories and hit detection
- **[03-COCKPIT-SPACESHIP.md](./documents/03-COCKPIT-SPACESHIP.md)** - HUD and zoom transitions
- **[04-TABLET-SCENE.md](./documents/04-TABLET-SCENE.md)** - 3D transforms and data visualization
- **[05-WHEEL-COMPONENT.md](./documents/05-WHEEL-COMPONENT.md)** - 3D circular positioning

**Each document includes:**

- ✅ Detailed explanations with code line references
- ✅ Visual diagrams and ASCII art
- ✅ Math formulas broken down step-by-step
- ✅ Experimentation suggestions
- ✅ Performance optimization tips

---

## Structure

The main entry point is `StarsAndProductivityReplica.tsx`. This component orchestrates the entire scene, which consists of two main parts:

1.  **StarsGiven Phase**: Shows a cockpit view with stars flying by.
2.  **Productivity Phase**: A tablet pops up showing productivity stats (graph, top day, top time).

## Components

All related components are located in the `components/` subdirectory.

### Main Components

- **`StarsAndProductivityReplica.tsx`**: The composition root. It calculates the timing for the stars animation and the tablet entry/exit. It uses `spring` animations for the tablet transition.
- **`components/StarsGiven.tsx`**: Renders the background stars, the cockpit, and handles the "flying" effect. It manages the camera shake and star burst animations.
- **`components/Tablet.tsx`**: The tablet component that slides in. It contains the productivity graph and top stats.
- **`components/Productivity.tsx`**: Renders the content inside the tablet, including the bar chart and the "Top Day/Time" wheels.

### Sub-Components

- **`components/Cockpit.tsx`** & **`components/AnimatedCockpit.tsx`**: The spaceship cockpit overlay. `AnimatedCockpit` handles the shake and scale animations.
- **`components/Star.tsx`**: Individual star component. It handles the movement, scaling, and the "hit" effect when a star hits the windshield. It plays the `glockenspiel-3.mp3` sound on impact.
- **`components/StarsFlying.tsx`**: Manages the array of stars and their timing.
- **`components/Wheel.tsx`**: The spinning wheel component used for "Top Day" and "Top Time" displays. It plays `stop.mp3` when it stops.
- **`components/TopDay.tsx`**: Wrapper for the `Wheel` component with styling.
- **`components/SevenSegmentNumber.tsx`**: Digital display for the star count in the cockpit.

## Data Flow

1.  **Mock Data**: Defined in `components/MockData.ts`. This replaces the real GitHub API data.
2.  **Replica Component**: `StarsAndProductivityReplica` reads the mock data and passes it down to `StarsGiven` and `Tablet`.
3.  **StarsGiven**: Uses `starsGiven` count to calculate how many stars to spawn and the duration of the flight.
4.  **Tablet**: Receives `graphData`, `weekday`, and `hour` to display on the screen.

## Audio

The following audio files are used (copied to `public/`):

- `glockenspiel-3.mp3`: Played when a star hits the cockpit windshield (`Star.tsx`).
- `decelerate.mp3`: Played when the tablet enters/productivity view starts (`Productivity.tsx`).
- `stop.mp3`: Played when the spinning wheels stop (`Wheel.tsx`).

## Animations

- **Springs**: Used extensively for smooth transitions.
  - Tablet entry/exit (`StarsAndProductivityReplica.tsx`, `Tablet.tsx`).
  - Bar chart growth (`Productivity.tsx`).
  - Wheel spinning (`Wheel.tsx`).
  - Cockpit shake (`StarsGiven.tsx`).

## Usage

To preview this scene, ensure you have a `Composition` in your `Root.tsx` pointing to `StarsAndProductivityReplica`.

```tsx
import { StarsAndProductivityReplica } from "./remotion/test-scenes/StarsAndProductivityReplica";

<Composition
  id="StarsAndProductivityReplica"
  component={StarsAndProductivityReplica}
  durationInFrames={450} // Approx duration, calculated dynamically in real app
  fps={30}
  width={1080}
  height={1920}
/>;
```
