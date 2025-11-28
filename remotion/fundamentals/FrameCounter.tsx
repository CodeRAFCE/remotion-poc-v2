import { AbsoluteFill, useCurrentFrame } from "remotion";

export const FrameCounter: React.FC = () => {
  const currentFrame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B1120",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "120px", color: "#fff", margin: 0 }}>
          {currentFrame}
        </h1>
        <p style={{ fontSize: "24px", color: "#888", marginTop: "20px" }}>
          Current Frame
        </p>
      </div>
    </AbsoluteFill>
  );
};
