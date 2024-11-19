import React, { useState, useEffect } from "react";
import CycleSelector from "./components/CycleSelector";
import "./App.css";
import { CycleData, Meal } from "./types";
import MealTable from "./components/MealTable";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const App: React.FC = () => {
  const [cycleData, setCycleData] = useState<CycleData>({
    cycleName: "",
    startDate: "",
    daysInCycle: 8,
    meals: [],
  });

  const debouncedLog = debounce((updatedData: CycleData) => {
    console.log("Updated cycleData:", updatedData);
  }, 300); // Adjust delay as needed

  const handleUpdateMeals = (mealType: string, meals: Meal[]) => {
    setCycleData((prev) => {
      const updatedCycleData = {
        ...prev,
        meals: {
          ...prev.meals,
          [mealType]: meals,
        },
      };
      debouncedLog(updatedCycleData);

      return updatedCycleData;
    });
  };

  // useEffect(() => {
  //   console.log("Updated cycleData:", cycleData);
  // }, [cycleData]);

  return (
    <div className="min-h-screen p-2">
      <CycleSelector cycleData={cycleData} setCycleData={setCycleData} />

      <MealTable
        daysInCycle={cycleData.daysInCycle}
        mealType="Breakfast"
        onUpdate={handleUpdateMeals}
      />

      <MealTable
        daysInCycle={cycleData.daysInCycle}
        mealType="Lunch"
        onUpdate={handleUpdateMeals}
      />

      <MealTable
        daysInCycle={cycleData.daysInCycle}
        mealType="Supper"
        onUpdate={handleUpdateMeals}
      />
    </div>
  );
};

export default App;
