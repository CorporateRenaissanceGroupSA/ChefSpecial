import React, { useState, useEffect } from "react";
import "./App.scss";
import { Tabs, Tab } from "@mui/material";
import ChefSpecialConfig from "./components/ChefSpecialConfig";
import MealItems from "./components/chefSpecial/mealItems/MealItems";
import { getMealTypeList, getMealsList } from "./utils/db-utils";
import { Meal, MealType } from "./types";

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [hospitalId] = useState<number>(1);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);

  useEffect(() => {
    // Load meal types and meals once on app load
    getMealTypeList(hospitalId).then((result) => {
      setMealTypes(result);
      console.log("Meal Types updated: ", result);
    });

    getMealsList(hospitalId).then((result) => {
      setAllMeals(result);
      console.log("All meals updated.", result);
    });
  }, [hospitalId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="">
      <Tabs className="tabs" value={selectedTab} onChange={handleTabChange}>
        <Tab className="tabs__item" label="Chef Special" />
        <Tab className="tabs__item" label="Chef Special Items" />
        <Tab className="tabs__item" label="Meal Times" />
        <Tab className="tabs__item" label="Alerts" />
        <Tab className="tabs__item" label="Patient Alerts" />
      </Tabs>
      {selectedTab === 0 && (
        <ChefSpecialConfig
          key={selectedTab}
          allMeals={allMeals}
          mealTypes={mealTypes}
        />
      )}

      {selectedTab === 1 && (
        <MealItems allMeals={allMeals} mealTypes={mealTypes} />
      )}

      {selectedTab === 2 && (
        <div>
          <h2>Meal Times</h2>
        </div>
      )}

      {selectedTab === 3 && (
        <div>
          <h2>Alerts</h2>
        </div>
      )}

      {selectedTab === 4 && (
        <div>
          <h2>Patient Alerts</h2>
        </div>
      )}
    </div>
  );
};

export default App;
