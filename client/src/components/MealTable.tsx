import React, { useState, useEffect, useRef } from "react";
import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableHead,
  Paper,
  TableCell,
  Checkbox,
  Button,
} from "@mui/material";

import MealDropdown from "./MealDropdown";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CycleData, Meal, MealDays, MealType, Option } from "../types";

interface MealTableProps {
  cycle: CycleData;
  mealType: MealType;
  allMeals: Meal[];
  mealDaysList: MealDays[];
  onUpdate: (newMealDaysList: MealDays[]) => void;
}

interface RowData {
  rowId: number;
  mealId: number;
  mealName: string;
  days: boolean[];
}

export const options: Option[] = [
  { value: 1, label: "Macon & Eggs" },
  { value: 2, label: "Oat Muffin" },
  { value: 3, label: "Chicken Pie" },
];

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
  mealDaysList,
  onUpdate,
}) => {
  // State to manage rows
  const [rows, setRows] = useState<RowData[]>(rowsFromMealDays(mealDaysList));

  // Update row data when daysInCycle changes
  useEffect(() => {
    // TODO check with user whether they are sure to lose data when days are reduced
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        data: adjustRowData(row.days, cycle.cycleDays),
      }))
    );
  }, [cycle.cycleDays]);

  const prevMealsRef = useRef<MealDays[]>([]);

  // Notify parent when row data changes
  useEffect(() => {
    const validMeals = rows
      .filter((row) => row.mealName && row.days.some((day) => day)) // Only include rows with a meal name and at least one checked day
      .map((row) => ({
        name: row.mealName,
        days: row.days,
      }));
    // onUpdate(mealType, validMeals);
  }, [rows]);

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

  const handleCheckboxChange = (rowId: number, dayIndex: number) => {
    console.log("Check box handler called.", rowId, dayIndex);
    setRows((prevRows) =>
      prevRows.map((row: RowData) =>
        row.mealId === rowId
          ? {
              ...row,
              days: row.days.map((checked: boolean, index: number) =>
                index === dayIndex ? !checked : checked
              ),
            }
          : row
      )
    );
  };

  const handleMealChange = (
    rowId: number,
    mealId: number,
    mealName: string
  ) => {
    console.log("Meal change handler called.", rowId, mealId, mealName);
    // setRows((prevRows) =>
    //   prevRows.map((row) => (row.id === rowId ? { ...row, mealName } : row))
    // );
  };

  const dayHeaders = Array.from(
    { length: cycle.cycleDays },
    (_, i) => `Day ${i + 1}`
  );

  return (
    <div className="p-4">
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <caption>
            <Button onClick={handleAddRow}>
              <PlusCircleIcon className="size-5" />
            </Button>
          </caption>
          <TableHead>
            <TableRow>
              <TableCell width="20%">{mealType.name}</TableCell>
              {dayHeaders.map((day, index) => (
                <TableCell key={index} align="center">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.rowId}>
                <TableCell>
                  <MealDropdown
                    allMeals={allMeals}
                    selectedMeal={{ Id: row.mealId, name: row.mealName }}
                    onChange={(newMeal) =>
                      handleMealChange(
                        row.rowId,
                        newMeal ? newMeal.Id : 0,
                        newMeal ? newMeal.name : ""
                      )
                    }
                  />
                </TableCell>
                {row.days.map((checked, dayIndex) => (
                  <TableCell key={dayIndex} align="center">
                    <Checkbox
                      checked={checked}
                      onChange={() =>
                        handleCheckboxChange(row.mealId, dayIndex)
                      }
                    />
                    {/* Placeholder cell content, can be updated to display other data */}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* <TableRow>+</TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MealTable;
