import React, { useEffect, useState } from "react";
import { CycleData, MealType } from "../../../types";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
// import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CycleName, { SelectOption } from "./CycleName/CycleName";
import CycleMealType from "./CycleMealType/CycleMealType";
import FormControlLabel from "@mui/material/FormControlLabel";
// import Switch from "@mui/material/Switch";
import { getCycleList } from "../../../utils/db-utils";
import { Button, TextField, Switch } from "@mui/material";

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
      MuiSelect: {
        styleOverrides: {
          nativeInput: {
            fontFamily: "Poppins !important",
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
          },
        },
      },
    },
  });

interface CycleDetailsProps {
  allCycles: CycleData[];
  currentCycle: CycleData | undefined;
  appCycleSelect: (option: SelectOption | null) => void;
  appCycleDataChange: (field: string, value: any) => void;
  mealTypes: MealType[];
  setSelectedMealTypes: any;
  selectedMealTypes: any;
  activeOnly: boolean;
  setActiveOnly: (value: boolean) => void;
  hospitalId: number;
  toggleWeeklyView: () => void;
}

function cycleToOption(cycleData: CycleData | undefined): SelectOption | null {
  if (cycleData) {
    // Format dates to DD/MM/YYYY
    const formattedStartDate = cycleData.startDate
      ? dayjs(cycleData.startDate).format("DD/MM/YYYY")
      : "N/A";
    const formattedEndDate = cycleData.endDate
      ? dayjs(cycleData.endDate).format("DD/MM/YYYY")
      : "N/A";

    return {
      label: `${cycleData.name} (${formattedStartDate} - ${formattedEndDate})`,
      value: cycleData!.Id.toString(),
    };
  } else {
    return null;
  }
}

const CycleDetails: React.FC<CycleDetailsProps> = ({
  allCycles,
  currentCycle,
  appCycleSelect,
  appCycleDataChange,
  mealTypes,
  setSelectedMealTypes,
  selectedMealTypes,
  activeOnly,
  setActiveOnly, // Pass setter to update activeOnly
  hospitalId,
  toggleWeeklyView,
}) => {
  const [allCycleOptions, setAllCycleOptions] = useState<SelectOption[]>([]);
  const [currentCycleOption, setCurrentCycleOption] =
    useState<SelectOption | null>(null);

  const [startDate, setStartDate] = useState<Dayjs | null>(
    currentCycle?.startDate ? dayjs(currentCycle.startDate) : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    currentCycle?.endDate ? dayjs(currentCycle.endDate) : null
  );

  const [cleared, setCleared] = React.useState(false);

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
    if (currentCycle?.startDate) setStartDate(dayjs(currentCycle.startDate));
    if (currentCycle?.endDate) {
      setEndDate(dayjs(currentCycle.endDate));
    } else {
      setEndDate(null); // Reset endDate if currentCycle does not have one
    }

    if (!currentCycle) {
      setSelectedMealTypes([1, 2, 3]); // Default meal types for new cycles
    }
  }, [currentCycle, setSelectedMealTypes]);

  const handleCycleInputChange = (option: SelectOption | null) => {
    console.log("Detected cycle option change: ", option);
    appCycleSelect(option);
  };

  const handleInputChange = (field: string, value: any) => {
    // setCycleData((prev) => ({ ...prev, [field]: value }));
    console.log("Cycle data change: Field: " + field + " Value: " + value);
    appCycleDataChange(field, value);
  };

  // End date datepicker clearing value
  useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [cleared]);

  useEffect(() => {
    // Load activeOnly state from localStorage on mount
    const storedActiveOnly = localStorage.getItem("activeOnly");
    if (storedActiveOnly !== null) {
      setActiveOnly(storedActiveOnly === "true");
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    const newActiveOnly = !checked;
    setActiveOnly(newActiveOnly);
    localStorage.setItem("activeOnly", String(newActiveOnly)); // Persist state
  };

  return (
    <div>
      <div className="grid grid-cols-12 space-x-3 p-1">
        <div className="col-span-1 flex">
          <FormControlLabel
            label={`${activeOnly ? "Show" : "Hide"} Inactive Cycles`}
            control={
              <Switch
                disabled={hospitalId ? false : true}
                checked={!activeOnly} // Inverse because `activeOnly` implies hiding inactive
                onChange={(e) => handleToggle(e.target.checked)} // Update state on toggle
              />
            }
            labelPlacement="bottom"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#33cd33",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#33cd33",
              },
              "& .MuiFormControlLabel-label": {
                fontFamily: "Poppins",
                fontSize: "8px",
              },
            }}
          />
        </div>
        <div className="col-span-3 ">
          <CycleName
            options={allCycleOptions}
            value={currentCycleOption}
            onChange={(newOption) => {
              handleCycleInputChange(newOption);
            }}
            placeholder="Cycle Name"
            hospitalId={hospitalId}
          />
        </div>

        <div className="col-span-2">
          <ThemeProvider theme={inputFieldTheme}>
            <CycleMealType
              options={mealTypes}
              selected={selectedMealTypes}
              setSelected={setSelectedMealTypes}
              hospitalId={hospitalId}
            />
          </ThemeProvider>
        </div>

        <div className="col-span-2 flex justify-end">
          <ThemeProvider theme={dateFieldTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disabled={hospitalId ? false : true}
                defaultValue={dayjs(
                  currentCycle?.startDate || new Date().toJSON()
                )}
                value={startDate}
                onChange={(date: Dayjs | null) => {
                  setStartDate(date);
                  handleInputChange("startDate", date ? date.toJSON() : "");
                }}
                label="Cycle Start Date"
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
          </ThemeProvider>
        </div>

        <div className="col-span-2">
          <ThemeProvider theme={dateFieldTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disabled={hospitalId ? false : true}
                onChange={(date: Dayjs | null) => {
                  setEndDate(date);
                  handleInputChange(
                    "endDate",
                    date ? date.startOf("day").toISOString() : ""
                  );
                }}
                value={endDate}
                slotProps={{
                  field: { clearable: true, onClear: () => setCleared(true) },
                }}
                label="Cycle End Date"
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
          </ThemeProvider>
        </div>

        <div className="col-span-1">
          <ThemeProvider theme={inputFieldTheme}>
            <TextField
              id="filled-number"
              label="Days in Cycle"
              type="number"
              variant="filled"
              disabled={hospitalId ? false : true}
              onChange={(e) =>
                handleInputChange(
                  "cycleDays",
                  e.target.value ? Number(e.target.value) : 0
                )
              }
              value={currentCycle?.cycleDays}
              InputProps={{ inputProps: { min: 0, max: 21 } }}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& .MuiFilledInput-root": {
                  "&:before": {
                    borderBottom: "none", // Remove default border
                    borderBottomStyle: "none",
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

        <div className="flex justify-center items-center">
          <Button
            disabled={hospitalId ? false : true}
            onClick={toggleWeeklyView}
            sx={{
              minWidth: "24px",
              padding: 0,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <ViewColumnsIcon
              className="size-12 text-[#FFB600]"
              strokeWidth={0.7}
            />
          </Button>
        </div>
      </div>
      {/* {cycleData.meals.length > 0 && ( */}

      {/* )} */}
    </div>
  );
};

export default CycleDetails;
