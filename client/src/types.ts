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
  mealTypeTime: string;
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
  mealTypeTime: string;
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

export interface CalendarMeals {
  cycleId: number;
  hospitalId: number;
  mealTypeId: string;
  startDate: string;
  endDate: string;

}