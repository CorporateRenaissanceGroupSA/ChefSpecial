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

export const meal = express.Router();

// endpoint to provide list of all meals available for the specified hospital
meal.post("/list", async (req, res) => {
  logger.api('Received request to "/meal/list" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  let requiredFieldMissing = checkRequiredFields(reqData, ["hospitalId"]);
  if (requiredFieldMissing) {
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  let mealTypeId = undefined;
  if (reqData.mealTypeId) {
    mealTypeId = reqData.mealTypeId;
  }
  let queryString = `
    SELECT M.*, MM.MealDescription as mealType, H.Name as hospitalName, I.ServedState as served, U.name as createdByName FROM Ems.CSMeal as M
    LEFT JOIN dbo.Hospital as H ON M.hospitalId = H.Id
    LEFT JOIN dbo.ItemServed as I ON M.servedId = I.Id
    LEFT JOIN dbo.MenuMeal as MM ON M.mealTypeId = MM.Id
    LEFT JOIN dbo.Users as U ON M.createdBy = U.Id
    WHERE M.hospitalId = ${reqData.hospitalId} ${mealTypeId != undefined ? "AND M.mealTypeId = " + mealTypeId : ""}
  `;
  let queryResult = await safeQuery(sql, queryString);
  if (!queryResult.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: queryResult.result,
      queryString: queryResult.queryString,
    });
    return;
  }
  // logger.debug("Meal list query result: ", queryResult);
  res.send({ meals: queryResult.result.recordset });
});

// endpoint to merge an existing/new meal on the DB
meal.post("/merge", async (req, res) => {
  logger.api('Received request to "/meal/merge" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  const mergeFields: FieldInfo[] = [
    new FieldInfo("Id", "number", true),
    new FieldInfo("name", "other", true),
    new FieldInfo("description", "other", true),
    new FieldInfo("servedId", "number", true),
    new FieldInfo("mealTypeId", "number", false),
    new FieldInfo("hospitalId", "number", false),
    new FieldInfo("createdBy", "number", false),
    new FieldInfo("isActive", "other", false),
  ];
  let requiredFieldMissing = checkRequiredFields(
    reqData,
    getRequiredFields(mergeFields)
  );
  if (requiredFieldMissing) {
    logger.error("Required input field missing: " + requiredFieldMissing);
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  let errorField = checkDates(reqData, mergeFields);
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

  const mergeQueryString = createMergeQuery("Ems.CSMeal", reqData, mergeFields);
  logger.debug("Merge Meal query string: ", mergeQueryString);
  let mergeQuery = await safeQuery(sql, mergeQueryString);
  if (!mergeQuery.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: mergeQuery.result,
      queryString: mergeQuery.queryString,
    });
    return;
  }
  logger.debug("Merge Meal query result: ", mergeQuery);
  let id;
  if (reqData.Id == "null" || !reqData.Id) {
    id = mergeQuery.result.recordset[0].Id;
  } else {
    id = reqData.Id;
  }
  res.send({
    Id: id,
  });
});

meal.post("/cycles", async (req, res) => {
  logger.api('Received request to "/meal/cycles" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  let requiredFieldMissing = checkRequiredFields(reqData, [
    "hospitalId",
    "mealId",
  ]);
  if (requiredFieldMissing) {
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  let queryString = `
    SELECT DISTINCT(C.id), C.name FROM Ems.CSCycleItem as CI
    LEFT JOIN Ems.CSCycle as C ON C.Id = CI.cycleId
    WHERE C.hospitalId = ${reqData.hospitalId} AND CI.mealId = ${reqData.mealId}
  `;
  let queryResult = await safeQuery(sql, queryString);
  if (!queryResult.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: queryResult.result,
      queryString: queryResult.queryString,
    });
    return;
  }
  logger.debug("Meal list query result: ", queryResult);
  res.send({ cycles: queryResult.result.recordset });
});
