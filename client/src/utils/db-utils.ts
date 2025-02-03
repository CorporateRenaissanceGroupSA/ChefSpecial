import axios from "axios";
import {
  CycleData,
  CycleMeals,
  Meal,
  MealDays,
  MealType,
  Served,
  Hospitals,
  CalendarMeals,
} from "../types";

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
          description: mealData.description,
          mealTypes: mealData.mealTypes,
          servedId: mealData.servedId,
          served: mealData.served,
          isActive: mealData.isActive,
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

// utility function to get list of meal types
export async function getMealTypeList(hospitalId: number): Promise<MealType[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(`${process.env.REACT_APP_API}/meal-types`, {
      hospitalId,
    });
    console.log("Meal Type list response: ", response);
    if (response.status === 200) {
      result = response.data.map((mealTypeData: any) => {
        return {
          Id: mealTypeData.mealId,
          name: mealTypeData.mealType,
          mealTypeTime: mealTypeData.CutOffTime,
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

// utility function to get the selected meal type id's for a specified cycle id
export async function getSelectedMealTypes(
  cycleId: number
): Promise<number | undefined> {
  console.log("Getting detail for cycle: " + cycleId);
  let apiResult = await axios.post(
    `${process.env.REACT_APP_API}/cycle/selected-mealtypes`,
    {
      cycleId,
    }
  );
  console.log("Cycle detail apiResult: ", apiResult);
  if (apiResult.status !== 200) {
    console.error(
      "Problem getting selected-mealtypes details for cycleId: " + cycleId,
      apiResult
    );
    return undefined;
  }

  const mealItems = apiResult.data?.mealItems || [];
  const mealTypeIds = mealItems.map(
    (item: { mealTypeId: number }) => item.mealTypeId
  );

  console.log("Extracted mealTypeIds: ", mealTypeIds);
  return mealTypeIds;
}

// utility function to get a list of cycles for a hospital
export async function getCycleList(
  hospitalId: number,
  activeOnly: boolean
): Promise<CycleData[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(`${process.env.REACT_APP_API}/cycle/list`, {
      hospitalId: hospitalId,
      activeOnly: activeOnly,
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

// utility function to get all cycles that are linked to a specified meal
export async function getCycleMeals(
  hospitalId: number,
  mealId: number
): Promise<{ cycleInfo: CycleMeals[] } | undefined> {
  console.log("Getting detail for hospital: " + hospitalId + "meal" + mealId);
  let apiResult = await axios.post(`${process.env.REACT_APP_API}/meal/cycles`, {
    hospitalId,
    mealId,
  });
  console.log("Cycle Meals detail apiResult: ", apiResult);
  if (apiResult.status !== 200) {
    console.error(
      "Problem getting cycle details for cycleId: " +
        hospitalId +
        "meal" +
        mealId,
      apiResult
    );
    return undefined;
  }
  let result = {
    cycleInfo: apiResult.data.cycles,
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
    `${process.env.REACT_APP_API}/cycle/meal-days`,
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

// utility function to get list of served options
export async function getServedList(): Promise<Served[]> {
  let result: CycleData[] = [];
  try {
    let response = await axios.post(
      `${process.env.REACT_APP_API}/served-options`
    );
    console.log("Served list response: ", response);
    if (response.status === 200) {
      result = response.data.map((servedData: any) => {
        return {
          Id: servedData.Id,
          name: servedData.ServedState,
        };
      });
    }
    console.log(result);
  } catch (error) {
    console.error(error);
  }
  return result;
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

// utility function to merge new/existing meal day item (individual checkboxes)
export async function mergeMeal(
  Id: number,
  name: string,
  description: string,
  servedId: number,
  hospitalId: number,
  active: boolean
): Promise<void> {
  const mergeItemInput = {
    Id,
    name,
    description,
    servedId,
    hospitalId,
    isActive: active,
  };
  try {
    let apiResult = await axios.post(
      `${process.env.REACT_APP_API}/meal/merge`,
      mergeItemInput
    );
    console.log("Meal merge apiResult: ", apiResult);
    return apiResult.data;
  } catch (error) {
    console.error(error);
  }
}

// utility function to merge new/existing meal day item (individual checkboxes)
export async function mergeMealType(
  mealId: number,
  mealTypeId: number | number[],
  isActive: boolean
): Promise<void> {
  const mergeItemInput = {
    mealId,
    mealTypeId,
    isActive,
  };
  try {
    let apiResult = await axios.post(
      `${process.env.REACT_APP_API}/meal/mealtotype-merge`,
      mergeItemInput
    );
    console.log("Meal Type merge apiResult: ", apiResult);
  } catch (error) {
    console.error(error);
  }
}

// utility function to get list of meal types
export async function getHospitals(userId: number): Promise<Hospitals[]> {
  let result: Hospitals[] = [];
  try {
    let response = await axios.post(
      `${process.env.REACT_APP_API}/user-hospitals`,
      {
        userId,
      }
    );
    console.log("Hospital list response: ", response);
    if (response.status === 200) {
      result = response.data.map((hospitalData: any) => {
        return {
          Id: hospitalData.Id,
          name: hospitalData.hospitalName,
        };
      });
    }
  } catch (error) {
    console.error(error);
  }
  return result;
}

// get meals list for calendar view
export async function getCalendarMeals(
  startDate: string,
  endDate: string
): Promise<CalendarMeals[]> {
  let apiResult = await axios.post(
    `${process.env.REACT_APP_API}/calendar-meals`,
    {
      startDate,
      endDate,
    }
  );
  console.log("Calendar Meals detail apiResult: ", apiResult);
  if (apiResult.status !== 200) {
    console.error(
      "Problem getting calendar meals for start & end date: " +
        startDate +
        endDate,
      apiResult
    );
    return undefined;
  }
  // let result = apiResult
  console.log("Calendar Meals result: ", apiResult);
  return apiResult.data;
}
