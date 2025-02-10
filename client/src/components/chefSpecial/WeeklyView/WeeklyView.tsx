import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  getISOWeek,
  getDay,
} from "date-fns";
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
  TextField,
  tableRowClasses,
  tableClasses,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useReactToPrint } from "react-to-print";
import {
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const StyleTable = styled(Table)(() => ({
  [`&.${tableClasses.root}`]: {
    // fontFamily: "Poppins"
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F6F6F6",
    color: "#656565",
    borderBottom: "none",
    textTransform: "uppercase",
    fontFamily: "Poppins",
    padding: "10px 10px",
    width: "calc(100%/8)",
    lineHeight: "1.1rem",
    border: "none",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: "10px",
    border: "1px solid #f2f2f2 !important",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "& td": {
    borderBottom: "1px solid #F1F1F1",
  },
}));

// Meal Type Color Mapping
const mealTypeColors: Record<string, string> = {
  1: "rgba(244, 159, 4",
  2: "rgba(239, 202, 8",
  3: "rgba(142, 162, 8",
  5: "rgba(0, 166, 108",
  6: "rgba(0, 187, 172",
  7: "rgba(58, 142, 237",
  8: "rgba(154, 72, 255",
  10: "rgba(175, 0, 198",
  11: "rgba(202, 0, 78",
  12: "#fdfdfd",
};

interface WeeklyViewProps {
  hospitalId: number;
  toggleWeeklyView: () => void;
}

const WeeklyViewer: React.FC<WeeklyViewProps> = ({
  hospitalId,
  toggleWeeklyView,
}) => {
  console.log(typeof hospitalId);
  const today = new Date();
  const apiEndDate = addDays(today, 180); // 6 months from today

  // Separate state for the weekly calendar view
  const [weekStart, setWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  );
  const [weekEnd, setWeekEnd] = useState(endOfWeek(today, { weekStartsOn: 1 }));
  const [meals, setMeals] = useState<CalendarMeals>({});
  const [mealTypes, setMealTypes] = useState<{ id: number; name: string }[]>(
    []
  );

  // Fetch Meals (for the next 6 months)
  useEffect(() => {
    const formattedStart = format(today, "yyyy-MM-dd");
    const formattedEnd = format(apiEndDate, "yyyy-MM-dd");

    getCalendarMeals(hospitalId, formattedStart, formattedEnd)
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

        const types = new Map<number, string>();
        Object.values(data).forEach((dayMeals: any) => {
          dayMeals.forEach((meal: any) =>
            types.set(meal.mealTypeId, meal.mealTypeName)
          );
        });
        setMealTypes(
          Array.from(types.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.id - b.id)
        );
      })
      .catch((error) => console.error("Error fetching meals:", error));
  }, []);

  // Get meals for a specific day & type
  const getMealForDay = (date: Date, mealTypeId: number) => {
    console.log(meals);
    const dateKey = format(date, "yyyy-MM-dd");
    const dayMeals = meals[dateKey] || [];

    // Filter out duplicate meal names
    const uniqueMeals = Array.from(
      new Map(
        dayMeals
          .filter((m) => m.mealTypeId === mealTypeId)
          .map((meal) => [meal.mealName, meal])
      ).values()
    );

    // const mealList = dayMeals.find((m) => m.mealTypeId === mealTypeId);
    // const mealList = dayMeals.filter((m) => m.mealTypeId === mealTypeId) || [];

    return uniqueMeals.length > 0
      ? uniqueMeals.map((meal, index) => (
          // return meal ? (
          <div
            key={index}
            className="meal-box"
            style={{
              backgroundColor: `${mealTypeColors[mealTypeId]}, 0.10)` || "#ddd",
              borderLeft: `2px solid ${mealTypeColors[mealTypeId]})`,
              padding: "8px",
              borderRadius: "1px",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              marginBottom: "10px",
            }}
          >
            <div
              className="meal-name"
              style={{ fontSize: "14px", fontWeight: "500" }}
            >
              {meal.mealName}
            </div>
            <div
              className="meal-cycle"
              style={{ fontSize: "10px", color: "#424242" }}
            >
              {meal.cycleName}
            </div>
          </div>
        ))
      : "";
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrint = useReactToPrint({ contentRef });

  return (
    <div style={{ padding: "20px" }} ref={contentRef}>
      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>
            {format(weekStart, "MMMM")} {format(weekStart, "d")} -{" "}
            {format(weekEnd, "d")}
          </div>
          <p style={{ fontSize: "15px", color: "#a7a7a7" }}>
            {format(weekStart, "yyyy")}
          </p>
        </div>

        <div>
          <div className="flex gap-7">
            <ToggleButtonGroup
              color="primary"
              exclusive
              aria-label="Toggle Week"
            >
              <ToggleButton
                value="previousWeek"
                onClick={() => {
                  setWeekStart(subDays(weekStart, 7));
                  setWeekEnd(subDays(weekEnd, 7));
                }}
              >
                <ChevronLeftIcon className="size-4" />
              </ToggleButton>
              <ToggleButton
                value="today"
                onClick={() => {
                  const monday = startOfWeek(today, { weekStartsOn: 1 });
                  setWeekStart(monday);
                  setWeekEnd(endOfWeek(monday, { weekStartsOn: 1 }));
                }}
              >
                <p className="text-sm font-medium">Today</p>
              </ToggleButton>
              <ToggleButton
                value="nextWeek"
                onClick={() => {
                  setWeekStart(addDays(weekStart, 7));
                  setWeekEnd(addDays(weekEnd, 7));
                }}
              >
                <ChevronRightIcon className="size-4" />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* <div>Week {getISOWeek(weekStart)}</div> */}

            <div className="flex gap-3">
              <Button
                onClick={() => reactToPrint()}
                sx={{
                  minWidth: "24px",
                  padding: 0,
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                <PrinterIcon
                  className="size-8 text-[#FFB600]"
                  strokeWidth={0.7}
                />
              </Button>

              <Button
                onClick={toggleWeeklyView}
                sx={{
                  minWidth: "24px",
                  padding: 0,
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                <Cog6ToothIcon
                  className="size-8 text-[#FFB600]"
                  strokeWidth={0.7}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Layout */}
      <div>
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
            sx={{ marginTop: 2, minHeight: "75 vh" }}
          >
            <StyleTable stickyHeader>
              <TableHead>
                {/* <TableRow>
                  <TableCell sx={{ borderBottom: "0px" }}></TableCell>
                  * Week *
                  <TableCell
                    align="center"
                    colSpan={9}
                    sx={{
                      padding: "2px 16px",
                      textTransform: "uppercase",
                      color: "#656565 !important",
                    }}
                  >
                    Week {getISOWeek(weekStart)}
                  </TableCell>
                </TableRow> */}
                <TableRow>
                  {/* <TableCell sx={{ borderBottom: "0px" }}></TableCell>
                  * Month Year *
                  <TableCell
                    align="center"
                    colSpan={9}
                    sx={{
                      padding: "2px 16px",
                      textTransform: "uppercase",
                      color: "#656565",
                    }}
                  >
                    {format(weekStart, "MMMM yyyy")}
                  </TableCell> */}
                </TableRow>
                <TableRow>
                  <StyledTableCell sx={{ borderBottom: "0px" }}>
                    Meal Types
                  </StyledTableCell>
                  {/* Day */}
                  {[...Array(7)].map((_, i) => {
                    const day = addDays(weekStart, i);
                    return (
                      <StyledTableCell
                        key={i}
                        align="center"
                        style={{
                          borderBottom:
                            today.toDateString() === day.toDateString()
                              ? "3px solid #FFB600"
                              : "none",
                        }}
                      >
                        <div>
                          {format(day, "dd ")}
                          <span style={{ fontWeight: "300" }}>
                            {format(day, "eeee")}
                          </span>
                        </div>
                      </StyledTableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {mealTypes.map(({ id, name }) => (
                  <TableRow key={id} sx={{ height: "130px" }}>
                    <StyledTableCell>
                      <div style={{ display: "flex" }}>
                        <div>
                          <div
                            style={{
                              display: "inline-block",
                              width: "15px",
                              height: "15px",
                              backgroundColor: mealTypeColors[id] || "#ddd",
                              marginRight: "5px",
                              marginTop: "2px",
                              borderRadius: "50px",
                              boxShadow:
                                "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                            }}
                          ></div>
                        </div>
                        <div>{name}</div>
                      </div>
                    </StyledTableCell>
                    {[...Array(7)].map((_, i) => {
                      const day = addDays(weekStart, i);
                      console.log(day);
                      const isWeekend = getDay(day) === 6 || getDay(day) === 0;
                      return (
                        <StyledTableCell
                          key={i}
                          style={{
                            border: "1px solid #ddd",
                            padding: "30px 5px",
                            background: isWeekend ? "#fafafa" : "white",
                          }}
                        >
                          {getMealForDay(addDays(weekStart, i), id)}
                        </StyledTableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </StyleTable>
          </TableContainer>
        </Paper>
      </div>
    </div>
  );
};

export default WeeklyViewer;
