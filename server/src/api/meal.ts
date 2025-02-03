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
  let mealQueryString = `
    SELECT M.*, H.Name as hospitalName, I.ServedState as served, U.name as createdByName 
    FROM Ems.CSMeal as M
    LEFT JOIN dbo.Hospital as H ON M.hospitalId = H.Id
    LEFT JOIN dbo.ItemServed as I ON M.servedId = I.Id
    LEFT JOIN dbo.Users as U ON M.createdBy = U.Id
    ${mealTypeId != undefined ? "LEFT JOIN Ems.CSMealToType as MT ON M.Id = MT.mealId" : ""}
    WHERE M.hospitalId = ${reqData.hospitalId} ${mealTypeId != undefined ? "AND (MT.mealTypeId = " + mealTypeId + " AND MT.isActive = 'true')" : ""}
  `;
  let queryResult = await safeQuery(sql, mealQueryString);
  if (!queryResult.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: queryResult.result,
      queryString: queryResult.queryString,
    });
    return;
  }
  let mealDataMap: Map<number, any> = new Map();
  queryResult.result.recordset.forEach((data: any) => {
    data.mealTypes = [];
    mealDataMap.set(data.Id, data);
  });

  let mealTypeQueryString = `
  SELECT MT.* from Ems.CSMealToType as MT
  RIGHT JOIN Ems.CSMeal as M ON MT.mealId = M.Id
  WHERE M.hospitalId = ${reqData.hospitalId} AND MT.isActive = 'true' ${mealTypeId != undefined ? "AND MT.mealTypeId = " + mealTypeId : ""}
  `;
  let mealTypeQueryResult = await safeQuery(sql, mealTypeQueryString);
  if (!mealTypeQueryResult.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: mealTypeQueryResult.result,
      queryString: mealTypeQueryResult.queryString,
    });
    return;
  }
  logger.debug("Meal type query result: ", mealTypeQueryResult);
  mealTypeQueryResult.result.recordset.forEach((data: any) => {
    let mealData = mealDataMap.get(data.mealId);
    if (mealData) {
      mealData.mealTypes.push(data.mealTypeId);
      mealDataMap.set(data.mealId, mealData);
    }
  });
  res.send({ meals: Array.from(mealDataMap.values()) });
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
  if (reqData.Id === null || !reqData.Id) {
    id = mergeQuery.result.recordset[0].Id;
  } else {
    id = reqData.Id;
  }
  res.send({
    Id: id,
  });
});

meal.post("/mealtotype-merge", async (req, res) => {
  logger.api('Received request to "/meal/mealtotype-merge" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  const mergeFields: FieldInfo[] = [
    new FieldInfo("mealId", "number", true, "", true),
    new FieldInfo("mealTypeId", "number", true, "", true),
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

  const mergeQueryString = createMergeQuery(
    "Ems.CSMealToType",
    reqData,
    mergeFields
  );
  logger.debug("Merge MealToType query string: ", mergeQueryString);
  let mergeQuery = await safeQuery(sql, mergeQueryString);
  if (!mergeQuery.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: mergeQuery.result,
      queryString: mergeQuery.queryString,
    });
    return;
  }
  logger.debug("Merge MealToType query result: ", mergeQuery);
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
  let onlyActive = true;
  if (reqData.onlyActive) {
    onlyActive = reqData.onlyActive;
  }
  let queryString = `
    SELECT DISTINCT(C.id), C.name FROM Ems.CSCycleItem as CI
    LEFT JOIN Ems.CSCycle as C ON C.Id = CI.cycleId
    WHERE C.hospitalId = ${reqData.hospitalId} AND CI.mealId = ${reqData.mealId} ${onlyActive ? "AND CI.isActive = 'true'" : ""}
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
  // logger.debug("Meal cycles query result: ", queryResult);
  res.send({ cycles: queryResult.result.recordset });
});
