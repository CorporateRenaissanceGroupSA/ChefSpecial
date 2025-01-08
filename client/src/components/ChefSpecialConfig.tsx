import React, { useState, useEffect } from "react";
import { Tabs, Grid2, List, ListItem, Box } from "@mui/material";
import CycleSelector from "./CycleSelector";
import MealTable from "./MealTable";
import { SelectOption } from "./CreatableSelect";
import { CycleData, Meal, MealDays, MealType } from "../types";
import {
  getCycleDetail,
  getCycleList,
  getMealsList,
  getMealTypeList,
  mergeCycleInfo,
} from "../utils/db-utils";

const ChefSpecialConfig = () => {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [allCycles, setAllCycles] = useState<CycleData[]>([]);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleData | undefined>(
    undefined
  );

  // loads all the mealTypes once when the app is loaded
  useEffect(() => {
    getMealTypeList().then((result) => {
      setMealTypes(result);
      console.log("Meal Types updated: ", result);
    });
  }, []);

  // Loads all the Cycles and Meals available for a hospital every time the hospitalId changes
  useEffect(() => {
    getCycleList(hospitalId).then((result) => {
      setAllCycles(result);
      console.log("All Cycles updated: ", result);
    });
    getMealsList(hospitalId).then((result) => {
      setAllMeals(result);
      console.log("All meals updated.", result);
    });
  }, [hospitalId]);

  // function to deal with the event when a different cycle is selected by the user
  const handleCycleChange = async (option: SelectOption | null) => {
    console.log("Handling cycle change in App", option);
    // deal with case where no cycle is selected
    if (!option) {
      console.log("Setting current cycle to Undefined");
      setCurrentCycle(undefined);
      return;
    }

    // deal with case where a cycle is selected
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
    }
  };

  // function to deal with event where cycle data changes
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

  // const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setSelectedTab(newValue);
  // };
  return (
      <div className="min-h-screen p-2 bg-white">
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
            />
            <MealTable
              cycle={currentCycle}
              mealType={mealTypes[1]}
              allMeals={allMeals}
            />
            <MealTable
              cycle={currentCycle}
              mealType={mealTypes[2]}
              allMeals={allMeals}
            />
          </div>
        )}
      </div>
  );
};

export default ChefSpecialConfig;
