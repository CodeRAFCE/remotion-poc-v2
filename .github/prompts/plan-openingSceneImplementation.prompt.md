# Plan: Opening Scene Implementation with Audio Sync

This plan recreates the Opening scene from github-unwrapped with its sophisticated audio synchronization, multi-layer animations, and cinematic effects.

## Steps

1. **Gather and organize assets** - Create folder structure in [public/](public/) for rocket images (blue/orange/yellow), exhaust flame videos (HEVC/VP9 variants), audio files (rocket-launch.mp3, first-whoosh.mp3), foreground.png, background-mountains.png, and highlight PNGs (WhiteHighlight.png, PinkHighlight.png)

2. **Build core animation components** - Create [remotion/Opening/index.tsx](remotion/Opening/index.tsx) with `OpeningScene` wrapper (handles exit zoom) and `OpeningSceneFull` (orchestrates all layers), implement frame-based timing constants (OPENING_SCENE_LENGTH=130, overlap=10), and set up `AbsoluteFill` layer system (gradient background → noise → title → mountains → foreground → rocket)

3. **Implement audio synchronization system** - Add `<Audio>` components in [OpeningSceneFull](remotion/Opening/index.tsx) with `rocket-launch.mp3` starting at frame -20 (plays from scene start) and `first-whoosh.mp3` at frame 70 (transition effect), use device detection to disable audio on mobile, and sync audio timing with visual animations using frame markers

4. **Create title card with avatar** - Build [remotion/Opening/Title.tsx](remotion/Opening/Title.tsx) and [TitleImage.tsx](remotion/Opening/TitleImage.tsx) with spring animation entrance (frames 0-50), GitHub avatar flip animation using `rotateY()` transform, `PaneEffect` component with layered PNG highlights (white always visible, pink fades in), and gradient text style for username display

5. **Build rocket takeoff animation** - Create [remotion/Opening/TakeOff.tsx](remotion/Opening/TakeOff.tsx) with `OffthreadVideo` for exhaust flames (browser-specific codec selection), rocket position translation with custom acceleration curve via `remapSpeed()` function, Perlin noise-based camera shake (`noise2D` for X/Y offset), and coordinate rocket movement with audio peaks

6. **Implement dramatic exit zoom effect** - Add inverse scale calculation in `OpeningScene` wrapper (frames 110-130): `distance = interpolate(exitProgress, [0,1], [1, 0.000005])` then `scale = 1/distance`, create "flying away" effect with derived translateX/translateY from scale, fade out foreground/background layers, and overlap next scene by 10 frames for smooth transition

## Further Considerations

1. **Asset optimization** - Should we use WebM+HEVC for broad browser support, or simplify to MP4 only? Recommend dual format for production, single format for POC
2. **Audio licensing** - Need custom rocket sounds or use github-unwrapped assets? Consider sourcing royalty-free alternatives or generating with audio tools
3. **Mobile performance** - Follow github-unwrapped pattern of disabling audio/video on mobile devices? This significantly reduces bundle size and improves rendering speed
