import express = require("express");
const cors = require("cors");
import { logger } from "../utils/logger";
import { sql } from "../index";
import { meal } from "./meal";
import { cycle } from "./cycle";
import { note } from "./note";
import {
  checkRequiredFields,
  cleanDate,
  formattedDate,
  safeQuery,
} from "../utils/api-utils";

export function startApi(port: number) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/cycle", cycle);
  app.use("/meal", meal);
  app.use("/note", note);

  // returns the hospitals where the specified user is assigned to catering roles
  app.post("/user-hospitals", async (req, res) => {
    logger.api('Received request to "/user-hospitals" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);
    const requiredFields: string[] = ["userId"];
    let requiredFieldMissing = checkRequiredFields(reqData, requiredFields);
    if (requiredFieldMissing) {
      res
        .status(400)
        .send("Required input field missing: " + requiredFieldMissing);
      return;
    }

    const queryStr = `
    SELECT DISTINCT(H.Id), H.Name as hospitalName 
    FROM dbo.HospitalPortfolio as HP
    LEFT JOIN dbo.Hospital as H ON H.Id = HP.Hospital
    LEFT JOIN dbo.Portfolio as P ON P.Id = HP.Portfolio
    LEFT JOIN dbo.ServiceGroup as SG ON SG.Id = P.ServiceGroup
    WHERE SG.Service = 'Catering' AND HP.UserName = ${reqData.userId} and HP.isActive = 'true'
    ;
    `;

    let resultQuery = await safeQuery(sql, queryStr);
    if (!resultQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: resultQuery.result,
      });
      return;
    }
    let result = resultQuery.result.recordset;
    console.log("Result: ", result);
    res.send(result);
  });

  app.post("/meal-types", async (req, res) => {
    logger.api('Received request to "/meal-types" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);
    const requiredFields: string[] = ["hospitalId"];
    let requiredFieldMissing = checkRequiredFields(reqData, requiredFields);
    if (requiredFieldMissing) {
      res
        .status(400)
        .send("Required input field missing: " + requiredFieldMissing);
      return;
    }

    const queryStr = `
    SELECT DISTINCT MM.Id mealTypeId, MM.MealDescription as mealTypeNameGlobal, MM.CutOffTime as mealTypeCutoffGlobal,
    MO.name as mealTypeNameHospital, MO.cutoffTime as mealTypeCutoffHospital, MO.servedTime as mealTypeServedTime
    FROM dbo.Hospital H
    JOIN dbo.HospitalMenu as HM ON H.Id = HM.Hospital
    JOIN dbo.MenuItem as MI ON HM.Menu = MI.Menu
    JOIN dbo.MenuMeal as MM ON MM.id = MI.Meal
    LEFT JOIN Ems.CSMealTypeOverride as MO ON MO.mealTypeId = MI.Meal AND MO.hospitalId = H.Id
    WHERE H.Id = ${reqData.hospitalId}
    ORDER BY MM.Id ASC
    ;
    `;
    // const queryStr = `
    // SELECT DISTINCT MM.Id mealId, MM.MealDescription as mealTypeNameGlobal, MM.CutOffTime as mealTypeCutoffGlobal
    // FROM dbo.Hospital H
    // JOIN dbo.HospitalMenu as HM ON H.Id = HM.Hospital
    // JOIN dbo.MenuItem as MI ON HM.Menu = MI.Menu
    // JOIN dbo.MenuMeal as MM ON MM.id = MI.Meal
    // WHERE H.Id = ${reqData.hospitalId}
    // ORDER BY MM.Id ASC
    // ;
    // `;

    let resultQuery = await safeQuery(sql, queryStr);
    if (!resultQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: resultQuery.result,
      });
      return;
    }
    let result = resultQuery.result.recordset;
    // set the mealType name and cutoff to hospital value if it exists otherwise use global value
    result = result.map((data: any) => {
      data.mealTypeName = data.mealTypeNameGlobal;
      if (data.mealTypeNameHospital) {
        data.mealTypeName = data.mealTypeNameHospital;
      }
      data.mealTypeCutoff = data.mealTypeCutoffGlobal;
      if (data.mealTypeCutoffHospital) {
        data.mealTypeCutoff = data.mealTypeCutoffHospital;
      }
      return data;
    });
    console.log("Result: ", result);
    res.send(result);
  });

  app.post("/served-options", async (req, res) => {
    logger.api('Received request to "/served-options" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);

    const queryStr = `
    SELECT *
    FROM dbo.ItemServed
    ;
    `;

    let resultQuery = await safeQuery(sql, queryStr);
    if (!resultQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: resultQuery.result,
      });
      return;
    }
    let result = resultQuery.result.recordset;
    console.log("Result: ", result);
    res.send(result);
  });

  app.post("/calendar-meals", async (req, res) => {
    logger.api('Received request to "/calendar-meals" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);
    const requiredFields: string[] = ["hospitalId", "startDate", "endDate"];
    let requiredFieldMissing = checkRequiredFields(reqData, requiredFields);
    if (requiredFieldMissing) {
      res
        .status(400)
        .send("Required input field missing: " + requiredFieldMissing);
      return;
    }
    if (cleanDate(reqData.startDate).toString() == "Invalid Date") {
      res
        .status(404)
        .send(
          "Could not convert startDate to a valid date: " + reqData.startDate
        );
      return;
    }
    let startDate = formattedDate(cleanDate(reqData.startDate));

    if (cleanDate(reqData.endDate).toString() == "Invalid Date") {
      res
        .status(404)
        .send("Could not convert endDate to a valid date: " + reqData.endDate);
      return;
    }
    let endDate = formattedDate(cleanDate(reqData.endDate));

    if (startDate > endDate) {
      res
        .status(400)
        .send(`startDate (${startDate}) cannot fall after endDate(${endDate})`);
      return;
    }

    const queryStr = `
    SELECT C.Id as cycleId, C.name as cycleName, C.startDate as cycleStartDate, C.endDate as cycleEndDate, C.cycleDays, C.hospitalId, H.Name as hospitalName, CI.mealTypeId, 
    IIF(MO.name IS NOT NULL,MO.name, MT.mealName) as mealTypeName, M.Id as mealId, M.name as mealName, CI.cycleDay as mealCycleDay, CI.Id as cycleItemId
    FROM Ems.CSCycle as C
    LEFT JOIN dbo.Hospital as H ON C.hospitalId = H.Id
    RIGHT JOIN Ems.CSCycleItem as CI ON CI.cycleId = C.Id
    LEFT JOIN dbo.menuMeal as MT ON MT.Id = CI.mealTypeId
    LEFT JOIN Ems.CSMealTypeOverride as MO ON MO.mealTypeId = CI.mealTypeId
    LEFT JOIN Ems.CSMeal as M ON M.Id = CI.mealId
    WHERE 
    C.hospitalId = ${reqData.hospitalId} AND
    C.StartDate <= '${endDate}' AND 
    (C.endDate IS NULL OR C.endDate >= '${startDate}') 
    AND C.isActive = 'true' AND CI.isActive = 'true'
    ;
    `;

    let dataQuery = await safeQuery(sql, queryStr);
    if (!dataQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: dataQuery.result,
      });
      return;
    }
    let data = dataQuery.result.recordset;
    logger.debug("Query Results: ", data);
    let result: any = {};

    let calendarDate = startDate;
    while (calendarDate <= endDate) {
      let dateResult: any[] = [];
      logger.debug("Calendar Date: " + calendarDate);
      data.forEach((dataItem: any) => {
        let itemCycleStartDate = formattedDate(
          new Date(dataItem.cycleStartDate)
        );
        let itemCycleEndDate = dataItem.cycleEndDate
          ? formattedDate(new Date(dataItem.cycleEndDate))
          : undefined;
        if (
          itemCycleStartDate <= calendarDate &&
          (!itemCycleEndDate || itemCycleEndDate >= calendarDate)
        ) {
          // logger.debug("Considering day for inclusion: ", dataItem);
          let daysSinceCycleStart = daysDiff(
            new Date(calendarDate),
            new Date(itemCycleStartDate)
          );
          logger.debug("Days since cycle start: " + (daysSinceCycleStart + 1));
          let daysIntoCycle = daysSinceCycleStart % dataItem.cycleDays;
          logger.debug("Days into cycle: " + daysIntoCycle);
          if (dataItem.mealCycleDay == daysIntoCycle) {
            dataItem.calendarDate = calendarDate;
            logger.debug(
              `Calendar Date: ${calendarDate} Days Into Cycle: ${daysIntoCycle} Data Item: `,
              dataItem
            );
            dateResult.push({ ...dataItem });
          }
        }
      });
      result[calendarDate] = dateResult;
      calendarDate = formattedDate(
        new Date(
          new Date(calendarDate).setDate(new Date(calendarDate).getDate() + 1)
        )
      );
    }
    // console.log("Result: ", result);
    res.send(result);
  });

  app.listen(port, "0.0.0.0", () => {
    logger.api("REST API server is listening on port " + port);
  });
}

function daysDiff(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  let diff = Math.round(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
  return diff;
}

function transFormCalendarDate(result: any): any {}
