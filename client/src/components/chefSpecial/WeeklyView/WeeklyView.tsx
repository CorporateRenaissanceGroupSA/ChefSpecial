import React, { useEffect, useState } from "react";
import Calendar from "react-weekly-calendar";
import { getCalendarMeals } from "../../../utils/db-utils";
import { WeeklyNavigation } from "./WeeklyNavigation";

const WeeklyView = () => {
  // const [tasks, setTasks] = useState([]);

  // useEffect(() => {
  //   // setTasks(getSavedTasks());

  // }, []);

  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    getCalendarMeals("2024-01-01", "2025-12-31");
  }, []);
  const currentDate = new Date();

  const groups = [
    { id: "1", label: "Group 1", imageUrl: "url1" },
    { id: "2", label: "Group 2", imageUrl: "url2" },
  ];
  // const currentDate = new Date();
  const milliseconds = currentDate.getMilliseconds();
  const tasks = [
    {
      taskId: "1",
      taskStart: milliseconds,
      taskEnd: milliseconds,
      task: "Task 1",
      taskDate: new Date(),
      groupId: "1",
      dayIndex: 0,
    },
  ];

  return (
    <>
      <WeeklyNavigation
        calendarDate={calendarDate}
        setCalendarDate={setCalendarDate}
        setCalendarOffset={() => {}}
      />
      <Calendar
        groups={groups}
        date={currentDate}
        tasks={tasks}
        weekOffset={-7}
      />
    </>
  );
};

export default WeeklyView;
