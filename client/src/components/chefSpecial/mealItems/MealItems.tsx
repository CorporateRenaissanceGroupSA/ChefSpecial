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
  TextField,
  Select,
  MenuItem,
  Switch,
} from "@mui/material";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  getMealsList,
  getServedList,
  getMealTypeList,
  mergeMeal,
} from "../../../utils/db-utils";
import {
  CycleData,
  Meal,
  MealDays,
  MealType,
  Served,
} from "../../../types";

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
}

const MealItems: React.FC<MealItemsProps> = ({ allMeals, mealTypes }) => {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [allLocalMeals, setAllLocalMeals] = useState<Meal[]>([]);
  const [servedOptions, setServedOptions] = useState<Served[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  // const [mealTypes, setMealTypes] = useState<MealType[]>([]);

  useEffect(() => {
    const fetchMealsAndServedOptions = async () => {
      try {
        // Fetch the updated meals list
        const updatedMeals = await getMealsList(hospitalId);
        setAllLocalMeals(updatedMeals);

        // Fetch served options
        const servedList = await getServedList();

        // Exclude the item with Id 3
        const filteredServedList = servedList.filter(
          (option) => option.Id !== 3
        );
        setServedOptions(filteredServedList);
      } catch (error) {
        console.error("Error fetching meals or served options:", error);
      }
    };

    fetchMealsAndServedOptions();
    // getServedList().then((result) => {
    //   setServedOptions(result);
    //   console.log("Served options.", result);
    // });
  }, [hospitalId]);

  // Update meal data in backend
  const handleUpdateMeal = (updatedMeal: Meal) => {
    const { Id, name, description, servedId, mealTypeId } = updatedMeal;

    // Define the necessary fields for merging
    const hospitalId = 1; // Replace with appropriate hospitalId
    const active = true; // Assuming the meal is active, adjust if needed

    // Call the mergeMeal function
    mergeMeal(Id, name, description, servedId, mealTypeId, hospitalId, active)
      .then(() => {
        console.log("Meal merged successfully:", updatedMeal);
      })
      .catch((error) => {
        console.error("Error merging meal:", error);
      });
  };

  // // Add new meal to backend
  // const handleAddMeal = () => {
  //   const newMeal: Meal = {
  //     Id: 0, // Temporary ID, backend will generate a real one
  //     name: "",
  //     servedId: 0,
  //     description: "",
  //     mealTypeId: 0,
  //   };

  //   addMeal(newMeal).then((createdMeal) => {
  //     setAllLocalMeals((prevMeals) => [...prevMeals, createdMeal]);
  //     console.log("Meal added successfully:", createdMeal);
  //   });
  // };

  const handleInputChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setAllLocalMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.Id === id ? { ...meal, [field]: value } : meal
      )
    );

    // Find the updated meal
    const updatedMeal = allLocalMeals.find((meal) => meal.Id === id);
    if (updatedMeal) {
      handleUpdateMeal({ ...updatedMeal, [field]: value });
    }
  };

  // function to add a new row to the cycle
  const handleAddRow = () => {
    const newMeal: Meal = {
      Id: allLocalMeals.length + 1, // Unique ID
      name: "",
      servedId: 0, // Default value
      description: "",
      mealTypeId: 0, // Default value
    };
    setAllLocalMeals((prevMeals) => [...prevMeals, newMeal]);
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
                <StyledTableCell width="30%" sx={{ fontFamily: "Poppins" }}>
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
                <StyledTableCell width="10%" sx={{ fontFamily: "Poppins" }}>
                  Active
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allLocalMeals.map((meal) => (
                <StyledTableRow key={meal.Id}>
                  <StyledTableCell>
                    <TextField
                      value={meal.name}
                      onChange={(e) =>
                        handleInputChange(meal.Id, "name", e.target.value)
                      }
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Select
                      value={meal.servedId}
                      onChange={(e) =>
                        handleInputChange(meal.Id, "servedId", e.target.value)
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
                      value={meal.description || ""}
                      onChange={(e) =>
                        handleInputChange(
                          meal.Id,
                          "description",
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
                      value={meal.mealTypeId}
                      onChange={(e) =>
                        handleInputChange(meal.Id, "mealTypeId", e.target.value)
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
                      defaultChecked
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
