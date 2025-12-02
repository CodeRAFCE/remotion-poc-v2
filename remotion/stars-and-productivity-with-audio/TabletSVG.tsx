import React from "react";
import { Img, staticFile } from "remotion";

/**
 * TABLETSVG COMPONENT
 *
 * Purpose: Loads and displays the tablet/hands image asset
 *
 * Key Concepts:
 * 1. staticFile() for asset loading
 * 2. Remotion's Img component (optimized for video rendering)
 * 3. Exporting constants for reuse
 *
 * Why use staticFile()?
 * - Ensures asset is properly bundled
 * - Works in both development and production
 * - Handles asset paths automatically
 *
 * Why use Remotion's Img instead of <img>?
 * - Optimized for video rendering
 * - Better performance during composition
 * - Consistent behavior across platforms
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * TABLET_BG
 *
 * Background color for the tablet screen area
 * This dark color creates contrast with the productivity graph
 *
 * Color: Very dark blue-black (#080817)
 * - Matches GitHub's dark theme aesthetic
 * - Provides good contrast for white/colored text
 * - Creates depth in the 3D scene
 */
export const TABLET_BG = "#080817";

/**
 * HANDS_ASSET
 *
 * Path to the hands/tablet image
 * This image shows hands holding a tablet device
 *
 * File location: public/hands.png
 * - Must exist in the public directory
 * - PNG format for transparency support
 * - Should be high resolution for crisp rendering
 *
 * Image requirements:
 * - Transparent background (PNG with alpha channel)
 * - Hands positioned to frame the screen area
 * - High enough resolution for 1080x1920 output
 */
export const HANDS_ASSET = staticFile("hands.png");

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TabletSVG Component
 *
 * Simple wrapper component that renders the tablet image
 *
 * Props:
 * @param style - Optional CSS styles to apply to the image
 *
 * Usage:
 * <TabletSVG style={{ width: "100%", height: "100%" }} />
 *
 * Why a separate component?
 * - Encapsulates asset loading logic
 * - Makes it easy to swap the image
 * - Provides a clear semantic name
 * - Can add additional logic later (e.g., loading states)
 */
export const TabletSVG: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => {
  return <Img src={HANDS_ASSET} style={style} />;
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic usage
 *
 * <TabletSVG />
 */

/**
 * Example 2: With custom styling
 *
 * <TabletSVG
 *   style={{
 *     width: "100%",
 *     height: "100%",
 *     transform: "translateY(100px)",
 *   }}
 * />
 */

/**
 * Example 3: Using the background color constant
 *
 * <div style={{ backgroundColor: TABLET_BG }}>
 *   <TabletSVG />
 * </div>
 */

// ============================================================================
// CUSTOMIZATION NOTES
// ============================================================================

/**
 * To use a different tablet image:
 * 1. Add your image to the public/ directory
 * 2. Update HANDS_ASSET path: staticFile("your-image.png")
 * 3. Ensure the image has a transparent background
 * 4. Test in Remotion Studio to verify positioning
 *
 * To change the background color:
 * 1. Update TABLET_BG to your desired color
 * 2. Consider contrast with text and graph elements
 * 3. Test readability in the final render
 */

/**
 * Asset requirements checklist:
 * ✅ File is in public/ directory
 * ✅ PNG format with transparency
 * ✅ High resolution (recommended: 2000x2000 or larger)
 * ✅ Hands frame a clear screen area
 * ✅ No copyright issues
 */
