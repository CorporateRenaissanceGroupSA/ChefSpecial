import axios from "axios";
import { CycleData, MealDays, MealType } from "../types";

export async function getMealsList(hospitalId: number): Promise<MealType[]> {
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

export async function getCycleDetail(
  cycleId: number
): Promise<{ cycleInfo: CycleData; mealDaysList: MealDays[] } | undefined> {
  console.log("Getting detail for cycle: " + cycleId);
  let apiResult = await axios.post(
    `${process.env.REACT_APP_API}/cycle/detail`,
    { Id: cycleId }
  );
  console.log("Cycle detail apiResult: ", apiResult);
  if (apiResult.status !== 200) {
    console.error(
      "Problem getting cycle details for cycleId: " + cycleId,
      apiResult
    );
    return undefined;
  }
  let mealDaysMap: Map<string, MealDays> = new Map();
  if (apiResult.data.cycleItems) {
    apiResult.data.cycleItems.forEach((cycleItem: any) => {
      let uniqueId =
        cycleItem.cycleId + ":" + cycleItem.mealTypeId + ":" + cycleItem.mealId;
      let existingMealDays = mealDaysMap.get(uniqueId);
      if (!existingMealDays) {
        existingMealDays = {
          cycleId: cycleItem.cycleId,
          mealTypeId: cycleItem.mealTypeId,
          mealTypeName: cycleItem.mealType,
          mealId: cycleItem.mealId,
          mealName: cycleItem.meal,
          days: [],
        };
      }
      existingMealDays.days[cycleItem.cycleDay] = cycleItem.isActive == "true";
      mealDaysMap.set(uniqueId, existingMealDays);
    });
  }
  let mealDaysList = Array.from(mealDaysMap.values());
  let result = {
    cycleInfo: apiResult.data.cycleInfo,
    mealDaysList,
  };
  console.log("Cycle detail result: ", result);
  return result;
}

export async function getCycleMealTypeItems(
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

export async function mergeMealDay(
  cycleId: number,
  mealTypeId: number,
  mealId: number,
  dayIndex: number,
  active: boolean
): Promise<void> {
  let response;
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

export async function mergeMealDays(
  cycle: CycleData,
  mealDays: MealDays
): Promise<void> {
  let response;
  const mergeItemInput = {};
  try {
    let api1Result = await axios.post(
      `${process.env.REACT_APP_API}/cycle/merge-item`,
      cycle
    );
    console.log("Cycle merge apiResult: ", api1Result);
    if (api1Result.data.Id) {
      let api2Result = await axios.post(
        `${process.env.REACT_APP_API}/cycle/detail`,
        { Id: api1Result.data.Id }
      );
      console.log("Cycle detail apiResult: ", api2Result);
      response = api2Result.data.cycleInfo;
    }
    console.log("Returning ...");
    return response;
  } catch (error) {
    console.error(error);
  }
}
