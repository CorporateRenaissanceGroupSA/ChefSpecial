import { sql } from "../index";
import { logger } from "../utils/logger";
import express = require("express");
import {
  checkDates,
  checkRequiredFields,
  createMergeQuery,
  FieldInfo,
  getRequiredFields,
  safeQuery,
} from "../utils/api-utils";

export const cycle = express.Router();

// endpoint to list all existing cycles for the specified hospital
cycle.post("/list", async (req, res) => {
  logger.api('Received request to "/cycle/list" api endpoint');
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
    SELECT C.Id, C.name, C.cycleDays, H.Id as hospitalId, H.name as hospitalName, C.startDate, C.endDate, C.createDate, C.createdBy, U.name as CreatedByName, C.isActive 
    FROM Ems.CSCycle as C
    LEFT JOIN dbo.Hospital as H ON C.hospitalId = H.Id
    LEFT JOIN dbo.users as U ON C.createdBy = U.Id
    WHERE C.hospitalId = '${reqData.hospitalId}'
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

// endpoint to provide the cycle information for the specified cycle
cycle.post("/info", async (req, res) => {
  logger.api('Received request to "/cycle/info" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  const requiredFields: string[] = ["Id"];
  let requiredFieldMissing = checkRequiredFields(reqData, requiredFields);
  if (requiredFieldMissing) {
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  const cycleInfoQueryStr = `
    SELECT C.Id, C.name, C.cycleDays, C.hospitalId, H.name as hospitalName, C.startDate, C.endDate, C.createDate, C.createdBy, C.isActive 
    FROM Ems.CSCycle as C
    LEFT JOIN dbo.Hospital as H ON C.hospitalId = H.Id
    LEFT JOIN dbo.users as U ON C.createdBy = U.Id
    WHERE C.Id = '${reqData.Id}'
    ;
    `;
  let cycleQuery = await safeQuery(sql, cycleInfoQueryStr);
  if (!cycleQuery.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: cycleQuery.result,
    });
    return;
  }
  if (cycleQuery.result.recordset.length <= 0) {
    res
      .status(400)
      .send("Could not find Chef Special Cycle with id " + reqData.Id);
    return;
  }

  res.send({
    cycleInfo: cycleQuery.result.recordset[0],
  });
});

cycle.post("/selected-mealtypes", async (req, res) => {
  logger.api('Received request to "/cycle/selected-mealtypes" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  let requiredFieldMissing = checkRequiredFields(reqData, ["cycleId"]);
  if (requiredFieldMissing) {
    logger.error("Required input field missing: " + requiredFieldMissing);
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }

  const queryStr = `
    SELECT
    MT.Id as mealTypeId, MT.mealDescription as mealType
    FROM Ems.CSCycleItem as CI
    LEFT JOIN dbo.MenuMeal as MT ON CI.mealTypeId = MT.Id
    WHERE CI.cycleId = '${reqData.cycleId}'
    GROUP BY MT.Id, MT.mealDescription
    `;
  let query = await safeQuery(sql, queryStr);
  if (!query.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: query.result,
    });
    return;
  }
  res.send({ mealItems: query.result.recordset });
});

cycle.post("/meal-days", async (req, res) => {
  logger.api('Received request to "/cycle/meal-days" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  let requiredFieldMissing = checkRequiredFields(reqData, ["cycleId"]);
  if (requiredFieldMissing) {
    logger.error("Required input field missing: " + requiredFieldMissing);
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }

  let mealTypeId = undefined;
  if (reqData.mealTypeId) {
    mealTypeId = reqData.mealTypeId;
  }

  const queryStr = `
    SELECT
    CI.*, MT.mealDescription as mealType, M.name as mealName, M.description as mealDescription, U.name as createdByName
    FROM Ems.CSCycleItem as CI
    LEFT JOIN dbo.MenuMeal as MT ON CI.mealTypeId = MT.Id
    LEFT JOIN Ems.CSMeal as M ON CI.mealId = M.Id
    LEFT JOIN dbo.users as U ON CI.createdBy = U.Id
    WHERE CI.cycleId = '${reqData.cycleId}' ${mealTypeId != undefined ? "AND CI.MealTypeId = " + reqData.mealTypeId : ""}
    `;
  let query = await safeQuery(sql, queryStr);
  if (!query.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: query.result,
    });
    return;
  }
  res.send({ mealItems: query.result.recordset });
});

cycle.post("/meal-type/meal-days", async (req, res) => {
  logger.api('Received request to "/cycle/meal-type/meal-days" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  let requiredFieldMissing = checkRequiredFields(reqData, [
    "cycleId",
    "mealTypeId",
  ]);
  if (requiredFieldMissing) {
    logger.error("Required input field missing: " + requiredFieldMissing);
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  const queryStr = `
    SELECT
    CI.*, MT.mealDescription as mealType, M.name as mealName, M.description as mealDescription, U.name as createdByName
    FROM Ems.CSCycleItem as CI
    LEFT JOIN dbo.MenuMeal as MT ON CI.mealTypeId = MT.Id
    LEFT JOIN Ems.CSMeal as M ON CI.mealId = M.Id
    LEFT JOIN dbo.users as U ON CI.createdBy = U.Id
    WHERE CI.cycleId = '${reqData.cycleId}' AND CI.MealTypeId = '${reqData.mealTypeId}'
    `;
  let query = await safeQuery(sql, queryStr);
  if (!query.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: query.result,
    });
    return;
  }
  res.send({ mealItems: query.result.recordset });
});

cycle.post("/merge-info", async (req, res) => {
  logger.api('Received request to "/cycle/merge-info" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  const cycleFields: FieldInfo[] = [
    new FieldInfo("Id", "number", true),
    new FieldInfo("hospitalId", "number", true),
    new FieldInfo("name", "other", true),
    new FieldInfo("cycleDays", "number", true),
    new FieldInfo("startDate", "date", false),
    new FieldInfo("endDate", "date", false),
    new FieldInfo("createdBy", "number", false),
    new FieldInfo("isActive", "other", false),
  ];

  let requiredFieldMissing = checkRequiredFields(
    reqData,
    getRequiredFields(cycleFields)
  );
  if (requiredFieldMissing) {
    logger.error("Required input field missing: " + requiredFieldMissing);
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  let errorField = checkDates(reqData, cycleFields);
  if (errorField) {
    res
      .status(400)
      .send(
        errorField.name +
          " cannot be converted to a valid date." +
          reqData[errorField.name]
      );
    return;
  }

  const mergeCycleQueryString = createMergeQuery(
    "Ems.CSCycle",
    reqData,
    cycleFields
  );
  logger.debug("Merge Cycle query string: ", mergeCycleQueryString);
  let mergeCycleQuery = await safeQuery(sql, mergeCycleQueryString);
  // let mergeLeadQuery = {
  //   success: true,
  //   result: {},
  //   queryString: mergeLeadQueryString,
  // };
  if (!mergeCycleQuery.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: mergeCycleQuery.result,
      queryString: mergeCycleQuery.queryString,
    });
    return;
  }
  logger.debug("Merge Cycle query result: ", mergeCycleQuery);
  let id;
  if (reqData.Id == "null" || !reqData.Id) {
    id = mergeCycleQuery.result.recordset[0].Id;
  } else {
    id = reqData.Id;
  }
  res.send({
    Id: id,
  });
});

cycle.post("/merge-item", async (req, res) => {
  logger.api('Received request to "/cycle/merge-item" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  const cycleFields: FieldInfo[] = [
    new FieldInfo("Id", "number", false),
    new FieldInfo("cycleId", "number", true, "", true),
    new FieldInfo("mealTypeId", "number", true, "", true),
    new FieldInfo("mealId", "number", true, "", true),
    new FieldInfo("cycleDay", "number", true, "", true),
    new FieldInfo("createdBy", "number", false),
    new FieldInfo("isActive", "other", false),
  ];

  let requiredFieldMissing = checkRequiredFields(
    reqData,
    getRequiredFields(cycleFields)
  );
  if (requiredFieldMissing) {
    logger.error("Required input field missing: " + requiredFieldMissing);
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  let errorField = checkDates(reqData, cycleFields);
  if (errorField) {
    res
      .status(400)
      .send(
        errorField.name +
          " cannot be converted to a valid date." +
          reqData[errorField.name]
      );
    return;
  }

  const mergeCycleQueryString = createMergeQuery(
    "Ems.CSCycleItem",
    reqData,
    cycleFields
  );
  logger.debug("Merge Cycle Item query string: ", mergeCycleQueryString);
  let mergeCycleQuery = await safeQuery(sql, mergeCycleQueryString);
  if (!mergeCycleQuery.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: mergeCycleQuery.result,
      queryString: mergeCycleQuery.queryString,
    });
    return;
  }
  logger.debug(
    "Merge Cycle Item query result: ",
    mergeCycleQuery.result.recordsets
  );
  let id;
  if (reqData.Id == "null" || !reqData.Id) {
    id = mergeCycleQuery.result.recordset[0].Id;
  } else {
    id = reqData.Id;
  }
  res.send({
    status: "Success",
    Id: id,
  });
});
