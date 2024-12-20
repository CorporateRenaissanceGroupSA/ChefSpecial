import axios from "axios";
import { CycleData, Meal, MealDays, MealType } from "../types";

// utility function to get a list of meals for a hospital
export async function getMealsList(hospitalId: number): Promise<Meal[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(`${process.env.REACT_APP_API}/meal/list`, {
      hospitalId,
    });
    console.log("Meal list response: ", response);
    if (response.status === 200) {
      result = response.data.meals.map((mealData: any) => {
        return {
          Id: mealData.Id,
          name: mealData.name,
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

// utility function to get list of meal types
export async function getMealTypeList(): Promise<MealType[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(
      `${process.env.REACT_APP_API}/meal-types`,
      {}
    );
    console.log("Meal Type list response: ", response);
    if (response.status === 200) {
      result = response.data.map((mealTypeData: any) => {
        return {
          Id: mealTypeData.Id,
          name: mealTypeData.mealType,
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

// utility function to get a list of cycles for a hospital
export async function getCycleList(hospitalId: number): Promise<CycleData[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(`${process.env.REACT_APP_API}/cycle/list`, {
      hospitalId: hospitalId,
    });
    console.log("Cycle list response: ", response);
    if (response.status === 200) {
      result = response.data;
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

// utility function to get the Cycle info for a specified cycle id
export async function getCycleDetail(
  cycleId: number
): Promise<{ cycleInfo: CycleData } | undefined> {
  console.log("Getting detail for cycle: " + cycleId);
  let apiResult = await axios.post(`${process.env.REACT_APP_API}/cycle/info`, {
    Id: cycleId,
  });
  console.log("Cycle detail apiResult: ", apiResult);
  if (apiResult.status !== 200) {
    console.error(
      "Problem getting cycle details for cycleId: " + cycleId,
      apiResult
    );
    return undefined;
  }
  let result = {
    cycleInfo: apiResult.data.cycleInfo,
  };
  console.log("Cycle info result: ", result);
  return result;
}

// utility function to fetch all the mealDays for a cycle
export async function getCycleMealDays(
  cycleId: number,
  cycleDays: number,
  mealTypeId: number
): Promise<{ mealDaysList: MealDays[] } | undefined> {
  console.log(
    "Getting items for cycle " +
      cycleId +
      " with cycleDays " +
      cycleDays +
      " and mealType " +
      mealTypeId
  );
  let apiResult = await axios.post(
    `${process.env.REACT_APP_API}/cycle/meal-type/meal-days`,
    { cycleId, mealTypeId }
  );
  console.log("Cycle MealType items apiResult: ", apiResult);
  if (apiResult.status !== 200) {
    console.error(
      "Problem getting cycle mealType details for cycleId: " +
        cycleId +
        " MealTypeId: " +
        mealTypeId,
      apiResult
    );
    return undefined;
  }
  let mealDaysMap: Map<string, MealDays> = new Map();
  if (apiResult.data.mealItems) {
    apiResult.data.mealItems.forEach((mealItem: any) => {
      let uniqueId =
        mealItem.cycleId + ":" + mealItem.mealTypeId + ":" + mealItem.mealId;
      let existingMealDays = mealDaysMap.get(uniqueId);
      if (!existingMealDays) {
        existingMealDays = {
          cycleId: mealItem.cycleId,
          mealTypeId: mealItem.mealTypeId,
          mealTypeName: mealItem.mealType,
          mealId: mealItem.mealId,
          mealName: mealItem.mealName,
          days: Array(cycleDays).fill(false),
        };
      }
      if (mealItem.cycleDay < cycleDays) {
        existingMealDays.days[mealItem.cycleDay] =
          mealItem.isActive === true || mealItem.isActive === "true";
      }
      mealDaysMap.set(uniqueId, existingMealDays);
    });
  }
  let mealDaysList = Array.from(mealDaysMap.values());
  let result = {
    mealDaysList,
  };
  console.log("Cycle MealType items result: ", result);
  return result;
}

// utility function to merge new/existing cycle info
export async function mergeCycleInfo(
  cycle: CycleData
): Promise<number | undefined> {
  try {
    let apiResult = await axios.post(
      `${process.env.REACT_APP_API}/cycle/merge-info`,
      cycle
    );
    console.log("Cycle merge info apiResult: ", apiResult);
    return apiResult.data.Id;
  } catch (error) {
    console.error(error);
  }
}

// utility function to merge new/existing meal day item (individual checkboxes)
export async function mergeMealDay(
  cycleId: number,
  mealTypeId: number,
  mealId: number,
  dayIndex: number,
  active: boolean
): Promise<void> {
  const mergeItemInput = {
    cycleId,
    mealTypeId,
    mealId,
    cycleDay: dayIndex,
    isActive: active,
  };
  try {
    let apiResult = await axios.post(
      `${process.env.REACT_APP_API}/cycle/merge-item`,
      mergeItemInput
    );
    console.log("Cycle item merge apiResult: ", apiResult);
  } catch (error) {
    console.error(error);
  }
}
