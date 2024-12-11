import React, { useState } from "react";
import { CycleData } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";
import CreatableSelect from "./CreatableSelect";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const dateFieldTheme = (theme: any) =>
  createTheme({
    ...theme,
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: "5px",
            border: "none",
            borderLeft: "3px solid #FFB600",
            backgroundColor: "#F6F6F6",
            boxShadow: "0 1px 4px 0px rgba(0, 0, 0, 0.16)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            border: "none",
          },
        },
      },
      MuiStack: {
        styleOverrides: {
          root: {
            paddingTop: "0px !important",
            overflow: "revert !important",
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            transform: "translate(14px, 0px) scale(0.75) !important",
          },
          focused: {
            "&:focus": {
              color: "#808080",
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fill: "#ccc",
          },
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          today: {
            borderWidth: "1px",
            borderColor: "#FFB600 !important",
            border: "1px solid",
          },
        },
      },
    },
  });

const inputFieldTheme = (theme: any) =>
  createTheme({
    ...theme,
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: "5px !important",
            border: "none",
            borderLeft: "3px solid #FFB600",
            backgroundColor: "#F6F6F6",
            boxShadow: "0 1px 4px 0px rgba(0, 0, 0, 0.16)",
          },
        },
      },
    },
  });

interface CycleSelectorProps {
  cycleData: CycleData;
  setCycleData: React.Dispatch<React.SetStateAction<CycleData>>;
}

const options = [
  { value: "Spring 2024", label: "Spring 2024" },
  { value: "Winter 2024", label: "Winter 2024" },
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
      <div className="grid grid-cols-12 space-x-4 p-4 pb-12">
        <div className="col-span-4">
          <CreatableSelect
            options={dynamicOptions}
            value={
              dynamicOptions.find(
                (option) => option.value === cycleData.cycleName
              ) || null
            }
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
        </div>

        <div className="col-span-3"></div>

        <div className="col-span-2 flex justify-end">
          <ThemeProvider theme={dateFieldTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker", "DatePicker"]}>
                <DatePicker
                  label="Cycle Date"
                  defaultValue={dayjs(new Date())}
                  onChange={(date: Dayjs | null) =>
                    handleInputChange(
                      "startDate",
                      date ? date.toISOString() : ""
                    )
                  }
                  slotProps={{
                    day: {
                      sx: {
                        "&.MuiPickersDay-root.Mui-selected": {
                          backgroundColor: "#FFB600",
                        },
                      },
                    },
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
          </ThemeProvider>
        </div>

        <div className="col-span-2">
          <ThemeProvider theme={inputFieldTheme}>
            <TextField
              id="filled-number"
              label="Days in Cycle"
              type="number"
              variant="filled"
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
              sx={{
                "& .MuiFilledInput-root": {
                  "&:before": {
                    borderBottom: "none", // Remove default border
                  },
                  "&:after": {
                    borderBottom: "none", // Remove focused border
                  },
                  "&:hover:not(.Mui-disabled):before": {
                    borderBottom: "none", // Remove hover effect
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#808080", // Default label color
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#808080", // Focused label color
                },
              }}
            />
          </ThemeProvider>
        </div>

        {/* <div className="col-span-2">
          <MultiSelectDropdown
            options={["Breakfast", "Lunch", "Supper"]}
            selected={cycleData.meals}
            setSelected={(selected) => handleInputChange("meals", selected)}
          />
        </div> */}

        <div className="flex justify-center items-center">
          <ViewColumnsIcon
            className="size-10 text-[#FFB600]"
            strokeWidth={0.7}
          />
        </div>
      </div>
      {/* {cycleData.meals.length > 0 && ( */}

      {/* )} */}
    </div>
  );
};

export default CycleSelector;
