export interface ProductivityDataPoint {
  time: number; // 0-23 (hour of day)
  productivity: number; // 0-100+ (commits/activity)
}

export const MOCK_PRODUCTIVITY_DATA: ProductivityDataPoint[] = [
  { time: 0, productivity: 0 },
  { time: 1, productivity: 0 },
  { time: 2, productivity: 0 },
  { time: 3, productivity: 0 },
  { time: 4, productivity: 0 },
  { time: 5, productivity: 5 },
  { time: 6, productivity: 15 },
  { time: 7, productivity: 25 },
  { time: 8, productivity: 45 },
  { time: 9, productivity: 65 },
  { time: 10, productivity: 70 },
  { time: 11, productivity: 60 },
  { time: 12, productivity: 50 },
  { time: 13, productivity: 55 },
  { time: 14, productivity: 45 },
  { time: 15, productivity: 35 },
  { time: 16, productivity: 25 },
  { time: 17, productivity: 15 },
  { time: 18, productivity: 10 },
  { time: 19, productivity: 5 },
  { time: 20, productivity: 0 },
  { time: 21, productivity: 0 },
  { time: 22, productivity: 0 },
  { time: 23, productivity: 0 },
];
