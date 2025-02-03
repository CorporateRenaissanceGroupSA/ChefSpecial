import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableHead,
  Paper,
  TableCell,
  Button,
  tableCellClasses,
  TablePagination,
} from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { MealType } from "../../types";
import dayjs, { Dayjs } from "dayjs";

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
    borderBottom: "1px solid #F1F1F1",
  },
}));

interface MealTimesProps {
  hospitalId: number;
  mealTypes: MealType[];
}

const MealTimes: React.FC<MealTimesProps> = ({ hospitalId, mealTypes }) => {
  const [mealTimes, setMealTimes] = useState(mealTypes);
  const [editedMealId, setEditedMealId] = useState<number | null>(null);
  const [editedTime, setEditedTime] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    console.log(mealTypes);
  }, []);

  const handleTimeChange = (id: number, newTime: Dayjs | null) => {
    if (!newTime) return;

    setEditedMealId(id);
    setEditedTime((prev) => ({
      ...prev,
      [id]: newTime.format("HH:mm:ss"),
    }));
  };

  const handleSaveRow = async (mealTypeId: number) => {
    const newTime = editedTime[mealTypeId];

    if (!newTime) return;

    console.log(
      `Saving mealId: ${mealTypeId}, New Time: ${newTime}, HospitalId: ${hospitalId}`
    );


    //    try {
        //  const response = await fetch("/api/updateMealTime", {
        //    method: "POST",
        //    headers: { "Content-Type": "application/json" },
        //    body: JSON.stringify({ mealId, mealTypeTime: newTime, hospitalId }),
        //  });

        //  if (!response.ok) throw new Error("Failed to save");

         // Update the meal time in state
         setMealTimes((prev) =>
           prev.map((meal) =>
             meal.Id === mealTypeId ? { ...meal, mealTypeTime: newTime } : meal
           )
         );

         setEditedMealId(null); // Reset edited row
         setEditedTime((prev) => {
           const newState = { ...prev };
           delete newState[mealTypeId]; // Remove saved edit from state
           return newState;
         });

         console.log("Meal time updated successfully!");
    //    } catch (error) {
    //      console.error("Error updating meal time:", error);
    //    }
  };
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
        <TableContainer
          component={Paper}
          sx={{ marginTop: 2, maxHeight: "78vh" }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  Meal
                </StyledTableCell>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  Cut Off Time
                </StyledTableCell>
                <StyledTableCell sx={{ fontFamily: "Poppins" }}>
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mealTimes.map((meal) => (
                <StyledTableRow key={meal.Id}>
                  <StyledTableCell>{meal.name}</StyledTableCell>
                  <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopTimePicker
                        className="dateInput"
                        value={dayjs(
                          `2022-04-17T${
                            editedTime[meal.Id] || meal.mealTypeTime
                          }`
                        )}
                        onChange={(newTime) =>
                          handleTimeChange(meal.Id, newTime)
                        }
                      />
                    </LocalizationProvider>
                  </StyledTableCell>
                  <StyledTableCell>
                    {editedMealId === meal.Id && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handleSaveRow(meal.Id)}
                      >
                        Save
                      </Button>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default MealTimes;
