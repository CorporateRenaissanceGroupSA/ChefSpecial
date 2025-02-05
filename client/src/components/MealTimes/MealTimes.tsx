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
  TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { MealType } from "../../types";
import dayjs, { Dayjs } from "dayjs";
import { mergeMealTypeOverride, getMealTypeList } from "../../utils/db-utils";

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
  // mealTypes: MealType[];
  setMealTypes: React.Dispatch<React.SetStateAction<MealType[]>>;
}

const MealTimes: React.FC<MealTimesProps> = ({ hospitalId, setMealTypes }) => {
  const [localMealTypes, setLocalMealTypes] = useState<MealType[]>([]);
  const [editedRow, setEditedRow] = useState<number | null>(null);
  const [tempRowData, setTempRowData] = useState<{
    [key: number]: { name: string; time: string };
  }>({});
  // const [editedMealId, setEditedMealId] = useState<number | null>(null);
  // const [editedTime, setEditedTime] = useState<{ [key: number]: string }>({});
  // const [editRowId, setEditRowId] = useState<number | null>(null);

  useEffect(() => {
    if (hospitalId) {
      console.log("updated hospitalId: ", hospitalId);

      // Load meal types and meals
      getMealTypeList(hospitalId).then((result) => {
        setLocalMealTypes(result);
        console.log("Meal Types updated for Meal Times: ", result);
      });
    }

    // setCycleName(null);
  }, [hospitalId]);

  const handleTimeChange = (id: number, newTime: Dayjs | null) => {
    if (!newTime) return;

    console.log(typeof newTime.format("HH:mm:ss"));
    handleInputChange(id, "time", newTime.format("HH:mm:ss"));
  };

  const handleSaveRow = async (mealType: MealType) => {
    if (!tempRowData[mealType.Id]) return;
    const { name, time } = tempRowData[mealType.Id];
    try {
      await mergeMealTypeOverride(mealType.Id, hospitalId, name, time, true);
      setLocalMealTypes((prev) =>
        prev.map((m) =>
          m.Id === mealType.Id
            ? { ...m, name: name, mealTypeServedTime: time }
            : m
        )
      );

      setMealTypes((prev) =>
        prev.map((m) =>
          m.Id === mealType.Id ? { ...m, name: name, mealTypeServedTime: time } : m
        )
      )
    } catch (error) {
      console.error("Error updating meal type:", error);
    }
    setEditedRow(null);
  };

  const handleInputChange = (
    id: number,
    field: "name" | "time",
    value: string
  ) => {
    setEditedRow(id);
    setTempRowData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
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
                <StyledTableCell width="33%" sx={{ fontFamily: "Poppins" }}>
                  Meal Type
                </StyledTableCell>
                <StyledTableCell width="33%" sx={{ fontFamily: "Poppins" }}>
                  Served Time
                </StyledTableCell>
                <StyledTableCell width="33%" sx={{ fontFamily: "Poppins" }}>
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localMealTypes.map((mt) => (
                <StyledTableRow key={mt.Id}>
                  <StyledTableCell>
                    <TextField
                      name="mealType"
                      value={tempRowData[mt.Id]?.name || mt.name}
                      fullWidth
                      variant="outlined"
                      size="small"
                      onChange={(e) =>
                        handleInputChange(mt.Id, "name", e.target.value)
                      }
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopTimePicker
                        className="dateInput"
                        value={dayjs(
                          `2022-04-17T${
                            tempRowData[mt.Id]?.time || mt.mealTypeServedTime
                          }`
                        )}
                        onChange={(newTime) => handleTimeChange(mt.Id, newTime)}
                      />
                    </LocalizationProvider>
                  </StyledTableCell>
                  <StyledTableCell>
                    {editedRow === mt.Id && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handleSaveRow(mt)}
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
