import React, { useState, useEffect } from "react";
import { CycleDetails, MealTable } from "../ChefSpecial";
import { SelectOption } from "./CycleDetails/CycleName/CycleName";
import { CycleData, Meal, MealType } from "../../types";
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
  const [activeOnly, setActiveOnly] = useState(false);
  const [editCycleName, setEditCycleName] = useState(false);
  const [editedCycleName, setEditedCycleName] = useState<string | null>(null);

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
        mealTypeServedTime: "",
        mealTypeNameGlobal: "",
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

      // if (existingCycle.name !== option.label) {
      // console.log("Edit Cycle Name: ", editCycleName);
      // if (editCycleName) {
      //   console.warn("Updating cycle name:", option.label);

      //   await mergeCycleInfo({
      //     ...existingCycle,
      //     name: option.label, // Updated name
      //   });

      //   // Refresh cycle data
      //   existingCycle = await getCycleDetail(existingCycleId).then(
      //     (detail) => detail?.cycleInfo
      //   );

      //   if (existingCycle) {
      //     // Update allCycles with the new cycle name
      //     setAllCycles((prev) =>
      //       prev.map((cycle) =>
      //         cycle.Id === existingCycle!.Id ? existingCycle! : cycle
      //       )
      //     );
      //     setEditCycleName(false);
      //   }
      // }
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

  useEffect(() => {
    if (editCycleName && currentCycle) {
      console.warn("Updating cycle name:", editedCycleName);

      (async () => {
        await mergeCycleInfo({
          ...currentCycle,
          name: editedCycleName, // Updated name
        });

        const updatedCycle = await getCycleDetail(currentCycle.Id).then(
          (detail) => detail?.cycleInfo
        );

        if (updatedCycle) {
          setAllCycles((prev) =>
            prev.map((cycle) =>
              cycle.Id === updatedCycle!.Id ? updatedCycle! : cycle
            )
          );
          setEditCycleName(false); // Reset state after update
          setEditedCycleName(null);

          setCurrentCycle(updatedCycle);
          console.log("set LocalStorage existing");
          localStorage.setItem("selectedCycle", JSON.stringify(updatedCycle)); // Persist selected cycle
        }
      })();
    }
  }, [editCycleName]); // Run when editCycleName changes

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
        setActiveOnly={setActiveOnly}
        hospitalId={hospitalId}
        toggleWeeklyView={toggleWeeklyView}
        editCycleName={editCycleName}
        setEditCycleName={setEditCycleName}
        setEditedCycleName={setEditedCycleName}
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
