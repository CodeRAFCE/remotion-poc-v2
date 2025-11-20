import {
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getAvatarImage } from "./utils";

const PANE_BORDER = "2px solid rgba(255, 255, 255, 0.1)";
const TITLE_IMAGE_INNER_BORDER_RADIUS = 30;
const TITLE_IMAGE_BORDER_PADDING = 20;

export const TitleImage: React.FC<{ login: string }> = ({ login }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flip = spring({
    fps,
    frame,
    config: {},
    delay: 50,
  });

  const flipRad = interpolate(flip, [0, 1], [Math.PI, 0]);

  return (
    <div
      style={{
        height: 160,
        width: 160,
        marginRight: TITLE_IMAGE_BORDER_PADDING,
        perspective: 1000,
        position: "relative",
      }}
    >
      <Img
        src={getAvatarImage(login)}
        style={{
          width: 160,
          borderRadius: TITLE_IMAGE_INNER_BORDER_RADIUS,
          height: 160,
          border: PANE_BORDER,
          transform: `rotateY(${flipRad}rad)`,
          backfaceVisibility: "hidden",
          position: "absolute",
        }}
      />
    </div>
  );
};
