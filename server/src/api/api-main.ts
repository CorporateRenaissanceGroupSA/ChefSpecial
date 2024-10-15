import express = require("express");
const cors = require("cors");
import { logger } from "../utils/logger";
import { test } from "./test/test";
import { checkRequiredFields, preparedQuery, safeQuery } from "./api-utils";
import { sql } from "..";
import { createCSCycleTableQueryStr } from "../db/tables/CSCycle";
import { createCSCycleItemTableQueryStr } from "../db/tables/CSCycleItem";

export function startApi(port: number = 4000) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/test", test);

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

  app.post("/merge_cycle", async (req, res) => {
    logger.api('Received request to "/merge_cycle" api endpoint');
    let reqData = req.body;
    logger.api("Req Data: ", reqData);
    const requiredFields: string[] = [
      "hospital",
      "name",
      "startDate",
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
    let startDate = new Date(reqData.startDate);
    if (startDate.toString() == "Invalid Date") {
      res
        .status(400)
        .send(
          "startDate cannot be converted to a valid date." + reqData.startDate
        );
    }
    let values = {
      Id: `${reqData.Id ? reqData.Id : "-1"}`,
      hospital: reqData.hospital,
      name: reqData.name,
      startDate: startDate.toJSON(),
      createdBy: reqData.createdBy,
      isActive: reqData.isActive,
    };
    const mergeCycleQuery1 = `
    MERGE dbo.CSCycle AS Target
    USING (SELECT ${values.Id} Id, '${values.hospital}' hospital, '${values.name}' name, '${values.startDate}' startDate, '${values.createdBy}' createdBy, '${values.isActive}' isActive) AS Source
    ON (Target.Id = Source.Id)
    WHEN MATCHED THEN UPDATE SET Target.hospital = Source.hospital, Target.name = Source.name, Target.startDate = Source.startDate, Target.createdBy = Source.createdBy, Target.isActive = Source.isActive
    WHEN NOT MATCHED THEN INSERT (hospital, name, startDate, createDate, createdBy, isActive) VALUES (source.hospital, source.name, source.startDate, GETDATE(), source.createdBy, source.isActive)
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
