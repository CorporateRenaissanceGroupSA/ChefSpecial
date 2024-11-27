import React, { useState, useEffect } from "react";
import CycleSelector from "./components/CycleSelector";
import "./App.css";
import { CycleData, Meal } from "./types";
import MealTable from "./components/MealTable";
import axios from "axios";
import { SelectOption } from "./components/CreatableSelect";

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
    axios
      .post(`${process.env.REACT_APP_API}/cycle/list`, {
        hospitalId: hospitalId,
      })
      .then((response) => {
        console.log("Cycle response: ", response);
        if (response.statusText === "OK") {
          setAllCycles(response.data);
          console.log("All Cycles updated: ", response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [hospitalId]);

  const debouncedLog = debounce((updatedData: CycleData) => {
    console.log("Updated cycleData:", updatedData);
  }, 300); // Adjust delay as needed

  const handleCycleChange = (option: SelectOption | null) => {
    console.log("Handling cycle change in App", option);
    if (option) {
      let cycleFound = allCycles.find(
        (cycle) => cycle.Id.toString() == option.value
      );
      if (cycleFound) {
        debouncedLog(cycleFound);
        setCurrentCycle(cycleFound);
      } else {
        console.warn("COuld not find cycle option: ", option);
      }
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
