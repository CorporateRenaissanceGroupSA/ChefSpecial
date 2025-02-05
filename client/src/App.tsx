import React, { useState, useEffect } from "react";
import "./App.scss";
import { Tabs, Tab } from "@mui/material";
import {
  ChefSpecialConfig,
  MealItems,
  WeeklyView,
  MealTimes,
  Alerts,
} from "./Components";
// import MealItems from "./Components/ChefSpecialItems/MealItems/MealItems";
import { getHospitals, getMealTypeList, getMealsList, getCalendarMeals } from "./utils/db-utils";
import { Hospitals, Meal, MealType, MealDays, CalendarMeals } from "./types";
import HospitalDropdown from "./Components/HospitalDropdown";
import { each } from "lodash";
import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const App: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [hospitals, setHospitals] = useState<Hospitals[]>([]);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [userId, setUserId] = useState<number>(81);
  const [showWeeklyView, setShowWeeklyView] = useState(false);
  // const [calendarDate, setCalendarDate] = useState(new Date());
  // const [calendarMeals, setCalendarMeals] = useState<CalendarMeals>({});

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

    // setCycleName(null);
  }, [hospitalId]);

  // Fetch Meals for the Week
  // useEffect(() => {
  //   console.log(calendarDate);
  //   const startDate = new Date(calendarDate.getFullYear(), 0, 1)
  //     .toISOString()
  //     .split("T")[0];
  //   const endDate = new Date(calendarDate.getFullYear(), 3, 31)
  //     .toISOString()
  //     .split("T")[0];

  //   console.log(startDate, endDate);

  //   getCalendarMeals(startDate, endDate)
  //     .then((data) => {
  //       console.log("Raw API data:", data);
  //       if (typeof data === "object") {
  //         // Ensure only valid meal entries are included
  //         const filteredMeals: CalendarMeals = Object.entries(data).reduce(
  //           (acc, [date, meal]) => {
  //             if (Array.isArray(meal) && meal.length > 0) {
  //               acc[date] = meal;
  //             }
  //             return acc;
  //           },
  //           {} as CalendarMeals
  //         );
  //         console.log("Filtered Meals:", filteredMeals);
  //         setCalendarMeals(filteredMeals);
  //       } else {
  //         console.error("Unexpected API response:", data);
  //         setCalendarMeals({});
  //       }
  //     })
  //     .catch((error) => console.error("Error fetching meals:", error));
  // }, [calendarDate]);

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
        <Tab className="tabs__item" label="Staff Notifications" />
        <Tab className="tabs__item" label="Patient Notifications" />
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
        <MealTimes hospitalId={hospitalId} setMealTypes={setMealTypes} />
      )}

      {selectedTab === 3 && <Alerts hospitalId={hospitalId} userId={userId} />}

      {selectedTab === 4 && (
        <div>
          <h2>Patient Notifications</h2>
        </div>
      )}
    </div>
  );
};

export default App;
