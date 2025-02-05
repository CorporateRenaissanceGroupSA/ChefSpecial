export interface Meal {
  Id: number | null;
  name: string;
  description: string;
  mealTypeId: number;
  mealTypes: number | number[];
  servedId: number;
  isActive: boolean;
}

export interface MealType {
  Id: number;
  name: string;
  mealTypeServedTime: string;
}

export interface SelectedMealTypeData {
  mealTypeId: number;
  mealType: string;

}

export interface Served {
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
  description: string;
  mealTypeId: number;
  mealTypes: number | number[];
  mealTypeServedTime: string;
  servedId: number;
  served: string;
  itemIsActive: boolean;
}

export interface CycleMeals {
  Id: number;
  name: string;
}

export interface Option {
  value: number;
  label: string;
}

export interface Hospitals {
  Id: number;
  name: string;
}

export interface MealEntry {
  cycleId: number;
  mealId: number;
  hospitalId: number;
  mealTypeId: string;
  mealTypeName: string;
  mealName: string;
  cycleName: string;
  calendarDate: string;
  cycleDays: number;
  cycleEndDate: string;
  cycleStartDate: string;
  hospitalName: string;
  mealCycleDay: number;
  cycleItemId: number;
}

export interface CalendarMeals {
  [date: string]: MealEntry[];
}

export interface Notes {
  Id: number | null;
  hospitalId: number;
  note: string;
  startDate: string;
  endDate: string;
  createdBy: number;
  isActive: boolean;
}