import React, { useState, useEffect } from "react";
import "./App.scss";
import { Tabs, Tab } from "@mui/material";
import { ChefSpecialConfig, MealItems, WeeklyView, MealTimes, Alerts } from "./Components";
// import MealItems from "./Components/ChefSpecialItems/MealItems/MealItems";
import { getHospitals, getMealTypeList, getMealsList } from "./utils/db-utils";
import { Hospitals, Meal, MealType, MealDays } from "./types";
import HospitalDropdown from "./Components/HospitalDropdown";
import { each } from "lodash";
import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [hospitals, setHospitals] = useState<Hospitals[]>([]);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [userId, setUserId] = useState(81);
  const [showWeeklyView, setShowWeeklyView] = useState(false);

  const iframeUrl = window.location.href;

  //  useEffect(() => {
  //    const userId: number = Number(iframeUrl.split("=")[1]) || 2;

  //    dispatch(setUserId(userId));

  //    axios
  //      .post(`${process.env.REACT_APP_API}/user/info`, { userId: userId })
  //      .then((response) => {
  //        dispatch(setUserName(response.data.Name));
  //      })
  //      .catch((error) => console.log(error));
  //  }, [dispatch, iframeUrl]);

  useEffect(() => {
    // Load hospitals
    getHospitals(userId).then((result) => {
      setHospitals(result);
      console.log("Hospitals updated: ", result);
    });
  }, [userId]);

  useEffect(() => {
    if (hospitalId != null) {
      console.log("updated holspitalId: ", hospitalId);

      // Load meal types and meals
      getMealTypeList(hospitalId).then((result) => {
        setMealTypes(result);
        console.log("Meal Types updated: ", result);
      });

      getMealsList(hospitalId).then((result) => {
        setAllMeals(result);
        console.log("All meals updated.", result);
      });
    }

    // setCycleName(null);
  }, [hospitalId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    console.log("allMeals updated", allMeals);
  }, [allMeals]);

  const toggleWeeklyView = () => {
    setShowWeeklyView((prev) => !prev); // Toggle between WeeklyView and ChefSpecialConfig
  };

  return (
    <div className="">
      <Tabs className="tabs" value={selectedTab} onChange={handleTabChange}>
        <Tab className="tabs__item" label="Chef Special" />
        <Tab className="tabs__item" label="Chef Special Items" />
        <Tab className="tabs__item" label="Meal Times" />
        <Tab className="tabs__item" label="Alerts" />
        <Tab className="tabs__item" label="Patient Alerts" />
        <HospitalDropdown
          hospitals={hospitals}
          hospitalId={hospitalId}
          setHospitalId={setHospitalId}
        />
      </Tabs>
      {selectedTab === 0 &&
        (showWeeklyView ? (
          <WeeklyView />
        ) : (
          <ChefSpecialConfig
            key={selectedTab}
            allMeals={allMeals}
            setAllMeals={setAllMeals}
            mealTypes={mealTypes}
            hospitalId={hospitalId}
            toggleWeeklyView={toggleWeeklyView}
          />
        ))}

      {selectedTab === 1 && (
        <MealItems
          allMeals={allMeals}
          setAllMeals={setAllMeals}
          mealTypes={mealTypes}
          hospitalId={hospitalId}
        />
      )}

      {selectedTab === 2 && (
        <MealTimes hospitalId={hospitalId} mealTypes={mealTypes} />
      )}

      {selectedTab === 3 && <Alerts hospitalId={hospitalId} />}

      {selectedTab === 4 && (
        <div>
          <h2>Patient Alerts</h2>
        </div>
      )}
    </div>
  );
};

export default App;
