import express = require("express");
const cors = require("cors");
import { logger } from "../utils/logger";
import { sql } from "../index";
import { meal } from "./meal";
import { cycle } from "./cycle";
import { checkRequiredFields, safeQuery } from "../utils/api-utils";

export function startApi(port: number = 4001) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/cycle", cycle);
  app.use("/meal", meal);

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
    SELECT DISTINCT MM.Id mealId, MM.MealDescription as mealType
    FROM dbo.Hospital H 
    JOIN dbo.HospitalMenu as HM ON H.Id = HM.Hospital
    JOIN dbo.MenuItem as MI ON HM.Menu = MI.Menu
    JOIN dbo.MenuMeal as MM ON MM.id = MI.Meal
    WHERE H.Id = ${reqData.hospitalId}
    ORDER BY MM.Id ASC
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

  app.listen(port, "0.0.0.0", () => {
    logger.api("REST API server is listening on port " + port);
  });
}
