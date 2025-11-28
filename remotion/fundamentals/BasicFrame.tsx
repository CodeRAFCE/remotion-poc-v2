import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * LESSON 1: Understanding useCurrentFrame()
 *
 * Key Concepts:
 * - useCurrentFrame() returns the current frame number (0-indexed)
 * - Frame 0 = start of video
 * - Frame changes every render, creating animation
 * - At 30 FPS: frame 30 = 1 second, frame 60 = 2 seconds
 */
export const BasicFrame: React.FC = () => {
  // Get the current frame number
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B1120",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Display the current frame */}
        <h1
          style={{
            fontSize: 120,
            color: "#fff",
            margin: 0,
            fontWeight: "bold",
          }}
        >
          {frame}
        </h1>

        <p
          style={{
            fontSize: 32,
            color: "#888",
            marginTop: 20,
          }}
        >
          Current Frame
        </p>

        {/* Show what second we're at (assuming 30 FPS) */}
        <p
          style={{
            fontSize: 24,
            color: "#666",
            marginTop: 40,
          }}
        >
          ≈ {(frame / 30).toFixed(2)} seconds at 30 FPS
        </p>

        {/* Fun fact about the frame */}
        <div
          style={{
            marginTop: 60,
            padding: 20,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: 10,
            maxWidth: 600,
          }}
        >
          <p style={{ fontSize: 18, color: "#aaa", margin: 0 }}>
            💡 This number updates every frame!
            <br />
            Watch it count up as the video plays.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
