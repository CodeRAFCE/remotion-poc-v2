/**
 * PRODUCTIVITY DATA STRUCTURES
 *
 * Purpose: Define TypeScript interfaces and mock data for the productivity scene
 *
 * Key Concepts:
 * 1. TypeScript interfaces for type safety
 * 2. Mock data structure (24 hours of productivity)
 * 3. Data normalization (0-100 scale)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * ProductivityDataPoint Interface
 *
 * Represents a single hour's productivity data
 *
 * @property time - Hour of day (0-23)
 *   - 0 = midnight (12 am)
 *   - 12 = noon (12 pm)
 *   - 23 = 11 pm
 *
 * @property productivity - Activity level (0-100+)
 *   - 0 = no activity
 *   - 100 = maximum activity
 *   - Can exceed 100 for exceptional days
 *
 * Example:
 * { time: 14, productivity: 85 }
 * = 2 PM with high productivity (85/100)
 */
export interface ProductivityDataPoint {
  time: number; // 0-23 (hour of day)
  productivity: number; // 0-100+ (commits/activity level)
}

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * MOCK_PRODUCTIVITY_DATA
 *
 * Sample productivity data for a typical developer's day
 *
 * Pattern:
 * - Midnight to 5am: No activity (sleeping)
 * - 6am-8am: Low activity (waking up, morning routine)
 * - 9am-11am: High activity (morning productivity peak)
 * - 12pm: Moderate (lunch break)
 * - 1pm-3pm: Moderate activity (afternoon work)
 * - 4pm-6pm: Declining (end of day)
 * - 7pm onwards: Low/no activity (evening)
 *
 * Why 24 items?
 * - One for each hour of the day
 * - Allows visualization of full daily pattern
 * - Matches the hour wheel (0-23)
 *
 * Usage:
 * - Used in the bar chart visualization
 * - Determines which hour is "most productive"
 * - Can be replaced with real data from GitHub API
 */
export const MOCK_PRODUCTIVITY_DATA: ProductivityDataPoint[] = [
  // Midnight to early morning (0-4): Sleeping
  { time: 0, productivity: 0 }, // 12 am
  { time: 1, productivity: 0 }, // 1 am
  { time: 2, productivity: 0 }, // 2 am
  { time: 3, productivity: 0 }, // 3 am
  { time: 4, productivity: 0 }, // 4 am

  // Early morning (5-8): Waking up
  { time: 5, productivity: 5 }, // 5 am - minimal activity
  { time: 6, productivity: 15 }, // 6 am - starting to wake
  { time: 7, productivity: 25 }, // 7 am - morning routine
  { time: 8, productivity: 45 }, // 8 am - getting started

  // Morning peak (9-11): Highest productivity
  { time: 9, productivity: 65 }, // 9 am - ramping up
  { time: 10, productivity: 70 }, // 10 am - PEAK HOUR ⭐
  { time: 11, productivity: 60 }, // 11 am - still strong

  // Lunch time (12): Dip
  { time: 12, productivity: 50 }, // 12 pm - lunch break

  // Afternoon (13-15): Moderate productivity
  { time: 13, productivity: 55 }, // 1 pm - post-lunch
  { time: 14, productivity: 45 }, // 2 pm - afternoon slump
  { time: 15, productivity: 35 }, // 3 pm - declining

  // Late afternoon (16-18): Winding down
  { time: 16, productivity: 25 }, // 4 pm - wrapping up
  { time: 17, productivity: 15 }, // 5 pm - end of day
  { time: 18, productivity: 10 }, // 6 pm - minimal

  // Evening (19-23): Low/no activity
  { time: 19, productivity: 5 }, // 7 pm - evening
  { time: 20, productivity: 0 }, // 8 pm - no activity
  { time: 21, productivity: 0 }, // 9 pm
  { time: 22, productivity: 0 }, // 10 pm
  { time: 23, productivity: 0 }, // 11 pm
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the most productive hour from data
 *
 * @param data - Array of productivity data points
 * @returns The hour (0-23) with highest productivity
 *
 * Example:
 * getMostProductiveHour(MOCK_PRODUCTIVITY_DATA) // Returns 10 (10 am)
 */
export const getMostProductiveHour = (
  data: ProductivityDataPoint[],
): number => {
  if (data.length === 0) return 0;

  let maxHour = 0;
  let maxProductivity = 0;

  for (const point of data) {
    if (point.productivity > maxProductivity) {
      maxProductivity = point.productivity;
      maxHour = point.time;
    }
  }

  return maxHour;
};

/**
 * Format hour as 12-hour time string
 *
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted string like "12 am", "2 pm", etc.
 *
 * Examples:
 * formatHour(0)  // "12 am"
 * formatHour(12) // "12 pm"
 * formatHour(14) // "2 pm"
 * formatHour(23) // "11 pm"
 */
export const formatHour = (hour: number): string => {
  if (hour === 0) return "12 am";
  if (hour === 12) return "12 pm";
  if (hour > 12) return `${hour - 12} pm`;
  return `${hour} am`;
};

/**
 * Get weekday name from index
 *
 * @param index - Weekday index (0-6)
 * @returns Weekday name
 *
 * Examples:
 * getWeekdayName(0) // "Monday"
 * getWeekdayName(6) // "Sunday"
 */
export const getWeekdayName = (index: number): string => {
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return weekdays[index] || "Monday";
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Using the mock data
 *
 * <StarsAndProductivityWithAudio
 *   graphData={MOCK_PRODUCTIVITY_DATA}
 *   topHour="10"
 *   topWeekday="3"
 *   starsGiven={42}
 * />
 */

/**
 * Example 2: Creating custom data
 *
 * const customData: ProductivityDataPoint[] = [
 *   { time: 0, productivity: 0 },
 *   { time: 1, productivity: 10 },
 *   // ... 22 more entries
 * ];
 */

/**
 * Example 3: Finding peak hour
 *
 * const peakHour = getMostProductiveHour(MOCK_PRODUCTIVITY_DATA);
 * console.log(`Peak productivity at ${formatHour(peakHour)}`);
 * // Output: "Peak productivity at 10 am"
 */

// ============================================================================
// NOTES FOR REAL DATA INTEGRATION
// ============================================================================

/**
 * When replacing with real GitHub data:
 *
 * 1. Fetch commit data from GitHub API
 * 2. Group commits by hour of day
 * 3. Count commits per hour
 * 4. Normalize to 0-100 scale (or keep raw counts)
 * 5. Create ProductivityDataPoint array
 *
 * Example transformation:
 *
 * const commits = await fetchGitHubCommits(username);
 * const hourCounts = groupByHour(commits); // { 0: 0, 1: 0, ..., 10: 42, ... }
 * const maxCount = Math.max(...Object.values(hourCounts));
 *
 * const productivityData: ProductivityDataPoint[] = Array.from(
 *   { length: 24 },
 *   (_, hour) => ({
 *     time: hour,
 *     productivity: (hourCounts[hour] / maxCount) * 100,
 *   })
 * );
 */
