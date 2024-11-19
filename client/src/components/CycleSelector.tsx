import React, { useState } from "react";
import { CycleData } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";

import CreatableSelect from "./CreatableSelect";


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
    console.log(cycleData);
  };

  const [dynamicOptions, setDynamicOptions] = useState(options);

  return (
    <div>
      <div className="grid grid-cols-7 space-x-4 p-4">
        <CreatableSelect
          options={dynamicOptions}
          value={dynamicOptions.find(
            (option) => option.value === cycleData.cycleName
          ) || null}
          onChange={(newOption) => {
            if (
              newOption &&
              !dynamicOptions.some((opt) => opt.value === newOption.value)
            ) {
              setDynamicOptions([...dynamicOptions, newOption]);
            }
            handleInputChange("cycleName", newOption ? newOption.value : "");
          }}
          placeholder="Cycle Name"
        />

        <div></div>

        <div className="col-span-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker", "DatePicker"]}>
              <DatePicker
                defaultValue={dayjs(new Date())}
                onChange={(date: Dayjs | null) =>
                  handleInputChange("startDate", date ? date.toISOString() : "")
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
              "daysInCycle",
              e.target.value ? Number(e.target.value) : 0
            )
          }
          defaultValue={8}
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
