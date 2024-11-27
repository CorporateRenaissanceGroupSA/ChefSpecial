import { sql } from "../index";
import { logger } from "../utils/logger";
import express = require("express");
import { checkRequiredFields, safeQuery } from "./api-utils";

export const meal = express.Router();

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
  let queryString = `
    SELECT M.*, H.Name as hospital, U.name as createdByName FROM Ems.CSMeal as M
    LEFT JOIN dbo.Hospital as H ON M.hospitalId = H.Id
    LEFT JOIN dbo.Users as U ON M.createdBy = U.Id
    WHERE M.hospitalId = ${reqData.hospitalId}
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
  res.send({ meals: queryResult.result.recordset });
});
