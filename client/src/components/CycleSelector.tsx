import React from "react";
import Creatable from "react-select/creatable";
import { CycleData } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";

interface CycleSelectorProps {
  cycleData: CycleData;
  setCycleData: React.Dispatch<React.SetStateAction<CycleData>>;
}

const options = [
  { value: "Spring 2024", label: "Spring2024" },
  { value: "Winter 2024", label: "Winter024" },
];

const CycleSelector: React.FC<CycleSelectorProps> = ({
  cycleData,
  setCycleData,
}) => {
  const handleInputChange = (field: string, value: any) => {
    setCycleData((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <div className="flex space-x-4 p-4">
      <Creatable options={options} />

      <input
        type="date"
        className="p-2 border rounded-lg"
        value={cycleData.startDate}
        onChange={(e) => handleInputChange("startDate", e.target.value)}
      />

      <input
        type="number"
        className="p-2 border rounded-lg"
        value={cycleData.daysInCycle}
        onChange={(e) =>
          handleInputChange("daysInCycle", Number(e.target.value))
        }
        min="1"
      />

      <MultiSelectDropdown
        selected={cycleData.mealTypes}
        setSelected={(selected) => handleInputChange("mealTypes", selected)}
        options={["Breakfast", "Lunch", "Supper"]}
      />
    </div>
  );
};

export default CycleSelector;
