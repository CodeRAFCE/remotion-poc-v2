export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Hour =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23";

export type ProductivityPerHour = {
  time: number;
  productivity: number;
};

export const MOCK_STARS_GIVEN = 150;
export const MOCK_TOTAL_PULL_REQUESTS = 42;
export const MOCK_TOP_WEEKDAY = "Wednesday";
export const MOCK_TOP_HOUR = "14";
export const MOCK_LOGIN = "octocat";

export const MOCK_GRAPH_DATA = [
  { time: 0, productivity: 10 },
  { time: 1, productivity: 5 },
  { time: 2, productivity: 2 },
  { time: 3, productivity: 0 },
  { time: 4, productivity: 0 },
  { time: 5, productivity: 1 },
  { time: 6, productivity: 5 },
  { time: 7, productivity: 15 },
  { time: 8, productivity: 40 },
  { time: 9, productivity: 80 },
  { time: 10, productivity: 95 },
  { time: 11, productivity: 85 },
  { time: 12, productivity: 70 },
  { time: 13, productivity: 60 },
  { time: 14, productivity: 100 },
  { time: 15, productivity: 90 },
  { time: 16, productivity: 85 },
  { time: 17, productivity: 75 },
  { time: 18, productivity: 50 },
  { time: 19, productivity: 30 },
  { time: 20, productivity: 20 },
  { time: 21, productivity: 15 },
  { time: 22, productivity: 10 },
  { time: 23, productivity: 5 },
];

export const MOCK_SAMPLE_STARRED_REPOS = [
  { name: "react", author: "facebook" },
  { name: "remotion", author: "remotion-dev" },
  { name: "next.js", author: "vercel" },
  { name: "typescript", author: "microsoft" },
  { name: "vscode", author: "microsoft" },
];
