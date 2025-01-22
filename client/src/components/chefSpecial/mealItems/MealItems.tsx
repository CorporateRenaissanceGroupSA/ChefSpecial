import React, { useState, useEffect, useCallback } from "react";
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
  TextField,
  Select,
  MenuItem,
  Switch,
  TablePagination,
} from "@mui/material";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  getMealsList,
  getServedList,
  getMealTypeList,
  mergeMeal,
} from "../../../utils/db-utils";
import { CycleData, Meal, MealDays, MealType, Served } from "../../../types";
import _ from "lodash";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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

interface MealItemsProps {
  allMeals: Meal[];
  mealTypes: MealType[];
}

interface RowData {
  rowId: number;
  mealId: number;
  mealName: string;
  mealDescription: string;
  mealTypeId: number;
  mealType: string;
  mealServedId: number;
}

const MealItems: React.FC<MealItemsProps> = ({ allMeals, mealTypes }) => {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [allLocalMeals, setAllLocalMeals] = useState<Meal[]>(allMeals);
  const [servedOptions, setServedOptions] = useState<Served[]>([]);
  const [checked, setChecked] = React.useState(true);
  const [editRowId, setEditRowId] = useState<number | null>(null); // Track which row is being edited
  const [tempRowData, setTempRowData] = useState<Partial<Meal> | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchMealsAndServedOptions = async () => {
      try {
        // Fetch the updated meals list
        const updatedMeals = await getMealsList(hospitalId);
        setAllLocalMeals(updatedMeals);

        // Fetch served options
        const servedList = await getServedList();

        // Exclude the item with Id 3 (Placeholder)
        const filteredServedList = servedList.filter(
          (option) => option.Id !== 3
        );
        setServedOptions(filteredServedList);
      } catch (error) {
        console.error("Error fetching meals or served options:", error);
      }
    };

    fetchMealsAndServedOptions();
  }, [hospitalId]);

  // // Update meal data in backend
  // const handleUpdateMeal = (updatedMeal: Meal) => {
  //   const { Id, name, description, servedId, mealTypeId } = updatedMeal;

  //   const hospitalId = 1;
  //   const active = true; // default active state

  //   // Call the mergeMeal function
  //   mergeMeal(Id, name, description, servedId, mealTypeId, hospitalId, active)
  //     .then(() => {
  //       console.log("Meal merged successfully:", updatedMeal);
  //     })
  //     .catch((error) => {
  //       console.error("Error merging meal:", error);
  //     });
  // };

  // // Debounced save function
  // const saveRecord = useCallback(
  //   _.debounce((id: number, field: string, value: string | number) => {
  //     // Replace this with your actual save API call
  //     console.log("Saving record with value:", value);
  //     // Find the updated meal
  //     const updatedMeal = allLocalMeals.find((meal) => meal.Id === id);
  //     if (updatedMeal) {
  //       const newMeal = { ...updatedMeal, [field]: value };
  //       handleUpdateMeal(newMeal);
  //     }
  //   }, 500), // Adjust debounce delay as needed (500ms here)
  //   [allLocalMeals]
  // );

  const handleInputChange = (
    mealId: number,
    field: keyof Meal,
    value: string | number | boolean
  ) => {
    setTempRowData((prev) => {
      // Initialize if not editing or update existing
      if (editRowId !== mealId) {
        const rowToEdit = allLocalMeals.find((meal) => meal.Id === mealId);
        return rowToEdit ? { ...rowToEdit, [field]: value } : prev;
      }

      // Update the field value
      return {
        ...prev,
        [field]: value,
      };
    });

    setEditRowId(mealId); // Ensure the correct row is being edited
  };

  // function to add a new row to the cycle
  const handleAddRow = () => {
    const newMeal: Meal = {
      Id: allLocalMeals.length + 1,
      name: "",
      servedId: 0,
      description: "",
      mealTypeId: 0,
      isActive: true,
    };
    setAllLocalMeals((prevMeals) => [...prevMeals, newMeal]);
  };

  // function to toggle item to be active/inactive
  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  // Save changes to the backend
  const handleSaveRow = (mealId: number) => {
    if (!tempRowData) return;

    // Find and update the meal in allLocalMeals
    setAllLocalMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.Id === mealId ? { ...meal, ...tempRowData } : meal
      )
    );

    const updatedMeal = {
      ...allLocalMeals.find((meal) => meal.Id === mealId),
      ...tempRowData,
    };

    if (updatedMeal.Id !== undefined) {
      mergeMeal(
        updatedMeal.Id,
        updatedMeal.name || "",
        updatedMeal.description || "",
        updatedMeal.servedId || 0,
        updatedMeal.mealTypeId || 0,
        hospitalId,
        updatedMeal.isActive || false
      )
        .then(() => {
          setEditRowId(null);
          setTempRowData(null);
          console.log("Meal saved successfully:", updatedMeal);
        })
        .catch((error) => {
          console.error("Error saving meal:", error);
        });
    } else {
      console.error("Meal ID is undefined. Cannot merge meal.");
    }
  };

  // Toggle the visibility of inactive rows
  const toggleShowInactive = () => setShowInactive((prev) => !prev);

  // Filter meals based on isActive state and the toggle
  const filteredMeals = allLocalMeals.filter(
    (meal) => showInactive || meal.isActive
  );

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginate the filtered meals
  const paginatedMeals = filteredMeals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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
        <TableContainer
          component={Paper}
          sx={{ marginTop: 2, maxHeight: "81vh" }}
        >
          <Table size="small" stickyHeader>
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
                <StyledTableCell width="25%" sx={{ fontFamily: "Poppins" }}>
                  Item
                </StyledTableCell>
                <StyledTableCell width="10%" sx={{ fontFamily: "Poppins" }}>
                  Served
                </StyledTableCell>
                <StyledTableCell width="30%" sx={{ fontFamily: "Poppins" }}>
                  Description
                </StyledTableCell>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
                  Meal Type
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    fontFamily: "Poppins",
                  }}
                >
                  Active
                  <Button
                    onClick={toggleShowInactive}
                    sx={{
                      minWidth: "24px",
                      padding: 0,
                      marginLeft: 1,
                      "&:hover": { backgroundColor: "transparent" },
                    }}
                  >
                    {showInactive ? (
                      <EyeSlashIcon className="size-5 text-[#FF0000]" />
                    ) : (
                      <EyeIcon className="size-5 text-[#33cd33]" />
                    )}
                  </Button>
                </StyledTableCell>
                <StyledTableCell width="1%" sx={{ fontFamily: "Poppins" }}>
                  Action
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMeals.map((meal) => (
                <StyledTableRow key={meal.Id}>
                  <StyledTableCell>
                    <TextField
                      name="mealName"
                      value={
                        editRowId === meal.Id
                          ? tempRowData?.["name"] ?? "" // Allow empty values
                          : meal["name"] || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          meal.Id,
                          "name" as keyof Meal,
                          e.target.value
                        )
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Select
                      name="served"
                      value={
                        editRowId === meal.Id
                          ? tempRowData?.["servedId"] ?? 0 // Default to 0 if empty
                          : meal["servedId"]
                      }
                      onChange={(e) =>
                        handleInputChange(
                          meal.Id,
                          "servedId" as keyof Meal,
                          Number(e.target.value)
                        )
                      }
                      fullWidth
                      size="small"
                    >
                      {servedOptions.map((option) => (
                        <MenuItem key={option.Id} value={option.Id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TextField
                      name="description"
                      value={
                        editRowId === meal.Id
                          ? tempRowData?.["description"] ?? "" // Allow empty values
                          : meal["description"] || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          meal.Id,
                          "description" as keyof Meal,
                          e.target.value
                        )
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Select
                      name="mealType"
                      value={
                        editRowId === meal.Id
                          ? tempRowData?.mealTypeId || meal.mealTypeId
                          : meal.mealTypeId
                      }
                      onChange={(e) =>
                        handleInputChange(
                          meal.Id,
                          "mealTypeId",
                          e.target.value as number
                        )
                      }
                      fullWidth
                      size="small"
                    >
                      {mealTypes.map((option) => (
                        <MenuItem key={option.Id} value={option.Id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Switch
                      name="mealActive"
                      checked={
                        editRowId === meal.Id
                          ? tempRowData?.isActive ?? meal.isActive
                          : meal.isActive
                      }
                      onChange={(e) =>
                        handleInputChange(meal.Id, "isActive", e.target.checked)
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#33cd33",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#33cd33",
                          },
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    {editRowId === meal.Id && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveRow(meal.Id)}
                      >
                        Save
                      </Button>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {paginatedMeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={filteredMeals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default MealItems;
