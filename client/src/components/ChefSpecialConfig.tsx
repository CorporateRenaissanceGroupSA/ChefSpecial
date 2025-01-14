import React, { useState, useEffect } from "react";
import CycleDetails from "./chefSpecial/cycleDetails/cycleDetails";
import MealTable from "./chefSpecial/mealTable/MealTable";
import { SelectOption } from "./chefSpecial/cycleName/cycleName";
import { CycleData, Meal, MealDays, MealType } from "../types";
import {
  getCycleDetail,
  getCycleList,
  mergeCycleInfo,
  getSelectedMealTypes,
} from "../utils/db-utils";

interface ChefSpecialConfigProps {
  allMeals: Meal[];
  mealTypes: MealType[];
}

const ChefSpecialConfig: React.FC<ChefSpecialConfigProps> = ({allMeals, mealTypes}) => {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [allCycles, setAllCycles] = useState<CycleData[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleData | undefined>(
    undefined
  );
  const [selectedMealTypes, setSelectedMealTypes] = useState<number[]>([
    1, 2, 3,
  ]);

  // // Loads all the Cycles and Meals available for a hospital every time the hospitalId changes
  // useEffect(() => {
  //   getCycleList(hospitalId).then((result) => {
  //     setAllCycles(result);
  //     console.log("All Cycles updated: ", result);
  //   });
  // }, [hospitalId]);

  // Load cycles and restore the selected cycle on component mount
  useEffect(() => {
    const fetchCycles = async () => {
      const result = await getCycleList(hospitalId);
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
          setSelectedMealTypes(
            Array.isArray(selectedMealTypeIds) && selectedMealTypeIds.length
              ? [...new Set([1, 2, 3, ...selectedMealTypeIds])] // Merge defaults
              : [1, 2, 3]
          );
        }
      }
    };

    fetchCycles();
  }, [hospitalId]);

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
      console.log(existingCycle)
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
          servedId: 0,
          served: "",
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
        console.log("set LocalStorage existing")
        localStorage.setItem("selectedCycle", JSON.stringify(existingCycle)); // Persist selected cycle

        const selectedMealTypeIds = await getSelectedMealTypes(
          existingCycle.Id
        );
        setSelectedMealTypes(
          Array.isArray(selectedMealTypeIds) && selectedMealTypeIds.length
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
        // // Retrieve and update selected meal types
        // const selectedMealTypeIds = await getSelectedMealTypes(
        //   existingCycleId as number
        // );
        // console.log("Selected Meal Types:", selectedMealTypeIds);

        // if (
        //   Array.isArray(selectedMealTypeIds) &&
        //   selectedMealTypeIds.length > 0
        // ) {
        //   // Merge default meal types with selected ones
        //   const defaultMealTypes = [1, 2, 3];
        //   const updatedMealTypes = Array.from(
        //     new Set([...defaultMealTypes, ...selectedMealTypeIds])
        //   );
        //   setSelectedMealTypes(updatedMealTypes);
        // } else {
        //   setSelectedMealTypes([1, 2, 3]);
        // }
      } else {
        console.error("Unable to find or create cycle");
      }

    // // deal with case where a cycle is selected
    // let addNewCycle = false;
    // let existingCycleId;
    // let existingCycle = allCycles.find(
    //   (cycle) => cycle.Id.toString() === option.value
    // );
    // if (!existingCycle) {
    //   console.warn("Creating new cycle: ", option);
    //   existingCycleId = await mergeCycleInfo({
    //     Id: 0,
    //     hospitalId: hospitalId,
    //     name: option.label,
    //     cycleDays: 3,
    //     startDate: new Date().toJSON(),
    //     endDate: "null",
    //     createdAt: "",
    //     createdBy: 0,
    //     isActive: true,
    //     description: "",
    //     mealTypeId: 0,
    //     servedId: 0,
    //     served: "",
    //   });
    //   console.log("New Cycle id", existingCycleId);
    //   addNewCycle = true;
    //   setSelectedMealTypes([1, 2, 3]);
    // } else {
    //   existingCycleId = existingCycle.Id;
    // }
    // let cycleDetail = await getCycleDetail(existingCycleId as number);
    // let selectedMealTypeIds = await getSelectedMealTypes(
    //   existingCycleId as number
    // );
    // console.log("selected Meal Types", selectedMealTypeIds);
    // if (cycleDetail) {
    //   setCurrentCycle(cycleDetail.cycleInfo);

    //   if (
    //     Array.isArray(selectedMealTypeIds) &&
    //     selectedMealTypeIds.length > 0
    //   ) {
    //     // Merge default meal types with selected ones
    //     const defaultMealTypes = [1, 2, 3];
    //     const updatedMealTypes = Array.from(
    //       new Set([...defaultMealTypes, ...selectedMealTypeIds])
    //     );

    //     setSelectedMealTypes(updatedMealTypes);
    //   } else {
    //     setSelectedMealTypes([1, 2, 3]);
    //   }
    //   // } else {
    //   //   console.error("Invalid selectedMealTypeIds format", selectedMealTypeIds);
    //   // }

    //   if (addNewCycle) {
    //     setAllCycles((prev) => [...prev, cycleDetail!.cycleInfo]);
    //   }
    // }

    // if (existingCycle) {
    //   setCurrentCycle(existingCycle);
    //   localStorage.setItem("selectedCycle", JSON.stringify(existingCycle)); // Persist selected cycle
    // }

    
  };

  // function to deal with event where cycle data changes
  // const handleCycleDataChange = async (field: string, value: any) => {
  //   console.log(
  //     "App handling cycle data change. Field: " + field + " Value: " + value
  //   );
  //   let newCycleData: any = { ...currentCycle };
  //   console.log("New cycle data before change: ", newCycleData);
  //   let cycleFields = Object.keys(newCycleData);
  //   console.log("cycleFields: ", cycleFields);
  //   if (cycleFields.includes(field)) {
  //     console.log("Found field: " + field);
  //     newCycleData[field] = value;
  //     console.log("new cycle data after change: ", newCycleData);
  //     await mergeCycleInfo(newCycleData);
  //     setCurrentCycle(newCycleData);
  //   }
  // };
    const handleCycleDataChange = async (field: string, value: any) => {
      console.log("Handling cycle data change", field, value);
      const newCycleData:any = { ...currentCycle, [field]: value };
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
