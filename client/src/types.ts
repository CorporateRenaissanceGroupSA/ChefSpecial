export interface Meal {
  Id: number;
  name: string;
}

export interface MealType {
  Id: number;
  name: string;
}

export interface MealDays {
  cycleId: number;
  mealTypeId: number;
  mealTypeName: string;
  mealId: number;
  mealName: string;
  days: boolean[];
}

export interface CycleData {
  Id: number;
  hospitalId: number;
  name: string;
  cycleDays: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: number;
  isActive: boolean;
}

export interface Option {
  value: number;
  label: string;
}
