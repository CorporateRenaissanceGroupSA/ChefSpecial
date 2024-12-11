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
  Button,
  tableCellClasses,
  checkboxClasses,
} from "@mui/material";

import MealDropdown from "./MealDropdown";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { Option } from "../types";
import { CycleData } from "../types";
import * as Icon from "react-icons/fi";
import Checkbox from "react-custom-checkbox";

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
    <div className="px-4">
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
            <caption>
              <Button onClick={handleAddRow}>
                <PlusCircleIcon className="size-5 text-[#FFB600]" />
              </Button>
            </caption>
            <TableHead>
              <TableRow>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  {mealType}
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
                <StyledTableRow key={row.id}>
                  <TableCell>
                    <MealDropdown
                      value={
                        row.mealName
                          ? {
                              value:
                                options.find(
                                  (opt) => opt.label === row.mealName
                                )?.value || 0,
                              label: row.mealName,
                            }
                          : null
                      }
                      onChange={(selectedOption: any) =>
                        handleMealChange(
                          row.id,
                          selectedOption ? selectedOption.label : ""
                        )
                      }
                    />
                  </TableCell>
                  {row.data.map((checked, dayIndex) => (
                    <TableCell
                      key={dayIndex}
                      align="justify"
                      className="mealTable-day"
                    >
                      <Checkbox
                        icon={<Icon.FiCheck color="#26FF00" size={15} />}
                        checked={checked}
                        onChange={() => handleCheckboxChange(row.id, dayIndex)}
                        borderColor="#D9D9D9"
                        borderRadius={5}
                        style={{ boxShadow: "opx 1px 4px rgba(0, 0, 0, 0.16)" }}
                      />
                    </TableCell>
                  ))}
                </StyledTableRow>
              ))}
              {/* <TableRow>+</TableRow> */}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default MealTable;
