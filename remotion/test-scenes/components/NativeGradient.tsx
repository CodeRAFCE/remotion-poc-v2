import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { GradientType } from "./available-gradients";
import { availableGradients } from "./available-gradients";

type Props = {
  readonly gradient: GradientType;
};

export const NativeGradient: React.FC<Props> = ({ gradient }) => {
  const style: React.CSSProperties = useMemo(() => {
    return {
      backgroundImage: availableGradients[gradient],
    };
  }, [gradient]);

  return <AbsoluteFill style={style} />;
};

// Simplified Gradient component that always uses NativeGradient for now
export const Gradient: React.FC<Props> = ({ gradient }) => {
  return <NativeGradient gradient={gradient} />;
};
