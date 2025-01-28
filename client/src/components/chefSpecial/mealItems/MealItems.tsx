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
  Button,
  tableCellClasses,
  TextField,
  Select,
  MenuItem,
  Switch,
  TablePagination,
  Modal,
  Box,
  Chip,
  TableFooter,
} from "@mui/material";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  getMealsList,
  getServedList,
  getMealTypeList,
  mergeMeal,
  getCycleMeals,
  mergeMealType,
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
  mealTypes: string;
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
  const [inactiveToggleId, setInactiveToggleId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectedCycles, setConnectedCycles] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [changedMealTypes, setChangedMealTypes] = useState<
    Record<number, number[]>
  >({});

  useEffect(() => {
    const fetchMealsAndServedOptions = async () => {
      try {
        // Fetch the updated meals list
        const updatedMeals = await getMealsList(hospitalId);
        console.log(updatedMeals);

        // // Normalize `mealTypeId` for each meal
        // const normalizedMeals = updatedMeals.map((meal) => ({
        //   ...meal,
        //   mealTypeId: Array.isArray(meal.mealTypeId)
        //     ? meal.mealTypeId
        //     : meal.mealTypeId
        //     ? [meal.mealTypeId]
        //     : [], // Ensure mealTypeId is always an array
        // }));

        setAllLocalMeals(updatedMeals);

        // console.log("Meals with normalized mealTypeId:", normalizedMeals);

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

  const normalizeMealTypeId = (mealTypes: number | number[]): number[] => {
    return Array.isArray(mealTypes) ? mealTypes : mealTypes ? [mealTypes] : [];
  };

  useEffect(() => {
    const normalizedMeals = allLocalMeals.map((meal) => ({
      ...meal,
      mealTypes: normalizeMealTypeId(meal.mealTypes),
    }));
    setAllLocalMeals(normalizedMeals);
  }, [allLocalMeals]);

  const handleInputChange = (
    mealId: number,
    field: keyof Meal,
    value: string | number | boolean | number[]
  ) => {
    setEditRowId(mealId);

    setTempRowData((prev) => {
      // Initialize tempRowData only if not set or for a new mealId
      if (!prev || prev.Id !== mealId) {
        const currentMeal =
          allLocalMeals.find((meal) => meal.Id === mealId) || {};
        return {
          ...currentMeal,
          [field]:
            field === "mealTypes" && !Array.isArray(value) ? [value] : value, // Ensure mealTypeId is always an array
        };
      }
      // Update only the changed field for the current tempRowData
      return {
        ...prev,
        [field]:
          field === "mealTypes" && !Array.isArray(value) ? [value] : value, // Ensure mealTypeId is always an array
      };
    });
  };

  // function to add a new row to the cycle
  const handleAddRow = () => {
    // const tempId = `temp-${Date.now()}`; // Generate a temporary ID for the new row
    const newMeal: Meal = {
      Id: null,
      name: "",
      servedId: 0,
      description: "",
      mealTypeId: 0,
      mealTypes: [],
      isActive: true,
    };
    console.log(newMeal);
    setAllLocalMeals((prevMeals) => [...prevMeals, newMeal]);
    setEditRowId(newMeal.Id);
    setTempRowData(newMeal);
  };

  // function to toggle item to be active/inactive
  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleSaveRow = async (mealId: number) => {
    if (!tempRowData) return;

    console.log("Saving row with tempRowData:", tempRowData);

    // Handle new row
    if (mealId === null || String(mealId).startsWith("temp")) {
      try {
        const res: any = await mergeMeal(
          tempRowData.Id,
          tempRowData.name,
          tempRowData.description,
          tempRowData.servedId,
          hospitalId,
          tempRowData.isActive
        );

        if (res && res.Id) {
          const newMealId = res.Id; // Get the newly created meal ID
          console.log("New Meal saved successfully:", newMealId);

          // Add the new meal to local state
          setAllLocalMeals((prevMeals) => [
            ...prevMeals.map((meal) =>
              meal.Id === mealId
                ? { ...meal, ...tempRowData, Id: newMealId } // Replace temp row with new meal
                : meal
            ),
          ]);

          // Save meal types if any
          if (tempRowData.mealTypes && Array.isArray(tempRowData.mealTypes)) {
            for (const typeId of tempRowData.mealTypes) {
              await mergeMealType(newMealId, typeId, true);
              console.log("Meal type saved for new meal:", typeId);
            }
          }

          // Reset editing state
          setEditRowId(null);
          setTempRowData(null);
        }
      } catch (error) {
        console.error("Error saving new meal:", error);
      }
    } else {
      // Handle existing row
      const { mealTypeId, ...dataToUpdate } = tempRowData;

      try {
        // Save the meal details
        await mergeMeal(
          mealId,
          tempRowData.name || "",
          tempRowData.description || "",
          tempRowData.servedId || 0,
          hospitalId,
          tempRowData.isActive || false
        );

        // Save updated meal types if changed
        if (changedMealTypes[mealId]) {
          const selectedMealTypes = changedMealTypes[mealId];
          for (const mealTypeId of selectedMealTypes) {
            await mergeMealType(mealId, mealTypeId, true);
            console.log("Meal type updated:", mealTypeId);
          }
        }

        // Update local state for the existing meal
        setAllLocalMeals((prevMeals) =>
          prevMeals.map((meal) =>
            meal.Id === mealId
              ? {
                  ...meal,
                  ...dataToUpdate,
                  mealTypes: changedMealTypes[mealId] || meal.mealTypes,
                }
              : meal
          )
        );

        // Clear changedMealTypes for the mealId
        setChangedMealTypes((prev) => {
          const { [mealId]: _, ...remaining } = prev;
          return remaining;
        });

        // Reset editing state
        setEditRowId(null);
        setTempRowData(null);
      } catch (error) {
        console.error("Error saving meal:", error);
      }
    }
  };

  // const handleSaveRow = async (mealId: number) => {
  //   if (!tempRowData) return;

  //   console.log("Temp Row Data: ", tempRowData);

  //   try {
  //     // If mealId is temporary or undefined, save the new meal record
  //     if (mealId === null || String(mealId).startsWith("temp")) {
  //       const res: any = await mergeMeal(
  //         tempRowData.Id,
  //         tempRowData.name,
  //         tempRowData.description,
  //         tempRowData.servedId,
  //         hospitalId,
  //         tempRowData.isActive
  //       );

  //       if (res && res.Id) {
  //         const newMealId = res.Id; // Extract the newly created meal ID
  //         console.log("New Meal saved successfully:", newMealId);

  //         // Update the local state with the new meal
  //         setAllLocalMeals((prevMeals) => [
  //           ...prevMeals.filter((meal) => meal.Id !== mealId),
  //           {
  //             Id: newMealId,
  //             name: tempRowData.name || "", // Ensure name is not optional
  //             description: tempRowData.description || "",
  //             mealTypeId: tempRowData.mealTypeId || undefined,
  //             mealTypes: tempRowData.mealTypes || [],
  //             servedId: tempRowData.servedId || 0,
  //             isActive: tempRowData.isActive || false,
  //           } as Meal, // Ensure the object adheres to the Meal type
  //         ]);

  //         // Save the selected meal types, if any
  //         if (tempRowData.mealTypes && Array.isArray(tempRowData.mealTypes)) {
  //           for (const typeId of tempRowData.mealTypes) {
  //             await mergeMealType(newMealId, typeId, true);
  //             console.log("Meal type saved for new meal:", typeId);
  //           }
  //         }

  //         // Reset editing state
  //         setEditRowId(null);
  //         setTempRowData(null);
  //       } else {
  //         console.error(
  //           "Unexpected response from API when creating a new meal: ",
  //           res
  //         );
  //         return;
  //       }
  //     } else {
  //       // Handle updates for existing meals
  //       const { mealTypeId, ...dataToUpdate } = tempRowData;

  //       // Update local state for meal changes (excluding mealTypeId changes)
  //       setAllLocalMeals((prevMeals) =>
  //         prevMeals.map((meal) =>
  //           meal.Id === mealId ? { ...meal, ...dataToUpdate } : meal
  //         )
  //       );

  //       // Save changes to the backend
  //       await mergeMeal(
  //         mealId,
  //         tempRowData.name || "",
  //         tempRowData.description || "",
  //         tempRowData.servedId || 0,
  //         hospitalId,
  //         tempRowData.isActive || false
  //       );
  //       console.log("Meal updated successfully:", tempRowData);
  //     }

  //     // Handle meal type changes
  //     if (changedMealTypes[mealId]) {
  //       const selectedMealTypes = changedMealTypes[mealId];
  //       await Promise.all(
  //         selectedMealTypes.map((typeId) => mergeMealType(mealId, typeId, true))
  //       );

  //       console.log("All meal types saved successfully:", selectedMealTypes);

  //       // Update local state with saved meal types
  //       setAllLocalMeals((prevMeals) =>
  //         prevMeals.map((meal) =>
  //           meal.Id === mealId
  //             ? { ...meal, mealTypes: selectedMealTypes }
  //             : meal
  //         )
  //       );

  //       // Clear changedMealTypes for this mealId
  //       setChangedMealTypes((prev) => {
  //         const { [mealId]: _, ...remaining } = prev;
  //         return remaining;
  //       });
  //     }

  //     // Reset editing state
  //     setEditRowId(null);
  //     setTempRowData(null);
  //   } catch (error) {
  //     console.error("Error saving meal or meal types:", error);
  //   }
  // };

  // const handleSaveRow = async (mealId: number) => {
  //   if (!tempRowData) return;

  //   console.log("Temp Row Data: ", tempRowData);

  //   try {
  //   // If mealId is temporary or undefined, save the new meal record
  //   if (mealId === null || String(mealId).startsWith("temp")) {
  //     const res: any = await mergeMeal(
  //       tempRowData.Id || null,
  //       tempRowData.name || "",
  //       tempRowData.description || "",
  //       tempRowData.servedId || 0,
  //       hospitalId,
  //       tempRowData.isActive || false
  //     );
  //     if (res && res.Id) {
  //       const newMealId = res.Id; // Extract the newly created meal ID
  //       console.log("New Meal saved successfully:", newMealId);

  //       // Update the local state with the new meal ID
  //       setAllLocalMeals((prevMeals) => [
  //         ...prevMeals.filter((meal) => meal.Id !== mealId),
  //         { ...tempRowData, Id: newMealId },
  //       ]);

  //       // Update the mealId reference for further processing
  //       mealId = newMealId;

  //       // Save the selected meal types if any
  //       if (tempRowData.mealTypes && Array.isArray(tempRowData.mealTypes)) {
  //         await Promise.all(
  //           tempRowData.mealTypes.map((typeId) =>
  //             mergeMealType(mealId, typeId, true)
  //           )
  //         );
  //         console.log(
  //           "Meal types saved successfully for new meal:",
  //           tempRowData.mealTypes
  //         );
  //       }
  //     } else {
  //       console.error(
  //         "Unexpected response from API when creating a new meal: ",
  //         res
  //       );
  //       return;
  //     }
  //   }

  //   if (changedMealTypes[mealId]) {
  //     const selectedMealTypes = changedMealTypes[mealId];
  //     const savePromises = selectedMealTypes.map(async (mealTypeId) => {
  //       try {
  //         if (mealTypeId) {
  //           await mergeMealType(mealId, mealTypeId, true);
  //           console.log(
  //             `Saved meal type: Meal ID ${mealId}, Meal Type ID ${mealTypeId}`
  //           );
  //         }
  //       } catch (error) {
  //         console.error(
  //           `Error saving Meal Type for Meal ID: ${mealId}, Meal Type ID: ${mealTypeId}`,
  //           error
  //         );
  //       }
  //     });

  //     // Wait for all saves to complete
  //     Promise.all(savePromises)
  //       .then(() => {
  //         console.log(selectedMealTypes);
  //         setAllLocalMeals((prevMeals) =>
  //           prevMeals.map((meal) =>
  //             meal.Id === mealId
  //               ? { ...meal, mealTypes: selectedMealTypes }
  //               : meal
  //           )
  //         );
  //         console.log(
  //           "All meal types saved successfully and local state updated."
  //         );
  //       })
  //       .catch((error) => {
  //         console.error("Error saving meal types:", error);
  //       });

  //     // Clear changedMealTypes for the mealId
  //     setChangedMealTypes((prev) => {
  //       const { [mealId]: _, ...remaining } = prev;
  //       return remaining;
  //     });
  //   }
  //   // } else {
  //   // Exclude the `mealTypeId` field from being updated
  //   const { mealTypeId, ...dataToUpdate } = tempRowData;

  //   // Update the local state with the new data (excluding mealTypeId changes)
  //   setAllLocalMeals((prevMeals) =>
  //     prevMeals.map((meal) =>
  //       meal.Id === mealId ? { ...meal, ...dataToUpdate } : meal
  //     )
  //   );

  //   // Optionally, save to the backend
  //   mergeMeal(
  //     mealId,
  //     tempRowData.name || "",
  //     tempRowData.description || "",
  //     tempRowData.servedId || 0,
  //     hospitalId,
  //     tempRowData.isActive || false
  //   )
  //     .then(() => {
  //       console.log("Meal saved successfully:", tempRowData);
  //     })
  //     .catch((error) => {
  //       console.error("Error saving meal:", error);
  //     });

  //   // Reset the editing state
  //   setEditRowId(null);
  //   setTempRowData(null);
  // };

  // Toggle the visibility of inactive rows
  const toggleShowInactive = () => setShowInactive((prev) => !prev);

  // Filter meals based on isActive state and the toggle
  const filteredMeals = allLocalMeals.filter(
    (meal) => showInactive || meal.isActive
  );

  // Handle toggling isActive status
  const handleToggleIsActive = async (mealId: number) => {
    const result = await getCycleMeals(hospitalId, mealId);
    if (result && result.cycleInfo.length > 0) {
      // If the meal is associated with cycles, show the modal
      setConnectedCycles(result.cycleInfo.map((cycle) => cycle.name));
      setInactiveToggleId(mealId);
      setModalOpen(true);
    } else {
      setTempRowData((prev) => {
        if (!prev) {
          // Initialize tempRowData if not editing or update existing row
          const rowToEdit = allLocalMeals.find((meal) => meal.Id === mealId);
          return rowToEdit
            ? { ...rowToEdit, isActive: !rowToEdit.isActive }
            : { Id: mealId, isActive: true }; // Provide a default object as fallback
        }

        // Update the specific field in the tempRowData
        return {
          ...prev,
          isActive: !prev.isActive,
        };
      });

      setEditRowId(mealId);
    }
  };

  const toggleMealStatus = (mealId: number) => {
    setAllLocalMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.Id === mealId ? { ...meal, isActive: !meal.isActive } : meal
      )
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setConnectedCycles([]);
    setInactiveToggleId(null);
  };

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

  const handleMultiselectChange = (
    mealId: number,
    selectedOptions: number[]
  ) => {
    handleInputChange(mealId, "mealTypes", selectedOptions);
    setChangedMealTypes((prev) => ({
      ...prev,
      [mealId]: selectedOptions,
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
                <StyledTableCell width="25%" sx={{ fontFamily: "Poppins" }}>
                  Item
                </StyledTableCell>
                <StyledTableCell width="10%" sx={{ fontFamily: "Poppins" }}>
                  Served
                </StyledTableCell>
                <StyledTableCell width="20%" sx={{ fontFamily: "Poppins" }}>
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
                      multiple
                      name="mealType"
                      size="small"
                      fullWidth
                      value={
                        editRowId === meal.Id
                          ? tempRowData?.mealTypes || [] // Ensure value is always an array
                          : normalizeMealTypeId(meal.mealTypes)
                      }
                      onChange={(e) => {
                        const value = e.target.value as number[];
                        handleMultiselectChange(meal.Id, value);
                      }}
                      renderValue={(selected) =>
                        Array.isArray(selected) ? (
                          <div>
                            {selected.map((id) => (
                              <Chip
                                key={id}
                                label={
                                  mealTypes.find((type) => type.Id === id)
                                    ?.name || id
                                }
                              />
                            ))}
                          </div>
                        ) : null
                      }
                      style={{ width: 430 }}
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
                      onChange={() => handleToggleIsActive(meal.Id)}
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
        <Box>
          <caption style={{ paddingTop: "3px" }}>
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
        </Box>
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={filteredMeals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-toolbar": {
              minHeight: "40px",
            },
          }}
        />
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              width: 400,
            }}
          >
            <Typography variant="h6">Connected Cycles</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              This meal is linked to the following cycles:
            </Typography>
            <ul>
              {connectedCycles.map((cycle, index) => (
                <li key={index}>{cycle}</li>
              ))}
            </ul>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please go to the Chef Special window to remove this item from the
              cycles before marking it inactive.
            </Typography>
            <Button
              onClick={handleCloseModal}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Paper>
    </div>
  );
};

export default MealItems;
