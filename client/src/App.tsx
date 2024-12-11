import React, { useState, useEffect } from "react";
import CycleSelector from "./components/CycleSelector";
import "./App.scss";
import { CycleData, Meal } from "./types";
import MealTable from "./components/MealTable";
import { Grid2, List, ListItem, Tabs, Box } from "@mui/material";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const App: React.FC = () => {
  const [cycleData, setCycleData] = useState<CycleData>({
    cycleName: "",
    startDate: "",
    daysInCycle: 8,
    meals: [],
  });

   const [selectedTab, setSelectedTab] = useState(0);

  const debouncedLog = debounce((updatedData: CycleData) => {
    console.log("Updated cycleData:", updatedData);
  }, 300); // Adjust delay as needed

  const handleUpdateMeals = (mealType: string, meals: Meal[]) => {
    setCycleData((prev) => {
      const updatedCycleData = {
        ...prev,
        meals: {
          ...prev.meals,
          [mealType]: meals,
        },
      };
      debouncedLog(updatedCycleData);

      return updatedCycleData;
    });
  };

  // useEffect(() => {
  //   console.log("Updated cycleData:", cycleData);
  // }, [cycleData]);

   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
     setSelectedTab(newValue);
   };

  return (
    <div className="">
      <Tabs className="tabs" value={selectedTab} onChange={handleTabChange}>
        <Grid2 container className="tabs__list">
          <Grid2>
            <Grid2 container>
              <Grid2>
                <List
                  className="tabs__list-list"
                  style={{ paddingTop: "6px", paddingBottom: "0px" }}
                >
                  <ListItem className="tabs__item tabs__item--selected">
                    Chef Special
                  </ListItem>
                  <ListItem className="tabs__item">Meal Times</ListItem>
                  <ListItem className="tabs__item">Notes</ListItem>
                </List>
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Tabs>
      {selectedTab === 0 && (
        <div className="min-h-screen p-2">
          <CycleSelector cycleData={cycleData} setCycleData={setCycleData} />

          <MealTable
            daysInCycle={cycleData.daysInCycle}
            mealType="Breakfast"
            onUpdate={handleUpdateMeals}
          />

          <MealTable
            daysInCycle={cycleData.daysInCycle}
            mealType="Lunch"
            onUpdate={handleUpdateMeals}
          />

          <MealTable
            daysInCycle={cycleData.daysInCycle}
            mealType="Supper"
            onUpdate={handleUpdateMeals}
          />
        </div>
      )}

      {selectedTab === 1 && (
        <Box sx={{ padding: 2 }}>
          <h2>Meal Times</h2>
          {/* Add Meal Times Content */}
        </Box>
      )}

      {selectedTab === 2 && (
        <Box sx={{ padding: 2 }}>
          <h2>Notes</h2>
          {/* Add Notes Content */}
        </Box>
      )}
    </div>
  );
};

export default App;
