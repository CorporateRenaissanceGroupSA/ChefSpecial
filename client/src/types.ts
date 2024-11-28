export interface Meal {
  name: string;
  days: boolean[];
}

export interface CycleData {
  Id: number;
  hospitalId: number;
  name: string;
  cycleDays: number;
  startDate: string;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
}

export interface Option {
  value: number;
  label: string;
}
