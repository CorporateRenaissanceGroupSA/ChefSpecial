import React, { useEffect, useState } from "react";
import { CycleData } from "../types";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";
// import CreatableSelect from "./CreatableSelect";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CreatableSelect, { SelectOption } from "./CreatableSelect";
// import axios from "axios";

const dateFieldTheme = (theme: any) =>
  createTheme({
    ...theme,
    components: {
      MuiStack: {
        // root
        styleOverrides: {
          root: {
            paddingTop: "0px !important",
            overflow: "revert !important",
          },
        },
      },
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
      // label
      MuiFormLabel: {
        styleOverrides: {
          root: {
            transform: "translate(14px, 0px) scale(0.75) !important",
            marginTop: "5px !important",
            fontFamily: "Poppins",
            left: "-4px !important",
            color: "#808080 !important",
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
      // input
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontFamily: "Poppins",
            padding: "25px 10px 5px !important",
          },
        },
      },
      // calendar icon
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fill: "#ccc",
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            paddingTop: "10px !important",
          },
        },
      },
      // Date Calendar
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: "none !important",
            fontFamily: "Poppins !important",
          },
        },
      },
      MuiDateCalendar: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
            boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px !important",
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
            backgroundColor: "#F6F6F6 !important",
            boxShadow: "0 1px 4px 0px rgba(0, 0, 0, 0.16)",
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontFamily: "Poppins",
            top: "-3px !important",
          }
        }
      }
    },
  });



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
      <div className="grid grid-cols-12 space-x-3 p-1">
        <div className="col-span-4">
          <CreatableSelect
            options={allCycleOptions}
            value={currentCycleOption}
            onChange={(newOption) => {
              handleCycleInputChange(newOption);
            }}
            placeholder="Cycle Name"
          />

          {/* <CreatableSelect
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
          /> */}
        </div>

        <div className="col-span-4"></div>

        <div className="col-span-2 flex justify-end">
          <ThemeProvider theme={dateFieldTheme}>
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
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            </LocalizationProvider> */}
          </ThemeProvider>
        </div>

        <div className="col-span-1">
          <ThemeProvider theme={inputFieldTheme}>
            <TextField
              id="filled-number"
              label="Days in Cycle"
              type="number"
              variant="filled"
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
                // "& .MuiInputBase-input": {
                //   padding: "15px 13px", // Focused label color
                // },
              }}
            />
            {/* <TextField
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
            /> */}
          </ThemeProvider>
        </div>

        {/* <div className="col-span-2">
          <MultiSelectDropdown
            options={["Breakfast", "Lunch", "Supper"]}
            selected={cycleData.meals}
            setSelected={(selected) => handleInputChange("meals", selected)}
          />
        </div> */}

        <div className="flex justify-center items-center col-span-1">
          <ViewColumnsIcon
            className="size-12 text-[#FFB600]"
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
