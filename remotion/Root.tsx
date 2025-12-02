import { Composition, Folder } from "remotion";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../types/constants";
// import { OPENING_SCENE_LENGTH, OpeningScene } from "./Opening"; // Commented out - missing dependencies
import { BasicFrame } from "./fundamentals/BasicFrame";
import {
  CUSTOM_OPENING_DURATION,
  CustomOpening,
} from "./fundamentals/CustomOpening";
import { FrameCounter } from "./fundamentals/FrameCounter";
import { VideoInfo } from "./fundamentals/VideoInfo";
import { MOCK_PRODUCTIVITY_DATA } from "./productivity/constants";
import {
  StarsAndProductivity,
  getStarsAndProductivityDuration,
} from "./stars-and-productivity";
import {
  StarsAndProductivityWithAudio,
  getStarsAndProductivityDuration as getStarsAndProductivityWithAudioDuration,
} from "./stars-and-productivity-with-audio";

// Example composition
const HelloWorld: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: "7em",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      Hello World
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />

      {/* OpeningScene - Commented out due to missing dependencies
      <Composition
        id="OpeningScene"
        component={OpeningScene}
        durationInFrames={OPENING_SCENE_LENGTH}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          login: "JonnyBurger",
          startAngle: "left" as const,
          rocket: "blue" as const,
        }}
      />
      */}

      {/* Learning Exercises */}
      <Folder name="Fundamentals">
        <Composition
          id="1-BasicFrame"
          component={BasicFrame}
          durationInFrames={150}
          fps={VIDEO_FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />
        <Composition
          id="2-FrameCounter" // Name in sidebar
          component={FrameCounter} // Your React component
          durationInFrames={150} // 5 seconds at 30 FPS
          fps={30} // 30 frames per second
          width={1080} // 1080 pixels wide
          height={1080} // 1080 pixels tall
        />

        <Composition
          id="3-VideoInfo"
          component={VideoInfo}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1080}
        />

        <Composition
          id="4-CustomOpening"
          component={CustomOpening}
          durationInFrames={CUSTOM_OPENING_DURATION}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={
            {
              name: "John Doe",
              avatarUrl: "https://i.pravatar.cc/150?img=1",
            } as Parameters<typeof CustomOpening>[0]
          }
        />
      </Folder>

      {/* StarsAndProductivity Scene - Complete Implementation */}
      <Composition
        id="StarsAndProductivity"
        component={StarsAndProductivity}
        durationInFrames={getStarsAndProductivityDuration()}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          starsGiven: 42,
          topWeekday: "3", // Wednesday (0-indexed)
          topHour: "14", // 2pm
          graphData: MOCK_PRODUCTIVITY_DATA,
        }}
      />

      {/* StarsAndProductivity WITH AUDIO - Enhanced Version */}
      <Composition
        id="StarsAndProductivityWithAudio"
        component={StarsAndProductivityWithAudio}
        durationInFrames={getStarsAndProductivityWithAudioDuration()}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          starsGiven: 42,
          topWeekday: "3", // Thursday (0-indexed: Mon=0, Tue=1, Wed=2, Thu=3)
          topHour: "14", // 2 PM (24-hour format)
          graphData: MOCK_PRODUCTIVITY_DATA,
        }}
      />
    </>
  );
};
