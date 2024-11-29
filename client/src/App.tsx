import React, { useState, useEffect } from "react";
import CycleSelector from "./components/CycleSelector";
import "./App.css";
import { CycleData, Meal, MealDays, MealType } from "./types";
import MealTable from "./components/MealTable";
import { SelectOption } from "./components/CreatableSelect";
import {
  getCycleDetail,
  getCycleList,
  getMealsList,
  getMealTypeList,
  mergeCycleInfo,
} from "./utils/db-utils";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const App: React.FC = () => {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [allCycles, setAllCycles] = useState<CycleData[]>([]);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleData | undefined>(
    undefined
  );
  const [mealDaysList, setMealDaysList] = useState<MealDays[]>([]);

  useEffect(() => {
    getMealTypeList().then((result) => {
      setMealTypes(result);
      console.log("Meal Types updated: ", result);
    });
  }, []);

  useEffect(() => {
    let path = process.env.REACT_APP_API;
    console.log("Path: ", path);
    console.log();
    getCycleList(hospitalId).then((result) => {
      setAllCycles(result);
      console.log("All Cycles updated: ", result);
    });
    getMealsList(hospitalId).then((result) => {
      setAllMeals(result);
      console.log("All meals updated.", result);
    });
  }, [hospitalId]);

  const debouncedLog = debounce((updatedData: CycleData) => {
    console.log("Updated cycleData:", updatedData);
  }, 300); // Adjust delay as needed

  const handleCycleChange = async (option: SelectOption | null) => {
    console.log("Handling cycle change in App", option);
    if (option) {
      let addNewCycle = false;
      let existingCycleId;
      let existingCycle = allCycles.find(
        (cycle) => cycle.Id.toString() === option.value
      );
      if (!existingCycle) {
        console.warn("Creating new cycle: ", option);
        existingCycleId = await mergeCycleInfo({
          Id: 0,
          hospitalId: hospitalId,
          name: option.label,
          cycleDays: 3,
          startDate: new Date().toJSON(),
          createdAt: "",
          createdBy: 0,
          isActive: true,
        });
        console.log("New Cycle id", existingCycleId);
        addNewCycle = true;
      } else {
        existingCycleId = existingCycle.Id;
      }
      let cycleDetail = await getCycleDetail(existingCycleId as number);
      if (cycleDetail) {
        setCurrentCycle(cycleDetail.cycleInfo);
        if (addNewCycle) {
          setAllCycles((prev) => [...prev, cycleDetail!.cycleInfo]);
        }
        setMealDaysList(cycleDetail.mealDaysList);
      }
    } else {
      console.log("Setting current cycle to Undefined");
      setCurrentCycle(undefined);
      setMealDaysList([]);
    }
  };

  const handleCycleDataChange = async (field: string, value: any) => {
    console.log(
      "App handling cycle data change. Field: " + field + " Value: " + value
    );
    let newCycleData: any = { ...currentCycle };
    console.log("New cycle data before change: ", newCycleData);
    let cycleFields = Object.keys(newCycleData);
    console.log("cycleFields: ", cycleFields);
    if (cycleFields.includes(field)) {
      console.log("Found field: " + field);
      newCycleData[field] = value;
      console.log("new cycle data after change: ", newCycleData);
      await mergeCycleInfo(newCycleData);
      setCurrentCycle(newCycleData);
    }
  };

  const handleUpdateMeals = (newMealDaysList: MealDays[]) => {
    console.log("Meal days list updated!", newMealDaysList);
    // setCycleData((prev) => {
    //   const updatedCycleData = {
    //     ...prev,
    //     meals: {
    //       ...prev.meals,
    //       [mealType]: meals,
    //     },
    //   };
    //   debouncedLog(updatedCycleData);
    //   return updatedCycleData;
    // });
  };

  // useEffect(() => {
  //   console.log("Updated cycleData:", cycleData);
  // }, [cycleData]);

  return (
    <div className="min-h-screen p-2">
      <CycleSelector
        allCycles={allCycles}
        currentCycle={currentCycle}
        appCycleSelect={(option) => handleCycleChange(option)}
        appCycleDataChange={(field, value) =>
          handleCycleDataChange(field, value)
        }
      />
      {currentCycle && mealTypes.length > 0 && (
        <div>
          <MealTable
            cycle={currentCycle}
            mealType={mealTypes[0]}
            allMeals={allMeals}
            mealDaysList={mealDaysList.filter(
              (mealDay) => mealDay.mealTypeId === mealTypes[0].Id
            )}
            onUpdate={handleUpdateMeals}
          />
          <MealTable
            cycle={currentCycle}
            mealType={mealTypes[1]}
            allMeals={allMeals}
            mealDaysList={mealDaysList.filter(
              (mealDay) => mealDay.mealTypeId === mealTypes[1].Id
            )}
            onUpdate={handleUpdateMeals}
          />
          <MealTable
            cycle={currentCycle}
            mealType={mealTypes[2]}
            allMeals={allMeals}
            mealDaysList={mealDaysList.filter(
              (mealDay) => mealDay.mealTypeId === mealTypes[2].Id
            )}
            onUpdate={handleUpdateMeals}
          />
        </div>
      )}
    </div>
  );
};

export default App;
