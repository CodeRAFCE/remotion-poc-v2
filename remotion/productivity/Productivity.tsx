import type { ProductivityDataPoint } from "./constants";

import gsap from "gsap";
import { useCurrentFrame } from "remotion";

const Bar = (props: {
  productivity: number;
  index: number;
  mostProductive: boolean;
}) => {
  const frame = useCurrentFrame();

  const DELAY_FRAMES = 30 + props.index * 2; // Stagger: 30 frames + 2 per index
  const DURATION_FRAMES = 60; // Animation duration

  const framesSinceStart = Math.max(0, frame - DELAY_FRAMES);
  const progress = Math.max(0, Math.min(1, framesSinceStart / DURATION_FRAMES));

  const easedProgress = gsap.parseEase("power2.out")(progress);
  const height = easedProgress * 100;

  return (
    <div
      style={{
        width: 30,
        height: `${height}%`,
        display: "flex",
        alignItems: "flex-end",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          width: "100%",
          height: `${props.productivity * 100}%`,
          borderRadius: 4,
          backgroundColor: props.mostProductive ? "#FF6B9D" : "#181B28",
          border: "3px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
};

const ProductivityGraph = (props: {
  productivityPerHour: Array<ProductivityDataPoint>;
  style?: React.CSSProperties;
}) => {
  const maxProductivity = Math.max(
    ...props.productivityPerHour.map((p) => p.productivity),
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 10,
        height: 480,
        ...props.style,
      }}
    >
      {props.productivityPerHour.map((point) => (
        <div
          key={point.time}
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Bar
            index={point.time}
            productivity={point.productivity / maxProductivity}
            mostProductive={
              point.productivity === maxProductivity && maxProductivity > 0
            }
          />
          <div
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "Mona Sans",
            }}
          >
            {point.time}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Productivity component - displays the graph inside the tablet
import { AbsoluteFill } from "remotion";
import { TopDay } from "./TopDay";

interface ProductivityProps {
  graphData: ProductivityDataPoint[];
  weekday: string;
  hour: string;
}

/**
 * PRODUCTIVITY COMPONENT
 *
 * Purpose: Main component that displays:
 * 1. Two TopDay wheels (weekday and hour)
 * 2. The productivity bar graph
 *
 * Layout: Vertically stacked with spacing
 */
export const Productivity: React.FC<ProductivityProps> = ({
  graphData,
  weekday,
  hour,
}) => {
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Most productive day wheel */}
      <TopDay
        values={[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ]}
        label="Most productive day"
        value={weekday}
        radius={130}
        renderLabel={(value) => value}
        delay={60}
        soundDelay={95}
      />

      {/* Most productive hour wheel */}
      <TopDay
        values={[
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
          "19",
          "20",
          "21",
          "22",
          "23",
        ]}
        label="Most productive time"
        value={hour}
        radius={300}
        delay={70}
        renderLabel={(value) => {
          // Format hour as 12-hour time with AM/PM
          if (value === "12") return "12 pm";
          if (value === "0") return "12 am";
          if (Number(value) > 12) return `${Number(value) - 12} pm`;
          return `${value} am`;
        }}
        soundDelay={120}
      />

      {/* Productivity bar graph */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProductivityGraph productivityPerHour={graphData} />
      </div>
    </AbsoluteFill>
  );
};
