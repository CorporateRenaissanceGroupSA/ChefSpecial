export interface Meal {
  name: string;
  days: boolean[];
}

export interface CycleData {
  cycleName: string;
  startDate: string;
  daysInCycle: number;
  meals: string[];
}

export interface Option {
  value: number;
  label: string;
}
