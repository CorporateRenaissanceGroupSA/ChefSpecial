import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";

import MealDropdown from "./MealDropdown";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Option } from "../types";
import { CycleData } from "../types";

interface Meal {
  name: string;
  days: boolean[];
}

interface MealTableProps {
  daysInCycle: number;
  mealType: string;
  onUpdate: (mealType: string, meals: Meal[]) => void;
}

interface RowData {
  id: number;
  mealName: string;
  data: boolean[];
}

export const options: Option[] = [
  { value: 1, label: "Macon & Eggs" },
  { value: 2, label: "Oat Muffin" },
  { value: 3, label: "Chicken Pie" },
];

const MealTable: React.FC<MealTableProps> = ({
  daysInCycle,
  mealType,
  onUpdate,
}) => {
  // State to manage rows
  const [rows, setRows] = useState<RowData[]>([
    { id: 1, mealName: "", data: Array(daysInCycle).fill(false) }, // Initialize with one row
  ]);

  // Update row data when daysInCycle changes
  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        data: adjustRowData(row.data, daysInCycle),
      }))
    );
  }, [daysInCycle]);

  const prevMealsRef = useRef<Meal[]>([]);

  // Notify parent when row data changes
  useEffect(() => {
    const validMeals = rows
      .filter((row) => row.mealName && row.data.some((day) => day)) // Only include rows with a meal name and at least one checked day
      .map((row) => ({
        name: row.mealName,
        days: row.data,
      }));
    // onUpdate(mealType, validMeals);

    if (JSON.stringify(validMeals) !== JSON.stringify(prevMealsRef.current)) {
      prevMealsRef.current = validMeals; // Update ref with new validMeals
      onUpdate(mealType, validMeals);
    }
  }, [rows, mealType, onUpdate]);

  const adjustRowData = (data: boolean[], days: number) => {
    if (data.length > days) {
      return data.slice(0, days);
    }
    return [...data, ...Array(days - data.length).fill(false)];
  };

  const handleAddRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows.length + 1,
        mealName: "",
        data: Array(daysInCycle).fill(false),
      },
    ]);
  };

  const handleCheckboxChange = (rowId: number, dayIndex: number) => {
    setRows((prevRows) =>
      prevRows.map((row: RowData) =>
        row.id === rowId
          ? {
              ...row,
              data: row.data.map((checked: boolean, index: number) =>
                index === dayIndex ? !checked : checked
              ),
            }
          : row
      )
    );
  };

  const handleMealChange = (rowId: number, mealName: string) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, mealName } : row))
    );
  };

  const dayHeaders = Array.from(
    { length: daysInCycle },
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
              <TableCell width="20%">{mealType}</TableCell>
              {dayHeaders.map((day, index) => (
                <TableCell key={index} align="center">
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <MealDropdown
                    value={
                      row.mealName
                        ? {
                            value:
                              options.find((opt) => opt.label === row.mealName)
                                ?.value || 0,
                            label: row.mealName,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleMealChange(
                        row.id,
                        selectedOption ? selectedOption.label : ""
                      )
                    }
                  />
                </TableCell>
                {row.data.map((checked, dayIndex) => (
                  <TableCell key={dayIndex} align="center">
                    <Checkbox
                      checked={checked}
                      onChange={() => handleCheckboxChange(row.id, dayIndex)}
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
