import React, { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

// Schema for validation
export const customOpeningSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
});

type CustomOpeningProps = z.infer<typeof customOpeningSchema>;

// Export constants for use in Main.tsx
export const CUSTOM_OPENING_DURATION = 130;
export const CUSTOM_OPENING_OUT_OVERLAP = 10;

export const CustomOpening: React.FC<CustomOpeningProps> = ({
  name,
  avatarUrl,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Animation timing constants (in frames)
  const ZOOM_IN_DELAY = 10;
  const ZOOM_IN_DURATION = 60;
  const TITLE_DELAY = 50;
  const TITLE_DURATION = 50;
  const EXIT_DELAY = durationInFrames - 20;
  const EXIT_DURATION = 60;

  // Calculate progress for different animation phases
  const zoomInProgress = Math.max(
    0,
    Math.min(1, (frame - ZOOM_IN_DELAY) / ZOOM_IN_DURATION),
  );

  const titleProgress = Math.max(
    0,
    Math.min(1, (frame - TITLE_DELAY) / TITLE_DURATION),
  );

  const exitProgress = Math.max(
    0,
    Math.min(1, (frame - EXIT_DELAY) / EXIT_DURATION),
  );

  // Easing functions
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // Animation values
  const scale = 2.5 - zoomInProgress * 1.5; // 2.5 → 1.0
  const titleY = 100 - titleProgress * 100; // 100 → 0 (falls in from bottom)
  const titleOpacity = easeOutCubic(titleProgress); // Fade in
  const avatarScale = easeOutCubic(titleProgress) * 0.8 + 0.2; // 0.2 → 1.0
  const avatarRotation = titleProgress * 360; // Spins in

  // Exit animation
  const exitScale = 1 + exitProgress * 1.5; // 1.0 → 2.5 (zoom out)
  const exitOpacity = Math.max(0, 1 - exitProgress); // Fade out

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a1628",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, #0a1628 0%, #1a2a42 100%)`,
        }}
      />

      {/* Main container with zoom effect */}
      <AbsoluteFill
        ref={containerRef}
        style={{
          transform: `scale(${scale * exitScale})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            position: "absolute",
            marginBottom: "80px",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "3px solid white",
              backgroundImage: `url(${avatarUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `scale(${avatarScale}) rotate(${avatarRotation}deg)`,
              opacity: titleOpacity,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          />
        </div>

        {/* Title/Name */}
        <div
          ref={titleRef}
          style={{
            textAlign: "center",
            marginTop: "120px",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "white",
              margin: "0",
              transform: `translateY(${titleY}%)`,
              opacity: titleOpacity,
              textShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "2px",
            }}
          >
            {name}
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "#a0a9c9",
              margin: "20px 0 0 0",
              transform: `translateY(${titleY}%)`,
              opacity: titleOpacity,
              fontFamily: "Arial, sans-serif",
            }}
          >
            Year in Review
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default CustomOpening;
