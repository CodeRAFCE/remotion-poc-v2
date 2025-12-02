import React from "react";
import { Img, staticFile } from "remotion";

// Background color for tablet screen
export const TABLET_BG = "#080817";

// Load the hands/tablet image asset
export const HANDS_ASSET = staticFile("hands.png");

// Simple component that renders the tablet frame image
export const TabletSVG: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => {
  return <Img src={HANDS_ASSET} style={style} />;
};
