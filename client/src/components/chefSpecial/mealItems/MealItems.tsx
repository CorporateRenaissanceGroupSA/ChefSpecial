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
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  getCycleMealDays,
  mergeMealDay,
  getMealsList,
} from "../../../utils/db-utils";
import { CycleData, Meal, MealDays, MealType, Option } from "../../../types";

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

// interface MealItemsProps {
//   cycle: CycleData;
//   mealType: MealType;
//   allMeals: Meal[];
// }

// interface Meal {
//   name: string;
//   days: boolean[];
// }

// interface MealItemsProps {
//   mealType: MealType;
//   allMeals: Meal[];
// }

// interface RowData {
//   rowId: number;
//   mealId: number;
//   mealName: string;
//   days: boolean[];
// }

// function rowsFromMealDays(mealDaysList: MealDays[]): RowData[] {
//   let rowId = 0;
//   let result = mealDaysList.map((mealDaysItem) => {
//     rowId++;
//     return {
//       rowId,
//       mealId: mealDaysItem.mealId,
//       mealName: mealDaysItem.mealName,
//       days: mealDaysItem.days,
//     };
//   });
//   return result;
// }

// function adjustRowData(data: boolean[], days: number) {
//   if (data.length > days) {
//     return data.slice(0, days);
//   }
//   return [...data, ...Array(days - data.length).fill(false)];

// function to add a new row to the cycle
//   const handleAddRow = () => {
//     console.log("Add row handler called.");
//     setRows((prevRows) => [
//       ...prevRows,
//       {
//         rowId: prevRows.length + 1,
//         mealId: 0,
//         mealName: "",
//         days: Array(cycle.cycleDays).fill(false),
//       },
//     ]);
//   };
// }



const MealItems: React.FC = ({ }) => {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);

  useEffect(() => {
    getMealsList(hospitalId).then((result) => {
      setAllMeals(result);
      console.log("All meals updated.", result);
    });
  }, [hospitalId]);
  // load all the meals and active days for the currently selected cycle and place the data into rows
  // useEffect(() => {
  //   getCycleMealDays(mealType.Id).then((result) => {
  //     if (result && result.mealDaysList) {
  //       let validMealDaysList = result.mealDaysList.filter(
  //         (mealDays) => mealDays.mealName && mealDays.days.some((day) => day)
  //       );
  //       // let newRows = rowsFromMealDays(validMealDaysList);
  //       // console.log("New rows: ", newRows);
  //       // setRows(newRows);
  //     } else {
  //       // setRows([]);
  //     }
  //   });
  // }, [mealType.Id]);
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
              <Button>
                <PlusCircleIcon className="size-5 text-[#FFB600]" />
              </Button>
            </caption>
            <TableHead>
              <TableRow>
                <StyledTableCell width="30%" sx={{ fontFamily: "Poppins" }}>
                  Item
                </StyledTableCell>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  Served
                </StyledTableCell>
                <StyledTableCell width="30%" sx={{ fontFamily: "Poppins" }}>
                  Description
                </StyledTableCell>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  Meal Type
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allMeals.map((meal) => (
                <StyledTableRow key={meal.Id}>
                  <StyledTableCell>{meal.name}</StyledTableCell>
                  <StyledTableCell>{meal.served}</StyledTableCell>
                  <StyledTableCell>
                    {meal.description || "No description provided"}
                  </StyledTableCell>
                  <StyledTableCell>{`Meal Type ${meal.mealTypeId}`}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default MealItems;
