import React, { useState } from "react";
import CycleSelector from "./components/CycleSelector";
import "./App.css";
import { CycleData, Meal } from "./types";

const App: React.FC = () => {
  const [cycleData, setCycleData] = useState<CycleData>({
    cycleName: "",
    startDate: "",
    daysInCycle: 8,
    mealTypes: ["Breakfast"],
  });

  return (
    <div className="min-h-screen p-2">
      <CycleSelector cycleData={cycleData} setCycleData={setCycleData} />
    </div>
  );
};

export default App;
