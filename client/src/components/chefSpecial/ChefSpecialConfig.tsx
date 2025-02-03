import React, { useState, useEffect } from "react";
import { CycleDetails, MealTable } from "../ChefSpecial";
// import CycleDetails from "../../Components/Specific/ChefSpecial/CycleDetails/CycleDetails";
// import MealTable from "../../Components/Specific/ChefSpecial/MealTable/MealTable";
import { SelectOption } from "./CycleDetails/CycleName/CycleName";
import { CycleData, Meal, MealDays, MealType } from "../../types";
import {
  getCycleDetail,
  getCycleList,
  mergeCycleInfo,
  getSelectedMealTypes,
  getMealsList,
} from "../../utils/db-utils";

interface ChefSpecialConfigProps {
  allMeals: Meal[];
  setAllMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  mealTypes: MealType[];
  hospitalId: number | null;
  toggleWeeklyView: () => void;
}

const ChefSpecialConfig: React.FC<ChefSpecialConfigProps> = ({
  allMeals,
  setAllMeals,
  mealTypes,
  hospitalId,
  toggleWeeklyView,
}) => {
  const [allCycles, setAllCycles] = useState<CycleData[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleData | undefined>(
    undefined
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<number[]>([
    1, 2, 3,
  ]);
  const [activeOnly, setActiveOnly] = useState(true); // Add state for the switch

  useEffect(() => {
    if (hospitalId) {
      console.log("Update meals list");
      getMealsList(hospitalId).then(setAllMeals);
    }
  }, [hospitalId]);

  useEffect(() => {
    const storedCycle = localStorage.getItem("selectedCycle");

    // If there's a stored cycle and its hospitalId matches the new one, do nothing
    if (storedCycle) {
      const parsedCycle = JSON.parse(storedCycle);
      if (parsedCycle.hospitalId === hospitalId) {
        return;
      }
    }

    // Only reset if hospitalId actually changes
    setCurrentCycle(undefined);
    setSelectedMealTypes([1, 2, 3]);
    localStorage.removeItem("selectedCycle");
  }, [hospitalId]);

  // Load cycles and restore the selected cycle on component mount
  useEffect(() => {
    console.log("updated HospitalId: ", hospitalId);
    if (hospitalId != null) {
      const fetchCycles = async () => {
        const result = await getCycleList(hospitalId, activeOnly);
        setAllCycles(result);

        // Restore the persisted cycle from local storage
        const storedCycle = localStorage.getItem("selectedCycle");
        if (storedCycle) {
          const parsedCycle = JSON.parse(storedCycle);
          const existingCycle = result.find(
            (cycle) => cycle.Id === parsedCycle.Id
          );
          if (existingCycle) {
            setCurrentCycle(existingCycle);

            // Restore meal types
            const selectedMealTypeIds = await getSelectedMealTypes(
              existingCycle.Id
            );
            console.log("updated selected Meal Types: ", selectedMealTypeIds);
            setSelectedMealTypes(
              Array.isArray(selectedMealTypeIds) && selectedMealTypeIds.length
                ? [...new Set([1, 2, 3, ...selectedMealTypeIds])] // Merge defaults
                : [1, 2, 3]
            );
          }
        }
      };
      fetchCycles();
    }
  }, [hospitalId, activeOnly]);

  // function to deal with the event when a different cycle is selected by the user
  const handleCycleChange = async (option: SelectOption | null) => {
    console.log("Handling cycle change in App", option);
    // deal with case where no cycle is selected
    if (!option) {
      console.log("Setting current cycle to Undefined");
      setCurrentCycle(undefined);
      setSelectedMealTypes([1, 2, 3]);
      localStorage.removeItem("selectedCycle"); // Clear local storage
      return;
    }

    let existingCycle = allCycles.find(
      (cycle) => cycle.Id.toString() === option.value
    );
    console.log(existingCycle);
    let existingCycleId: number | undefined;

    if (!existingCycle) {
      console.warn("Creating new cycle: ", option);
      const existingCycleId = await mergeCycleInfo({
        Id: 0,
        hospitalId: hospitalId,
        name: option.label,
        cycleDays: 3,
        startDate: new Date().toJSON(),
        endDate: "null",
        createdAt: "",
        createdBy: 0,
        isActive: true,
        description: "",
        mealTypeId: 0,
        mealTypes: [],
        mealTypeTime: "",
        servedId: 0,
        served: "",
        itemIsActive: true,
      });
      existingCycle = await getCycleDetail(existingCycleId as number).then(
        (detail) => detail?.cycleInfo
      );
      if (existingCycle) {
        setAllCycles((prev) => [...prev, existingCycle!]);
      }
    } else {
      existingCycleId = existingCycle.Id;
    }

    if (existingCycle) {
      setCurrentCycle(existingCycle);
      console.log("set LocalStorage existing");
      localStorage.setItem("selectedCycle", JSON.stringify(existingCycle)); // Persist selected cycle

      const selectedMealTypeIds = await getSelectedMealTypes(existingCycle.Id);
      setSelectedMealTypes(
        Array.isArray(selectedMealTypeIds) && selectedMealTypeIds
          ? [...new Set([1, 2, 3, ...selectedMealTypeIds])]
          : [1, 2, 3]
      );

      // Fetch selected meal types for the cycle
      try {
        const selectedMealTypeIds = await getSelectedMealTypes(
          existingCycleId as number
        );
        console.log("Selected Meal Types Retrieved:", selectedMealTypeIds);

        if (
          Array.isArray(selectedMealTypeIds) &&
          selectedMealTypeIds.length > 0
        ) {
          // Merge default meal types with selected ones
          const defaultMealTypes = [1, 2, 3];
          const updatedMealTypes = Array.from(
            new Set([...defaultMealTypes, ...selectedMealTypeIds])
          );
          setSelectedMealTypes(updatedMealTypes);
          console.log("Updated Meal Types:", updatedMealTypes);
        } else {
          console.warn(
            "No specific meal types found for this cycle, defaulting."
          );
          setSelectedMealTypes([1, 2, 3]);
        }
      } catch (error) {
        console.error("Error retrieving selected meal types:", error);
        setSelectedMealTypes([1, 2, 3]); // Fallback to defaults in case of error
      }
    } else {
      console.error("Unable to find or create cycle");
    }
  };
  const handleCycleDataChange = async (field: string, value: any) => {
    console.log("Handling cycle data change", field, value);
    const newCycleData: any = { ...currentCycle, [field]: value };
    setCurrentCycle(newCycleData as CycleData);
    await mergeCycleInfo(newCycleData);
    localStorage.setItem("selectedCycle", JSON.stringify(newCycleData)); // Update persisted cycle
  };

  return (
    <div className="min-h-screen p-2 bg-white">
      <CycleDetails
        allCycles={allCycles}
        currentCycle={currentCycle}
        appCycleSelect={(option) => handleCycleChange(option)}
        appCycleDataChange={(field, value) =>
          handleCycleDataChange(field, value)
        }
        mealTypes={mealTypes}
        selectedMealTypes={selectedMealTypes}
        setSelectedMealTypes={setSelectedMealTypes}
        activeOnly={activeOnly}
        setActiveOnly={setActiveOnly} // Pass setter to update activeOnly
        hospitalId={hospitalId}
        toggleWeeklyView={toggleWeeklyView}
      />
      {currentCycle && selectedMealTypes.length > 0 && (
        <div>
          {selectedMealTypes.map((mealTypeId) => {
            const mealType = mealTypes.find((mt) => mt.Id === mealTypeId);
            return (
              mealType && (
                <MealTable
                  key={mealTypeId}
                  cycle={currentCycle}
                  mealType={mealType!}
                  allMeals={allMeals}
                  hospitalId={hospitalId}
                />
              )
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChefSpecialConfig;
