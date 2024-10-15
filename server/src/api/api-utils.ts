import { customError, logger } from "../utils/logger";

export function checkRequiredFields(
  obj: any,
  requiredFields: string[]
): string | undefined {
  let reqFields = Object.keys(obj);
  return requiredFields.find(
    (requiredField) => !reqFields.includes(requiredField)
  );
}

export async function safeQuery(
  sql: any,
  queryStr: string
): Promise<{ success: boolean; result: any; queryString?: string }> {
  let success = true;
  let result: any = undefined;
  try {
    result = await sql.query(queryStr);
  } catch (error) {
    logger.error("Problem executing query: ", queryStr, error);
    return {
      success: false,
      result: error,
      queryString: queryStr,
    };
  }
  return {
    success,
    result,
  };
}

export async function preparedQuery(
  sql: any,
  queryStr: string, // the query to be executed, including binding variables e.g. "Select * FROM Table WHERE Id = :Id"
  inputVars: any, // an object binding variable names as fields and their sql types as values e.g. {"Id": sql.Int}
  values: any[] // a list of objects containing the binding variable values to be used in the query [{Id: 23456}, {Id: 4657}]
): Promise<{ success: boolean; result: any; queryString?: string }> {
  let success = true;
  let recordsUpdated = 0;
  const ps = new sql.PreparedStatement();
  let valueFields = Object.keys(inputVars);
  for (const valueField of valueFields) {
    try {
      ps.input(valueField, inputVars[valueField]);
    } catch (error) {
      success = false;
      logger.error(
        "Problem adding input variable: " + valueField,
        inputVars[valueField]
      );
    }
  }
  if (success) {
    try {
      await ps.prepare(queryStr);
    } catch (error) {
      success = false;
      logger.error(
        "Problem with preparing prepared statement: ",
        queryStr,
        error
      );
    }
  }
  for (const value of values) {
    if (success) {
      try {
        await ps.execute(value);
      } catch (error) {
        success = false;
        logger.error(
          "Problem with executing prepared statement with values: ",
          value,
          error
        );
      }
      if (success) {
        recordsUpdated++;
      }
    }
  }
  await ps.unprepare();
  return {
    success,
    result: "Records updated: " + recordsUpdated,
    queryString: queryStr,
  };
}

// EXAMPLE USAGE OF preparedQuery
// const mergeCycleQuery2 = `
//     MERGE dbo.CSCycle AS Target
//     USING (SELECT @Id as Id, @name as name, @startDate as startDate, @isActive as isActive) AS Source
//     ON (Target.Id = Source.Id)
//     WHEN MATCHED THEN UPDATE SET Target.name = Source.name, Target.startDate = Source.startDate, Target.isActive = Source.isActive
//     WHEN NOT MATCHED THEN INSERT (name, startDate, createDate, isActive) VALUES (source.name, source.startDate, GETDATE(), source.isActive)
//     ;
//     `;
// let mergeCycleQuery = await preparedQuery(
//   sql,
//   mergeCycleQuery2,
//   {
//     Id: sql.Int,
//     name: sql.VarChar(100),
//     startDate: sql.Date,
//     isActive: sql.Bit,
//   },
//   [values]
// );
// if (!mergeCycleQuery.success) {
//   res.status(400).send({
//     message: "Problem processing prepared query.",
//     error: mergeCycleQuery.result,
//     queryString: mergeCycleQuery.queryString,
//   });
//   return;
// }

export function getConditionStr(criteria: string): string {
  let result = "";
  result = criteria.replace(/(<=|>=|<|>|=)(.*)|(.*)/, createConditionStr);
  return result;
}

function createConditionStr(
  criteria: string,
  condition: string,
  afterCondition: string,
  noCondition: string
): string {
  let result = "";
  logger.debug("Full Criteria: " + criteria);
  logger.debug("Condition: " + condition);
  logger.debug("After condition: " + afterCondition);
  logger.debug("No condition: " + noCondition);
  if (noCondition) {
    return `LIKE '${noCondition}'`;
  }
  if (condition && afterCondition) {
    let numberPattern = /[0-9]*|[+-][0-9]*/;
    let isNumber = numberPattern.exec(afterCondition);
    logger.debug("Is number: ", isNumber);
    if (isNumber && isNumber[0]) {
      logger.debug("After condition is number");
      return `${condition} ${afterCondition}`;
    } else {
      return `LIKE '${afterCondition}'`;
    }
  }
  logger.error(
    "Unexpected result. Could not create condition string for " + criteria
  );
  return result;
}
