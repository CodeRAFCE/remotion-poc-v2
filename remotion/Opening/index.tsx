import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Gradient } from "../Gradients/Gradient";
import { Noise } from "../Noise";
import { BackgroundMountains } from "./Background";
import { Foreground } from "./Foreground";
import { TakeOff, type Rocket } from "./TakeOff";
import { OpeningTitle } from "./Title";
import { isMobileDevice } from "./utils";

export const OPENING_SCENE_LENGTH = 130;

const LAUNCH_SOUND = staticFile("rocket-launch.mp3");

export type OpeningSceneProps = {
  login: string;
  startAngle: "left" | "right";
  rocket: Rocket;
};

const OpeningSceneFull: React.FC<OpeningSceneProps> = ({
  login,
  startAngle,
  rocket,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const exitProgress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: durationInFrames - 20,
    durationInFrames: 60,
  });

  const distance = interpolate(exitProgress, [0, 1], [1, 0.000005], {});
  const scaleDivided = 1 / distance;
  const translateX = (scaleDivided - 1) * 200;

  const bottomTranslateY = interpolate(exitProgress, [0, 0.7], [0, 500]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isMobileDevice() ? null : (
        <Sequence from={-20}>
          <Audio startFrom={0} src={LAUNCH_SOUND} />
        </Sequence>
      )}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontSize: 60,
          width: "100%",
          height: "100%",
        }}
      >
        <AbsoluteFill
          style={{
            opacity: interpolate(exitProgress, [0, 1], [1, 0]),
          }}
        >
          <Gradient gradient="blueRadial" />
          <Noise translateX={100} translateY={30} />
        </AbsoluteFill>
        <AbsoluteFill>
          <OpeningTitle
            startAngle={startAngle}
            exitProgress={exitProgress}
            login={login}
            rocket={rocket}
          />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            transform: `translateY(${bottomTranslateY}px)`,
          }}
        >
          <BackgroundMountains />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            transformOrigin: "bottom",
            transform: `scale(${scaleDivided}) translateY(${translateX}px)`,
          }}
        >
          <Foreground />
        </AbsoluteFill>
        <TakeOff rocket={rocket} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const OpeningScene: React.FC<OpeningSceneProps> = ({
  login,
  startAngle,
  rocket,
}) => {
  const { width, fps, durationInFrames: actualDuration } = useVideoConfig();
  const frame = useCurrentFrame();
  const delay = 10;
  const durationInFrames = 60;

  const zoomOut =
    spring({
      fps,
      frame,
      config: {
        damping: 200,
      },
      durationInFrames,
      delay,
    }) *
      0.9 +
    interpolate(frame, [0, delay + durationInFrames], [-0.1, 0.1], {
      extrapolateRight: "clamp",
    });

  const scale = interpolate(zoomOut, [0, 1], [2.5, 1]);
  const offset = interpolate(
    zoomOut,
    [0, 1],
    [startAngle === "left" ? width / 2 - 300 : -width / 2, 0],
  );
  const x = offset / scale;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translateX(${x}px) translateY(0px)`,
      }}
    >
      <OpeningSceneFull startAngle={startAngle} login={login} rocket={rocket} />
      {isMobileDevice() ? null : (
        <Sequence from={actualDuration - 60}>
          <Audio src={staticFile("first-whoosh.mp3")} volume={0.5} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
