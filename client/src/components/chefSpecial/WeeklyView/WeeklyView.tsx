import React, { useEffect, useState, useMemo } from "react";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { getCalendarMeals } from "../../../utils/db-utils";
import { CalendarMeals, MealEntry } from "../../../types";
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

// interface WeeklyViewProps {
//   calendarMeals: Record<string, MealEntry[]>;
// }

// Date Localization
// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales,
// });

const WeeklyViewer = () => {
  const today = new Date();
  const apiEndDate = addDays(today, 180); // 6 months from today

  // Separate state for the weekly calendar view
  const [weekStart, setWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  );
  const [weekEnd, setWeekEnd] = useState(endOfWeek(today, { weekStartsOn: 1 }));
  const [meals, setMeals] = useState<CalendarMeals>({});
  const [mealTypes, setMealTypes] = useState<string[]>([]);

  // Fetch Meals (for the next 6 months)
  useEffect(() => {
    const formattedStart = format(today, "yyyy-MM-dd");
    const formattedEnd = format(apiEndDate, "yyyy-MM-dd");

    getCalendarMeals(formattedStart, formattedEnd)
      .then((data) => {
        console.log("API Response:", data);
        // setMeals(data || {});

        if (typeof data === "object") {
          // Ensure only valid meal entries are included
          const filteredMeals: CalendarMeals = Object.entries(data).reduce(
            (acc, [date, meal]) => {
              if (Array.isArray(meal) && meal.length > 0) {
                acc[date] = meal;
              }
              return acc;
            },
            {} as CalendarMeals
          );
          console.log("Filtered Meals:", filteredMeals);
          setMeals(filteredMeals);
        } else {
          console.error("Unexpected API response:", data);
          setMeals({});
        }

        // Extract unique meal types
        const types = new Set<string>();
        Object.values(data).forEach((dayMeals: any) => {
          dayMeals.forEach((meal: any) => types.add(meal.mealTypeName));
        });
        setMealTypes([...types]);
      })
      .catch((error) => console.error("Error fetching meals:", error));
  }, []);

  // Get meals for a specific day & type
  const getMealForDay = (date: Date, mealType: string) => {
    console.log(meals)
    const dateKey = format(date, "yyyy-MM-dd");
    const dayMeals = meals[dateKey] || [];
    const meal = dayMeals.find((m) => m.mealTypeName === mealType);
    return meal ? `${meal.mealName} (${meal.cycleName})` : "No Meal";
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <Button
          onClick={() => {
            setWeekStart(subDays(weekStart, 7));
            setWeekEnd(subDays(weekEnd, 7));
          }}
        >
          Previous Week
        </Button>
        <h2>Weekly Meal Plan</h2>
        <Button
          onClick={() => {
            setWeekStart(addDays(weekStart, 7));
            setWeekEnd(addDays(weekEnd, 7));
          }}
        >
          Next Week
        </Button>
      </div>

      {/* Table Layout */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Meal Type</th>
            {[...Array(7)].map((_, i) => {
              const day = addDays(weekStart, i);
              return (
                <th key={i} style={headerCellStyle}>
                  {format(day, "EEE dd")}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {mealTypes.map((type) => (
            <tr key={type}>
              <td style={mealTypeCellStyle}>{type}</td>
              {[...Array(7)].map((_, i) => {
                const day = addDays(weekStart, i);
                console.log(day)
                return (
                  <td
                    key={i}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {getMealForDay(day, type)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const headerCellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f4f4f4",
};
const mealTypeCellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  fontWeight: "bold",
};
const mealCellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};

export default WeeklyViewer;