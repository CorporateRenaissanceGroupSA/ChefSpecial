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
    const requiredFields: string[] = ["name", "startDate"];
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
    let isActive = reqData.isActive;
    if (isActive == undefined) {
      isActive = true;
    }
    let values = {
      Id: `${reqData.Id ? reqData.Id : "-1"}`,
      name: reqData.name,
      startDate: startDate.toJSON(),
      isActive,
    };
    const mergeCycleQuery1 = `
    MERGE dbo.CSCycle AS Target
    USING (SELECT ${values.Id} Id, '${values.name}' name, '${values.startDate}' startDate, '${values.isActive}' isActive) AS Source
    ON (Target.Id = Source.Id)
    WHEN MATCHED THEN UPDATE SET Target.name = Source.name, Target.startDate = Source.startDate, Target.isActive = Source.isActive
    WHEN NOT MATCHED THEN INSERT (name, startDate, createDate, isActive) VALUES (source.name, source.startDate, GETDATE(), source.isActive)
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
