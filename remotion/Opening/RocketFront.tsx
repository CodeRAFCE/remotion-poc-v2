import { AbsoluteFill, Img, staticFile } from "remotion";

export type Rocket = "blue" | "orange" | "yellow";

export const getSideRocketSource = (rocket: Rocket) => {
  if (rocket === "blue") {
    return staticFile("rocket-side-blue.png");
  }
  if (rocket === "orange") {
    return staticFile("rocket-side-orange.png");
  }
  return staticFile("rocket-side-yellow.png");
};

const Spaceship = (props: { readonly rocket: Rocket }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Img
      src={getSideRocketSource(props.rocket)}
      style={{
        width: 732 / 2,
        height: 1574 / 2,
      }}
    />
  </AbsoluteFill>
);

export default Spaceship;
