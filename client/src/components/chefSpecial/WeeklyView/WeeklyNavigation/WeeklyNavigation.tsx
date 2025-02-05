import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
// import {
//   updateCalendarDateWithOffset,
//   updateOffsetWithDateCalendar,
// } from "react-weekly-calendar/lib/utils";

// type WeeklyNavigationProps = {
//   calendarDate: Date;
//   setCalendarDate: (date: Date) => void;
//   setCalendarOffset: (offset: number) => void;
// };

const WeeklyNavigation = () => {
//   calendarDate,
//   setCalendarDate,
//   setCalendarOffset,
// }: WeeklyNavigationProps) => {
//   const [calendarOffset, setLocalCalendarOffset] = useState(0);

//   const handleChangeCalendarDate = (value: dayjs.Dayjs | null) => {
//     if (value) {
//       const newDate = value.toDate();
//       setCalendarDate(newDate);
//       const newOffset = updateOffsetWithDateCalendar(newDate);
//       setCalendarOffset(newOffset);
//       setLocalCalendarOffset(newOffset);
//     }
//   };

//   const handleChangeOffset = (offset: number) => {
//     const newOffset = calendarOffset + offset;
//     const newCalendarDate = updateCalendarDateWithOffset(offset, calendarDate);
//     setCalendarOffset(newOffset);
//     setCalendarDate(newCalendarDate);
//     setLocalCalendarOffset(newOffset);
//   };

//   const weekFormat = (value: dayjs.Dayjs) => {
//     return `${value.startOf("week").format("DD MMM YYYY")} - ${value
//       .endOf("week")
//       .format("DD MMM YYYY")}`;
//   };

  return (
    <>
    <div></div>
    </>
//     <div className="w-full h-[50px] flex p-2 items-center justify-between">
//       <DatePicker
//         value={dayjs(calendarDate)}
//         onChange={handleChangeCalendarDate}
//         picker="week"
//         format={weekFormat}
//       />
//       <div className="flex gap-2">
//         <Button
//           className="bg-[#f2f8fb]"
//           onClick={() => handleChangeOffset(-7)}
//         >
//           Previous week
//         </Button>
//         <Button
//           className="bg-[#f2f8fb]"
//           onClick={() => handleChangeOffset(7)}
//         >
//           Next week
//         </Button>
//       </div>
//     </div>
  );
};

export default WeeklyNavigation;
