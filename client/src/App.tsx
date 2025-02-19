import React, { useState, useEffect } from "react";
import "./App.scss";
import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { getHospitals, getMealTypeList, getMealsList } from "./utils/db-utils";
import { Hospitals, Meal, MealType, MealDays, CalendarMeals } from "./types";
import HospitalDropdown from "./Components/HospitalDropdown";
import {
  ChefSpecialConfig,
  MealItems,
  WeeklyView,
  MealTimes,
  AlertsTable,
  Message,
} from "./Components";
import { Tabs, Tab } from "@mui/material";
import noHospitalImage from "./Components/Assets/noHospital.png";

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [hospitals, setHospitals] = useState<Hospitals[]>([]);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [userId, setUserId] = useState<number>(81);
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
      console.log("updated hospitalId: ", hospitalId);

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
  }, [hospitalId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    console.log("allMeals updated", allMeals);
  }, [allMeals]);

  // Map tabIndex to noteType
  const getNoteType = (tabIndex: number): string | null => {
    console.log(tabIndex);
    if (tabIndex === 3) return "Staff";
    if (tabIndex === 4) return "Patient";
    return null;
  };

  const toggleWeeklyView = () => {
    setShowWeeklyView((prev) => !prev); // Toggle between WeeklyView and ChefSpecialConfig
  };

  return (
    <div className="">
      <Tabs className="tabs" value={selectedTab} onChange={handleTabChange}>
        <Tab className="tabs__item" label="Chef Special" />
        <Tab className="tabs__item" label="Chef Special Items" />
        <Tab className="tabs__item" label="Meal Times" />
        <Tab className="tabs__item" label="Staff Notifications" />
        <Tab className="tabs__item" label="Patient Notifications" />
        <HospitalDropdown
          hospitals={hospitals}
          hospitalId={hospitalId}
          setHospitalId={setHospitalId}
        />
      </Tabs>
      {selectedTab === 0 &&
        (hospitalId === null ? (
          <Message
            img={noHospitalImage}
            alt={"No Site Selected"}
            title={"No Site Selected"}
            subtitle={"Choose a site in the navigation bar on top."}
            imgWidth={"300px"}
            titleFontWeight={"medium"}
          />
        ) : showWeeklyView ? (
          <WeeklyView
            hospitalId={hospitalId}
            toggleWeeklyView={toggleWeeklyView}
          />
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

      {selectedTab === 1 &&
        (hospitalId === null ? (
          <Message
            img={noHospitalImage}
            alt={"No Site Selected"}
            title={"No Site Selected"}
            subtitle={"Choose a site in the navigation bar on top."}
            imgWidth={"300px"}
            titleFontWeight={"medium"}
          />
        ) : (
          <MealItems
            allMeals={allMeals}
            setAllMeals={setAllMeals}
            mealTypes={mealTypes}
            hospitalId={hospitalId}
          />
        ))}

      {selectedTab === 2 &&
        (hospitalId === null ? (
          <Message
            img={noHospitalImage}
            alt={"No Site Selected"}
            title={"No Site Selected"}
            subtitle={"Choose a site in the navigation bar on top."}
            imgWidth={"300px"}
            titleFontWeight={"medium"}
          />
        ) : (
          <MealTimes hospitalId={hospitalId} setMealTypes={setMealTypes} />
        ))}

      {selectedTab === 3 &&
        (hospitalId === null ? (
          <Message
            img={noHospitalImage}
            alt={"No Site Selected"}
            title={"No Site Selected"}
            subtitle={"Choose a site in the navigation bar on top."}
            imgWidth={"300px"}
            titleFontWeight={"medium"}
          />
        ) : (
          <AlertsTable
            hospitalId={hospitalId}
            userId={userId}
            noteType={getNoteType(selectedTab)!}
          />
        ))}

      {selectedTab === 4 &&
        (hospitalId === null ? (
          <Message
            img={noHospitalImage}
            alt={"No Site Selected"}
            title={"No Site Selected"}
            subtitle={"Choose a site in the navigation bar on top."}
            imgWidth={"300px"}
            titleFontWeight={"bold"}
          />
        ) : (
          <AlertsTable
            hospitalId={hospitalId}
            userId={userId}
            noteType={getNoteType(selectedTab)!}
          />
        ))}
    </div>
  );
};

export default App;
