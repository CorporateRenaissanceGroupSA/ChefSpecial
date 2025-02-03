import { sql } from "../index";
import { logger } from "../utils/logger";
import express = require("express");
import {
  checkDates,
  checkRequiredFields,
  cleanDate,
  createMergeQuery,
  FieldInfo,
  formattedDate,
  getRequiredFields,
  safeQuery,
} from "../utils/api-utils";

export const note = express.Router();

note.post("/list", async (req, res) => {
  logger.api('Received request to "/note/list" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  let requiredFieldMissing = checkRequiredFields(reqData, ["hospitalId"]);
  if (requiredFieldMissing) {
    res
      .status(400)
      .send("Required input field missing: " + requiredFieldMissing);
    return;
  }
  let startDateQueryStr = "";
  if (reqData.startDate) {
    let startDate = cleanDate(reqData.startDate);
    if (startDate.toString() == "Invalid Date") {
      res
        .status(400)
        .send("startDate is not a valid date. " + reqData.startDate);
      return;
    }
    startDateQueryStr = `AND (N.endDate IS NULL OR N.endDate >= '${formattedDate(startDate)}')`;
  }
  let endDateQueryStr = "";
  if (reqData.endDate) {
    let endDate = cleanDate(reqData.endDate);
    if (endDate.toString() == "Invalid Date") {
      res.status(400).send("endDate is not a valid date. " + reqData.endDate);
      return;
    }
    endDateQueryStr = `AND N.startDate <= ${formattedDate(endDate)}`;
  }
  let isActiveQueryStr = "";
  if (reqData.onlyActive == true || reqData.onlyActive == "true") {
    isActiveQueryStr = `AND N.isActive = 'true'`;
  }
  let mealQueryString = `
    SELECT N.*, H.Name as hospitalName, U.name as createdByName 
    FROM Ems.CSNote as N
    LEFT JOIN dbo.Hospital as H ON N.hospitalId = H.Id
    LEFT JOIN dbo.Users as U ON N.createdBy = U.Id
    WHERE N.hospitalId = ${reqData.hospitalId} 
    ${startDateQueryStr} ${endDateQueryStr} ${isActiveQueryStr}
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
  res.send(queryResult.result.recordset);
});

note.post("/merge", async (req, res) => {
  logger.api('Received request to "/note/merge" api endpoint');
  let reqData = req.body;
  logger.api("Req Data: ", reqData);
  const mergeFields: FieldInfo[] = [
    new FieldInfo("Id", "id", true),
    new FieldInfo("hospitalId", "id", true),
    new FieldInfo("note", "other", true),
    new FieldInfo("startDate", "date", true),
    new FieldInfo("endDate", "date", false),
    new FieldInfo("createdBy", "number", true),
    new FieldInfo("isActive", "other", true),
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

  const mergeQueryString = createMergeQuery("Ems.CSNote", reqData, mergeFields);
  logger.debug("Merge Note query string: ", mergeQueryString);
  let mergeQuery = await safeQuery(sql, mergeQueryString);
  if (!mergeQuery.success) {
    res.status(400).send({
      message: "Problem processing query.",
      error: mergeQuery.result,
      queryString: mergeQuery.queryString,
    });
    return;
  }
  logger.debug("Merge Note query result: ", mergeQuery);
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
