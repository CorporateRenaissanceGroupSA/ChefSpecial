import express = require("express");
const cors = require("cors");
import { logger } from "../utils/logger";
import { test } from "./test/test";
import { sql } from "../index";
import { createCSCycleTableQueryStr } from "../db/tables/CSCycle";
import { createCSCycleItemTableQueryStr } from "../db/tables/CSCycleItem";
import { meal } from "./meal";
import { cycle } from "./cycle";
import {
  checkDates,
  checkRequiredFields,
  createMergeQuery,
  FieldInfo,
  getRequiredFields,
  safeQuery,
} from "../utils/api-utils";

export function startApi(port: number = 4000) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/test", test);
  app.use("/cycle", cycle);
  app.use("/meal", meal);

  app.post("/create_tables", async (req, res) => {
    logger.api('Received request to "/create_tables" api endpoint');
    let createCycleTableQuery = await safeQuery(
      sql,
      createCSCycleTableQueryStr
    );
    if (!createCycleTableQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: createCycleTableQuery.result,
      });
      return;
    }
    let createCycleItemTableQuery = await safeQuery(
      sql,
      createCSCycleItemTableQueryStr
    );
    if (!createCycleItemTableQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: createCycleItemTableQuery.result,
      });
      return;
    }
    res.send({ message: "Tables created successfully." });
  });

  app.post("/meal-types", async (req, res) => {
    logger.api('Received request to "/meal-types" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);
    const queryStr = `
    SELECT MM.Id, MM.MealDescription as mealType 
    FROM dbo.MenuMeal as MM
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

  app.post("/merge_cycle_item", async (req, res) => {
    logger.api('Received request to "/merge_cycle_item" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);
    const requiredFields: string[] = [
      "cycle",
      "cycleDay",
      "meal",
      "item",
      "createdBy",
      "isActive",
    ];
    let requiredFieldMissing = checkRequiredFields(reqData, requiredFields);
    if (requiredFieldMissing) {
      res
        .status(400)
        .send("Required input field missing: " + requiredFieldMissing);
      return;
    }
    let values = {
      Id: `${reqData.Id ? reqData.Id : "-1"}`,
      cycle: reqData.cycle,
      cycleDay: reqData.cycleDay,
      meal: reqData.meal,
      item: reqData.item,
      createdBy: reqData.createdBy,
      isActive: reqData.isActive,
    };
    const mergeCycleQuery1 = `
    MERGE dbo.CSCycleItem AS Target
    USING (SELECT ${values.Id} Id, '${values.cycle}' cycle, '${values.cycleDay}' cycleDay, '${values.meal}' meal, '${values.item}' item, '${values.createdBy}' createdBy, '${values.isActive}' isActive) AS Source
    ON (Target.Id = Source.Id)
    WHEN MATCHED THEN UPDATE SET Target.cycle = Source.cycle, Target.cycleDay = Source.cycleDay, Target.meal = Source.meal, Target.item = Source.item, Target.createdBy = Source.createdBy, Target.isActive = Source.isActive
    WHEN NOT MATCHED THEN INSERT (cycle, cycleDay, meal, item, createDate, createdBy, isActive) VALUES (source.cycle, source.cycleDay, source.meal, source.item, GETDATE(), source.createdBy, source.isActive)
    ;
    `;
    let mergeCycleQuery = await safeQuery(sql, mergeCycleQuery1);
    if (!mergeCycleQuery.success) {
      res.status(400).send({
        message: "Problem processing query.",
        error: mergeCycleQuery.result,
        queryString: mergeCycleQuery.queryString,
      });
      return;
    }

    res.send(mergeCycleQuery);
  });

  app.listen(port, "0.0.0.0", () => {
    logger.api("REST API server is listening on port " + port);
  });
}
