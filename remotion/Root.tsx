import { Composition } from "remotion";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../types/constants";
import { OPENING_SCENE_LENGTH, OpeningScene } from "./Opening";

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
    </>
  );
};
