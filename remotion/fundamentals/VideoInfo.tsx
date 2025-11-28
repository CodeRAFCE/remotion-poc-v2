import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const VideoInfo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // TODO: Calculate current time in MM:SS format
  // TODO: Calculate progress percentage
  // TODO: Build the component with all 5 requirements

  const currentTime = Math.floor(frame / fps);
  const minutes = Math.floor(currentTime / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (currentTime % 60).toString().padStart(2, "0");

  const progressPercentage = ((frame / durationInFrames) * 100).toFixed(2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B1120",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ color: "#fff", fontSize: "32px" }}>
        Current Time: {minutes}:{seconds}
      </div>
      <div style={{ color: "#fff", fontSize: "24px", marginTop: "20px" }}>
        Progress: {progressPercentage}%
      </div>
      <div style={{ color: "#fff", fontSize: "24px", marginTop: "20px" }}>
        Width: {width}px
      </div>
      <div style={{ color: "#fff", fontSize: "24px", marginTop: "10px" }}>
        Height: {height}px
      </div>

      <div style={{ color: "#fff", fontSize: "24px", marginTop: "10px" }}>
        {" "}
        total frames: {durationInFrames}
        fps: {fps}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          marginTop: "40px",
          width: "400px",
          height: "20px",
          backgroundColor: "#333",
          borderRadius: "10px",
          overflow: "hidden",
          border: "2px solid #fff",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercentage}%`,
            backgroundColor: "#4CAF50",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
