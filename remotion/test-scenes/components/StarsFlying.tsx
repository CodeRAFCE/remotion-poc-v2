/**
 * ═══════════════════════════════════════════════════════════════════════════
 * StarsFlying.tsx - Star Generation and Trajectory Management
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 * This component generates multiple star instances that fly towards the camera.
 * Each star follows a random trajectory, and some are designated to "hit" the
 * spaceship cockpit, creating impact effects and triggering repository name displays.
 *
 * KEY CONCEPTS:
 * - Generates MAX_STARS (20) star instances at staggered intervals
 * - Uses random angles to create varied trajectories
 * - Selects random hit indices (up to MAX_HITS = 8) for cockpit collisions
 * - Times each star launch with TIME_INBETWEEN_STARS (10 frames) delay
 * - Coordinates with Star component for individual star rendering
 *
 * TIMING FLOW:
 * Frame 0-19: Initial delay (STAR_ANIMATION_DELAY)
 * Frame 20: First star launches
 * Frame 30: Second star launches (20 + TIME_INBETWEEN_STARS)
 * Frame 40: Third star launches
 * ... and so on
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AbsoluteFill, Sequence, random } from "remotion";
import { ANIMATION_DURATION_PER_STAR, Star } from "./Star";

// ═══════════════════════════════════════════════════════════════════════════
// TIMING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TIME_INBETWEEN_STARS: Number of frames between each star launch
 * - Value: 10 frames (0.33 seconds at 30fps)
 * - Purpose: Staggers star appearances to create continuous flow
 * - Effect: 20 stars over 200 frames = steady stream of stars
 */
export const TIME_INBETWEEN_STARS = 10;

/**
 * MAX_STARS: Maximum number of stars that can be displayed
 * - Value: 20 stars
 * - Purpose: Limits visual complexity and performance impact
 * - Note: Actual stars shown may be less based on starsGiven prop
 */
const MAX_STARS = 20;

/**
 * STAR_ANIMATION_DELAY: Initial delay before first star appears
 * - Value: 20 frames (0.67 seconds at 30fps)
 * - Purpose: Gives time for cockpit entrance animation before stars start
 * - Effect: All stars shifted forward by 20 frames
 */
export const STAR_ANIMATION_DELAY = 20;

/**
 * MAX_HITS: Maximum number of stars that can hit the cockpit
 * - Value: 8 hits
 * - Purpose: Limits number of impact effects and repository name displays
 * - Note: Actual hits may be less if starsGiven < 8
 */
const MAX_HITS = 8;

// ═══════════════════════════════════════════════════════════════════════════
// STAR CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * getActualStars - Calculates how many stars to display based on user's GitHub stars
 *
 * ALGORITHM:
 * 1. Multiply starsGiven by 2 to amplify visual impact
 * 2. Cap at MAX_STARS (20) to avoid performance issues
 * 3. Ensure minimum of 5 stars even if user has few stars
 *
 * EXAMPLES:
 * - starsGiven = 1  → actualStars = 5  (minimum)
 * - starsGiven = 3  → actualStars = 6  (3 × 2)
 * - starsGiven = 8  → actualStars = 16 (8 × 2)
 * - starsGiven = 15 → actualStars = 20 (15 × 2, capped at MAX_STARS)
 *
 * WHY THIS MATTERS:
 * - Makes animation visually interesting even with few actual GitHub stars
 * - Creates balance between realism (showing actual stars) and entertainment
 * - Prevents overwhelming visuals with too many stars
 */
export const getActualStars = (starsGiven: number) => {
  return Math.max(5, Math.min(starsGiven * 2, MAX_STARS));
};

/**
 * getHitIndexes - Randomly selects which stars will hit the cockpit
 *
 * PURPOSE:
 * Determines which star indices (0-19) will collide with the spaceship,
 * triggering burst effects and repository name displays.
 *
 * ALGORITHM:
 * 1. Calculate maxHits: minimum of (actual GitHub stars, MAX_HITS=8)
 * 2. Create a Set to store unique hit indices (no duplicates)
 * 3. Loop until we have maxHits unique indices:
 *    - Generate random number 0-1 using seeded random (for consistency)
 *    - Multiply by starsDisplayed to get index in range [0, starsDisplayed)
 *    - Floor to get integer index
 *    - Add to Set (duplicates automatically ignored)
 * 4. Convert Set to Array and return
 *
 * WHY USE A SET?
 * - Automatically prevents duplicate indices
 * - Clean way to ensure unique hit positions
 * - Efficient membership testing
 *
 * WHY SEEDED RANDOM?
 * - random(`${seed}${i}`) generates consistent results for same seed
 * - Makes animation reproducible across renders
 * - Different seeds produce different hit patterns
 *
 * EXAMPLE:
 * starsDisplayed = 20, starsGiven = 5, seed = "starsGiven"
 * → maxHits = min(5, 8) = 5
 * → Might return [2, 7, 11, 15, 19]
 * → These 5 stars (out of 20) will hit cockpit
 */
export const getHitIndexes = ({
  starsDisplayed,
  seed,
  starsGiven,
}: {
  starsDisplayed: number;
  starsGiven: number;
  seed: string;
}): number[] => {
  // Limit hits to avoid overwhelming effect and ensure we don't exceed actual stars given
  const maxHits = Math.min(starsGiven, MAX_HITS);

  // Use Set to automatically handle uniqueness
  const hitIndexes = new Set<number>();

  let i = 0;
  while (hitIndexes.size < maxHits) {
    i++;
    // Generate random index using seeded random for consistency
    hitIndexes.add(Math.floor(random(`${seed}${i}`) * starsDisplayed));
  }

  return Array.from(hitIndexes);
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * StarsFlying - Renders multiple star instances with staggered timing
 *
 * PROPS:
 * @param starsGiven - Total number of GitHub stars to display (affects count)
 * @param hitIndices - Array of indices indicating which stars hit cockpit
 *
 * RENDERING LOGIC:
 * 1. Calculate actual stars to show: getActualStars(starsGiven)
 * 2. Create array of that length: new Array(actualStars).fill(true)
 * 3. Map over array to create star instances:
 *    - Each star wrapped in <Sequence> for delayed appearance
 *    - Sequence.from calculates start frame: (index × 10) + 20
 *    - Random angle for trajectory: random(seed) × π - π/2 = range [-π/2, π/2]
 *    - Check if index is in hitIndices array to determine collision
 *
 * TIMING BREAKDOWN:
 * Star 0:  starts at frame 20 + (0 × 10)  = 20
 * Star 1:  starts at frame 20 + (1 × 10)  = 30
 * Star 2:  starts at frame 20 + (2 × 10)  = 40
 * Star 19: starts at frame 20 + (19 × 10) = 210
 *
 * ANGLE CALCULATION:
 * - random(`${index}a`) generates 0-1 value
 * - Multiply by Math.PI (π ≈ 3.14) → range [0, π]
 * - Subtract π/2 → range [-π/2, π/2] = [-90°, 90°]
 * - This creates a cone of trajectories spreading left and right
 *
 * HIT DETECTION:
 * - If current index is in hitIndices array → star will hit cockpit
 * - Pass hitSpaceship object with index position in hitIndices
 * - This index determines which repo name to display
 * - If not in hitIndices → pass null, star flies past without hitting
 *
 * VISUAL RESULT:
 * - Stars appear one by one every 10 frames
 * - Each star has unique trajectory angle
 * - Some stars hit cockpit (burst effect + repo name)
 * - Other stars fly past harmlessly
 * - Creates dynamic, engaging animation sequence
 */
export const StarsFlying: React.FC<{
  starsGiven: number;
  hitIndices: number[];
}> = ({ starsGiven, hitIndices }) => {
  return (
    <AbsoluteFill>
      {/* Generate array of stars based on starsGiven prop */}
      {new Array(getActualStars(starsGiven)).fill(true).map((_, index) => (
        <Sequence
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          // Calculate start frame: stagger each star by TIME_INBETWEEN_STARS
          from={index * TIME_INBETWEEN_STARS + STAR_ANIMATION_DELAY}
        >
          <Star
            // Random angle in range [-π/2, π/2] for varied trajectories
            angle={random(`${index}a`) * Math.PI - Math.PI / 2}
            // How long the star animation lasts
            duration={ANIMATION_DURATION_PER_STAR}
            // Check if this star should hit the cockpit
            hitSpaceship={
              hitIndices.includes(index)
                ? { index: hitIndices.indexOf(index) } // Pass hit index for repo lookup
                : null // Star flies past without hitting
            }
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
