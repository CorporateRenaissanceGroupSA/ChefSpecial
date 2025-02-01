import React, { useEffect, useState } from "react";
import Calendar from "react-weekly-calendar";
import { getSavedTasks } from "react-weekly-calendar/lib/utils";


const WeeklyView = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
      setTasks(getSavedTasks());
    }, []);

const groups = [
  { id: '1', label: 'Group 1', imageUrl: 'url1', },
  { id: '2', label: 'Group 2', imageUrl: 'url2',  }
];

// tasks = [
//     { taskId: '1', taskStart:'Time in milliseconde', taskEnd:'Time in milliseconde', task: 'Task 1', taskDate: new Date(), groupId: '1', dayIndex: 0,taskExpiryDate:new Date(Date.now() + 86400000) }
//   ];

const currentDate = new Date();



  return (
    <>
    <Calendar groups={groups} date={currentDate} tasks={tasks}/>
    </>
  );
};

export default WeeklyView