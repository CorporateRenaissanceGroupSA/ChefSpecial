import React, { useEffect, useState } from "react";
import { CycleData } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";

import CreatableSelect, { SelectOption } from "./CreatableSelect";
import axios from "axios";

interface CycleSelectorProps {
  allCycles: CycleData[];
  currentCycle: CycleData | undefined;
  appCycleSelect: (option: SelectOption | null) => void;
  appCycleDataChange: (field: string, value: any) => void;
}

function cycleToOption(cycleData: CycleData | undefined): SelectOption | null {
  if (cycleData) {
    return { label: cycleData!.name, value: cycleData!.Id.toString() };
  } else {
    return null;
  }
}

// const options = [
//   { value: "Spring 2024", label: "Spring2024" },
//   { value: "Winter 2024", label: "Winter024" },
// ];

const CycleSelector: React.FC<CycleSelectorProps> = ({
  allCycles,
  currentCycle,
  appCycleSelect,
  appCycleDataChange,
}) => {
  const [allCycleOptions, setAllCycleOptions] = useState<SelectOption[]>([]);
  const [currentCycleOption, setCurrentCycleOption] =
    useState<SelectOption | null>(null);

  useEffect(() => {
    let newOptions = allCycles.map(
      (cycleData) => cycleToOption(cycleData) as SelectOption
    );
    console.log("Cycle options updated: ", newOptions);
    setAllCycleOptions(newOptions);
  }, [allCycles]);

  useEffect(() => {
    console.log("Changing current cycle option: ", currentCycle);
    setCurrentCycleOption(cycleToOption(currentCycle));
  }, [currentCycle]);

  const handleCycleInputChange = (option: SelectOption | null) => {
    console.log("Detected cycle option change: ", option);
    appCycleSelect(option);
  };

  const handleInputChange = (field: string, value: any) => {
    // setCycleData((prev) => ({ ...prev, [field]: value }));
    console.log("Cycle data change: Field: " + field + " Value: " + value);
    appCycleDataChange(field, value);
  };
  // const [dynamicOptions, setDynamicOptions] = useState(options);

  return (
    <div>
      <div className="grid grid-cols-7 space-x-4 p-4">
        <CreatableSelect
          options={allCycleOptions}
          value={currentCycleOption}
          onChange={(newOption) => {
            handleCycleInputChange(newOption);
          }}
          placeholder="Cycle Name"
        />

        <div></div>

        <div className="col-span-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker", "DatePicker"]}>
              <DatePicker
                defaultValue={dayjs(
                  currentCycle?.startDate || new Date().toJSON()
                )}
                onChange={(date: Dayjs | null) =>
                  handleInputChange("startDate", date ? date.toJSON() : "")
                }
                label="Cycle Start Date"
              />
            </DemoContainer>
          </LocalizationProvider>
        </div>

        <TextField
          id="filled-number"
          label="Days in Cycle"
          type="number"
          variant="standard"
          onChange={(e) =>
            handleInputChange(
              "cycleDays",
              e.target.value ? Number(e.target.value) : 0
            )
          }
          value={currentCycle?.cycleDays}
          placeholder=""
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        {/* <div className="col-span-2">
          <MultiSelectDropdown
            options={["Breakfast", "Lunch", "Supper"]}
            selected={cycleData.meals}
            setSelected={(selected) => handleInputChange("meals", selected)}
          />
        </div> */}

        <div className="col-span-1">
          <ViewColumnsIcon className="size-10" strokeWidth={0.7} />
        </div>
      </div>
      {/* {cycleData.meals.length > 0 && ( */}

      {/* )} */}
    </div>
  );
};

export default CycleSelector;
