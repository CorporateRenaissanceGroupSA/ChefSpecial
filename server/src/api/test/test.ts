import express = require("express");
import { logger } from "../../utils/logger";
import { sql } from "../..";
export const test = express.Router();

test.post("/message", (req, res) => {
  logger.debug('Received request to "/test/message" api endpoint');
  res.send({ message: "CRM-FoodSales API Test worked" });
});

test.post("/query", async (req, res) => {
  logger.debug('Received request to "/test/query" api endpoint');
  let queryResult = await sql.query(`SELECT * FROM FoodSales.TitleOption`);
  logger.db("Query Result: ", queryResult);
  res.send({
    message: "Query worked.",
    result: queryResult.recordset,
  });
});
