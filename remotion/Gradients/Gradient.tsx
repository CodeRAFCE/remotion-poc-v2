import { AbsoluteFill } from "remotion";
import type { GradientType } from "./available-gradients";
import { availableGradients } from "./available-gradients";

type Props = {
  readonly gradient: GradientType;
};

export const Gradient: React.FC<Props> = ({ gradient }) => {
  const style: React.CSSProperties = {
    backgroundImage: availableGradients[gradient],
  };

  return <AbsoluteFill style={style} />;
};
