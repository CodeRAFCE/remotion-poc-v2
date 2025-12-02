import { AbsoluteFill, Img, staticFile } from "remotion";

export const COCKPIT_IMAGE = staticFile("cockpit.png");

export const CockpitSVG = () => {
  return (
    <AbsoluteFill>
      <Img src={COCKPIT_IMAGE} />
    </AbsoluteFill>
  );
};
