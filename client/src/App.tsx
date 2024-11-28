import React, { useState, useEffect } from "react";
import CycleSelector from "./components/CycleSelector";
import "./App.css";
import { CycleData, Meal } from "./types";
import MealTable from "./components/MealTable";
import { SelectOption } from "./components/CreatableSelect";
import { getCycleList, mergeCycle } from "./utils/db-utils";

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
  const [currentCycle, setCurrentCycle] = useState<CycleData | undefined>(
    undefined
  );

  useEffect(() => {
    let path = process.env.REACT_APP_API;
    console.log("Path: ", path);
    console.log();
    getCycleList(hospitalId).then((result) => {
      setAllCycles(result);
      console.log("All Cycles updated: ", result);
    });
  }, [hospitalId]);

  const debouncedLog = debounce((updatedData: CycleData) => {
    console.log("Updated cycleData:", updatedData);
  }, 300); // Adjust delay as needed

  const handleCycleChange = async (option: SelectOption | null) => {
    console.log("Handling cycle change in App", option);
    if (option) {
      let cycleFound = allCycles.find(
        (cycle) => cycle.Id.toString() === option.value
      );
      if (cycleFound) {
        console.log("Cycle found: ", cycleFound);
        debouncedLog(cycleFound);
        setCurrentCycle(cycleFound);
      } else {
        console.warn("Creating new cycle: ", option);
        let newCycle = await mergeCycle({
          Id: 0,
          hospitalId: hospitalId,
          name: option.label,
          cycleDays: 3,
          startDate: new Date().toJSON(),
          createdAt: "",
          createdBy: 0,
          isActive: true,
        });
        console.log("New Cycle merged...", newCycle);
        setCurrentCycle(newCycle);
        if (newCycle) {
          setAllCycles((prev) => [...prev, newCycle as CycleData]);
        }
      }
    } else {
      console.log("Setting current cycle to Undefined");
      setCurrentCycle(undefined);
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
      let newCycle = await mergeCycle(newCycleData);
      console.log("New cycle data returned: ", newCycle);
      setCurrentCycle(newCycle);
    }
  };

  const handleUpdateMeals = (mealType: string, meals: Meal[]) => {
    console.log("Meal updated!");
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

      <MealTable
        daysInCycle={currentCycle?.cycleDays || 0}
        mealType="Breakfast"
        onUpdate={handleUpdateMeals}
      />

      <MealTable
        daysInCycle={currentCycle?.cycleDays || 0}
        mealType="Lunch"
        onUpdate={handleUpdateMeals}
      />

      <MealTable
        daysInCycle={currentCycle?.cycleDays || 0}
        mealType="Supper"
        onUpdate={handleUpdateMeals}
      />
    </div>
  );
};

export default App;
