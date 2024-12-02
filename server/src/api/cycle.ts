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
    SELECT C.Id, C.name, C.cycleDays, H.Id as hospitalId, H.name as hospitalName, C.startDate, C.createDate, C.createdBy, U.name as CreatedByName, C.isActive 
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
    SELECT C.Id, C.name, C.cycleDays, C.hospitalId, H.name as hospitalName, C.startDate, C.createDate, C.createdBy, C.isActive 
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

  // const cycleItemsQueryStr = `
  // SELECT
  //   CI.*, MT.mealDescription as mealType, M.name as mealName, M.description as mealDescription, U.name as createdByName
  // FROM Ems.CSCycleItem as CI
  // LEFT JOIN dbo.MenuMeal as MT ON CI.mealTypeId = MT.Id
  // LEFT JOIN Ems.CSMeal as M ON CI.mealId = M.Id
  // LEFT JOIN dbo.users as U ON CI.createdBy = U.Id
  // WHERE CI.cycleId = '${reqData.Id}'
  // ;
  // `;
  // let cycleItemsQuery = await safeQuery(sql, cycleItemsQueryStr);
  // if (!cycleItemsQuery.success) {
  //   res.status(400).send({
  //     message: "Problem processing query.",
  //     error: cycleItemsQuery.result,
  //   });
  //   return;
  // }

  res.send({
    cycleInfo: cycleQuery.result.recordset[0],
  });
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
  logger.debug("Merge Cycle Item query result: ", mergeCycleQuery);
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

// cycle.post("/merge-items", async (req, res) => {
//   logger.api('Received request to "/cycle/merge-items" api endpoint');
//   let reqData = req.body;
//   logger.api("Req Data: ", reqData);
//   if (!reqData.items) {
//     res.status(400).send("Required input field missing: items");
//     return;
//   }
//   let mergedIds: number[] = [];
//   for (const itemData of reqData.items) {
//     const cycleFields: FieldInfo[] = [
//       new FieldInfo("Id", "number", true),
//       new FieldInfo("cycleId", "number", true, "", true),
//       new FieldInfo("mealTypeId", "number", true, "", true),
//       new FieldInfo("mealId", "number", true, "", true),
//       new FieldInfo("cycleDay", "number", true, "", true),
//       new FieldInfo("createdBy", "number", false),
//       new FieldInfo("isActive", "other", false),
//     ];

//     let requiredFieldMissing = checkRequiredFields(
//       reqData,
//       getRequiredFields(cycleFields)
//     );
//     if (requiredFieldMissing) {
//       logger.error("Required input field missing: " + requiredFieldMissing);
//       res
//         .status(400)
//         .send("Required input field missing: " + requiredFieldMissing);
//       return;
//     }
//     let errorField = checkDates(reqData, cycleFields);
//     if (errorField) {
//       res
//         .status(400)
//         .send(
//           errorField.name +
//             " cannot be converted to a valid date." +
//             reqData[errorField.name]
//         );
//       return;
//     }

//     const mergeCycleQueryString = createMergeQuery(
//       "Ems.CSCycle",
//       reqData,
//       cycleFields
//     );
//     logger.debug("Merge Cycle query string: ", mergeCycleQueryString);
//     let mergeCycleQuery = await safeQuery(sql, mergeCycleQueryString);
//     if (!mergeCycleQuery.success) {
//       res.status(400).send({
//         message: "Problem processing query.",
//         error: mergeCycleQuery.result,
//         queryString: mergeCycleQuery.queryString,
//       });
//       return;
//     }
//     logger.debug("Merge Cycle query result: ", mergeCycleQuery);
//     let id;
//     if (reqData.Id == "null" || !reqData.Id) {
//       id = mergeCycleQuery.result.recordset[0].Id;
//     } else {
//       id = reqData.Id;
//     }
//     mergedIds.push(Number(id));
//   }
//   res.send({
//     Ids: mergedIds,
//   });
// });
