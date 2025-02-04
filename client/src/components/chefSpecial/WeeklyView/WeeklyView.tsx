import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Calendar from "react-weekly-calendar";
import { getCalendarMeals } from "../../../utils/db-utils";
import { WeeklyNavigation } from "./WeeklyNavigation";
import { CalendarMeals } from "../../../types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const WeeklyView = () => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [meals, setMeals] = useState<CalendarMeals[]>([]);

  // Format date as "Mon\n2 Feb"
  const formatDayHeader = (date: Date) => {
    return `${date.toLocaleDateString("en-US", {
      weekday: "short",
    })}\n${date.getDate()} ${date.toLocaleDateString("en-US", {
      month: "short",
    })}`;
  };

  // Get start and end of the current week
  const getWeekDates = (startDate: Date) => {
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Get Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  useEffect(() => {
    const weekDates = getWeekDates(calendarDate);
    const startDate = weekDates[0].toISOString().split("T")[0];
    const endDate = weekDates[6].toISOString().split("T")[0];

    getCalendarMeals(startDate, "2025-03-31").then((data) => {
      setMeals(Array.isArray(data) ? data : []);
    });
  }, [calendarDate]);

  // Extract unique meal types
  const mealTypes = Array.from(new Set(meals.map((meal) => meal.mealTypeName)));

  // Structure data as { [mealType]: { [day]: [meals] } }
  const mealData = mealTypes.map((mealType) => {
    const row: { [key: string]: string } = { mealType };
    getWeekDates(calendarDate).forEach((day) => {
      const dateStr = day.toISOString().split("T")[0];
      const mealsForDay = meals
        .filter(
          (meal) =>
            meal.mealTypeName === mealType && meal.calendarDate === dateStr
        )
        .map((meal) => `${meal.mealName} (${meal.cycleName})`)
        .join(", ");
      row[dateStr] = mealsForDay || "—"; // Fallback if no meal
    });
    return row;
  });

  // Column Definitions
  const columns = [
    {
      header: "Meal Type",
      accessorKey: "mealType",
    },
    ...getWeekDates(calendarDate).map((date) => ({
      header: formatDayHeader(date),
      accessorKey: date.toISOString().split("T")[0],
    })),
  ];

  // React Table Instance
  const table = useReactTable({
    data: mealData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <Button
          onClick={() =>
            setCalendarDate(
              new Date(calendarDate.setDate(calendarDate.getDate() - 7))
            )
          }
        >
          Previous Week
        </Button>
        <h2>Meal Schedule</h2>
        <Button
          onClick={() =>
            setCalendarDate(
              new Date(calendarDate.setDate(calendarDate.getDate() + 7))
            )
          }
        >
          Next Week
        </Button>
      </div>

      {/* Meal Schedule Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    style={{ whiteSpace: "pre-line", fontWeight: "bold" }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    onMouseEnter={(e) =>
                      e.currentTarget.classList.add("addPlanStyle")
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.classList.remove("addPlanStyle")
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default WeeklyView;
