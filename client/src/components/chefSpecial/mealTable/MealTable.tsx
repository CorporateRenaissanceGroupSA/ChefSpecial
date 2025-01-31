import React, { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableHead,
  Paper,
  TableCell,
  Typography,
  Checkbox,
  Button,
  tableCellClasses,
  checkboxClasses,
} from "@mui/material";

import MealDropdown from "../CycleDetails/MealDropdown/MealDropdown";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
// import { Option } from "../types";
// import { CycleData } from "../types";
import { CycleData, Meal, MealDays, MealType, Option } from "../../../types";
import { getCycleMealDays, mergeMealDay } from "../../../utils/db-utils";
import * as Icon from "react-icons/fi";
import CheckboxCustom from "react-custom-checkbox";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F6F6F6",
    color: "#656565",
    borderBottom: "none",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "& td": {
    borderBottom: `1px solid #F1F1F1`,
  },
}));

// interface Meal {
//   name: string;
//   days: boolean[];
// }

interface MealTableProps {
  cycle: CycleData;
  mealType: MealType;
  allMeals: Meal[];
  hospitalId: number | null;
}

interface RowData {
  rowId: number;
  mealId: number;
  mealName: string;
  days: boolean[];
}

function rowsFromMealDays(mealDaysList: MealDays[]): RowData[] {
  let rowId = 0;
  let result = mealDaysList.map((mealDaysItem) => {
    rowId++;
    return {
      rowId,
      mealId: mealDaysItem.mealId,
      mealName: mealDaysItem.mealName,
      days: mealDaysItem.days,
    };
  });
  return result;
}

function adjustRowData(data: boolean[], days: number) {
  if (data.length > days) {
    return data.slice(0, days);
  }
  return [...data, ...Array(days - data.length).fill(false)];
}

const MealTable: React.FC<MealTableProps> = ({
  cycle,
  mealType,
  allMeals,
  hospitalId,
}) => {
  // State to manage rows
  const [rows, setRows] = useState<RowData[]>([]);

  // reset rows when hospitalId changes
  useEffect(() => {
    setRows([]);
  }, [hospitalId]);

  // load all the meals and active days for the currently selected cycle and place the data into rows
  useEffect(() => {
    console.log(cycle.Id);
    getCycleMealDays(cycle.Id, cycle.cycleDays, mealType.Id).then((result) => {
      if (result && result.mealDaysList) {
        let validMealDaysList = result.mealDaysList.filter(
          (mealDays) => mealDays.mealName && mealDays.days.some((day) => day)
        );
        let newRows = rowsFromMealDays(validMealDaysList);
        console.log("New rows: ", newRows);
        setRows(newRows);
      } else {
        setRows([]);
      }
    });
  }, [cycle.Id, cycle.cycleDays, mealType.Id]);

  // Update row data when daysInCycle changes
  useEffect(() => {
    // TODO check with user whether they are sure to lose data when days are reduced or show error that days that are active cannot be deleted.
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        data: adjustRowData(row.days, cycle.cycleDays),
      }))
    );
  }, [cycle.cycleDays]);

  // function to add a new row to the cycle
  const handleAddRow = () => {
    console.log("Add row handler called.");
    setRows((prevRows) => [
      ...prevRows,
      {
        rowId: prevRows.length + 1,
        mealId: 0,
        mealName: "",
        days: Array(cycle.cycleDays).fill(false),
      },
    ]);
  };

  // function to handle the event when a checkbox is clicked/changed
  const handleCheckboxChange = async (
    currentRow: RowData,
    dayIndex: number
  ) => {
    console.log("Check box handler called.", currentRow.rowId, dayIndex);

    // update rows data for display
    currentRow.days = currentRow.days.map((checked: boolean, index: number) =>
      index === dayIndex ? !checked : checked
    );
    setRows((prevRows) =>
      prevRows.map((row) => (row.rowId === currentRow.rowId ? currentRow : row))
    );
    // update DB data
    await mergeMealDay(
      cycle.Id,
      mealType.Id,
      currentRow.mealId,
      dayIndex,
      currentRow.days[dayIndex]
    );
  };

  // function to handle event where the meal for a row has changed
  const handleMealChange = async (
    currentRow: RowData,
    newMealId: number,
    newMealName: string
  ) => {
    console.log(
      "Meal change handler called.",
      currentRow,
      newMealId,
      newMealName
    );
    console.log("Rows before change: ", rows);
    // first set all days as false for the old row in the DB
    if (currentRow.mealId && currentRow.days) {
      let index = 0;
      while (index < currentRow.days.length) {
        await mergeMealDay(
          cycle.Id,
          mealType.Id,
          currentRow.mealId,
          index,
          false
        );
        index++;
      }
    }
    // set row meal Id and name to teh new value
    currentRow.mealId = newMealId;
    currentRow.mealName = newMealName;
    // update the DB with new meal info
    if (newMealId && currentRow.days) {
      let index = 0;
      while (index < currentRow.days.length) {
        await mergeMealDay(
          cycle.Id,
          mealType.Id,
          currentRow.mealId,
          index,
          currentRow.days[index]
        );
        index++;
      }
    }
    // update rows with new meal info for display
    let newRows = rows.map((prevRow) =>
      prevRow.rowId === currentRow.rowId ? currentRow : prevRow
    );
    console.log("Rows after change: ", newRows);
    setRows(newRows);
  };

  const dayHeaders = Array.from(
    { length: cycle.cycleDays },
    (_, i) => `Day ${i + 1}`
  );

  return (
    <div className="px-3">
      <Paper
        sx={{
          width: "100%",
          boxShadow: "none",
          overflow: "hidden",
          borderRadius: "5px",
        }}
      >
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table size="small">
            <caption style={{ padding: "5px" }}>
              <Button
                onClick={handleAddRow}
                sx={{
                  minWidth: "37px",
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                <PlusCircleIcon className="size-5 text-[#FFB600]" />
              </Button>
            </caption>
            <TableHead>
              <TableRow>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  {mealType.name}
                </StyledTableCell>
                {dayHeaders.map((day, index) => (
                  <StyledTableCell
                    key={index}
                    align="center"
                    sx={{ fontFamily: "Regular" }}
                  >
                    {day}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <StyledTableRow key={row.rowId}>
                  <TableCell>
                    <MealDropdown
                      allMeals={allMeals}
                      mealTypeId={mealType.Id}
                      selectedMeal={{
                        Id: row.mealId,
                        name: row.mealName,
                        description: "",
                        mealTypeId: 0,
                        mealTypes: [],
                        servedId: 0,
                        isActive: true,
                      }}
                      onChange={(newMeal) =>
                        handleMealChange(
                          row,
                          newMeal ? newMeal.Id : 0,
                          newMeal ? newMeal.name : ""
                        )
                      }
                    />
                  </TableCell>
                  {row.days.map((checked, dayIndex) => (
                    <TableCell
                      key={dayIndex}
                      align="justify"
                      className="mealTable-day"
                    >
                      <CheckboxCustom
                        icon={<Icon.FiCheck color="#26ff00" size={15} />}
                        checked={checked}
                        onChange={() => handleCheckboxChange(row, dayIndex)}
                        borderColor="#D9D9D9"
                        borderRadius={5}
                        style={{ boxShadow: "opx 1px 4px rgba(0, 0, 0, 0.16)" }}
                      />
                    </TableCell>
                  ))}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default MealTable;
