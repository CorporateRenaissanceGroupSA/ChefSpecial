import { logger } from "./logger";

export class FieldInfo {
  constructor(
    public name: string, // the name of the field as it will appear in the api data
    public type: "number" | "date" | "id" | "other" = "other", // the type of the data used for checking and query construction
    public required: boolean = false, // whether the field is a required field in the api data
    public dbName: string = "", // the name of the field in the db table
    public mergeOn: boolean = false // whether to include this field in the MERGE ON string
  ) {
    if (!dbName) {
      this.dbName = this.name;
    }
  }
}

export function formattedDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function checkDates(obj: any, fields: FieldInfo[]) {
  let errorField = fields.find((field) => {
    let result = false;
    if (field.type == "date" && obj[field.name] && obj[field.name] != "null") {
      logger.debug(
        "Checking date field: " + field.name + " => " + obj[field.name]
      );
      let testDate = cleanDate(obj[field.name]);
      if (testDate.toString() == "Invalid Date") {
        result = true;
      }
    }
    return result;
  });
  return errorField;
}

// switches year to be at start of date string
function switchYear(
  str: string,
  dayStr: string,
  monthStr: string,
  yearStr: string
): string {
  console.log("switching year on date " + str);
  let newDateStr =
    yearStr + "-" + monthStr.padStart(2, "0") + "-" + dayStr.padStart(2, "0");
  return newDateStr;
}

function correctFormat(
  str: string,
  yearStr: string,
  monthStr: string,
  dayStr: string
): string {
  if (Number(monthStr) > 12) {
    let tempStr = monthStr;
    monthStr = dayStr;
    dayStr = tempStr;
    console.log("switched month and day on date: " + str);
  }
  return (
    yearStr + "-" + monthStr.padStart(2, "0") + "-" + dayStr.padStart(2, "0")
  );
}

export function cleanDate(dateStr: string): Date {
  logger.debug("dateStr: ", dateStr);
  let originalDateStr = dateStr;
  if (!dateStr) {
    return new Date("");
  }
  // if date starts with 2 numbers separated by - or / followed by 2 numbers separated by - or / followed by 4 numbers then reformat date
  dateStr = dateStr.replace(
    /([0-9]+)[\/-]([0-9]+)[\/-]([0-9][0-9][0-9][0-9]).*/,
    switchYear
  );
  logger.debug("Switched Year: " + dateStr);
  // checks if month and day strings should be swapped
  dateStr = dateStr.replace(
    /([0-9][0-9][0-9][0-9])[\/-]([0-9]+)[\/-]([0-9]+).*/,
    correctFormat
  );
  // replace any / in date with -
  // dateStr = dateStr.replace(/\/+/g, "-");
  // if (dateStr != originalDateStr) {
  //   console.log("Original dateStr: " + originalDateStr);
  //   console.log("DateStr after changes: " + dateStr);
  // }
  logger.debug("Cleaned dateStr: " + dateStr);
  let newDate = new Date(dateStr);
  if (newDate.toString() == "Invalid Date") {
    console.error(
      "Cannot convert cleaned dateStr: " +
        dateStr +
        " to a valid date. Original date string: " +
        originalDateStr
    );
  }
  return newDate;
}

export function checkRequiredFields(
  obj: any,
  requiredFields: string[]
): string | undefined {
  let reqFields = Object.keys(obj);
  let result = requiredFields.find(
    (requiredField) => !reqFields.includes(requiredField)
  );
  if (result) {
    logger.error("Could not find requried field: ", result);
  }
  return result;
}

export function checkAtLeastOneOf(
  obj: any,
  oneOfRequiredFields: string[]
): string | undefined {
  let reqFields = Object.keys(obj);
  let result = oneOfRequiredFields.find((requiredField) =>
    reqFields.includes(requiredField)
  );
  if (!result) {
    logger.error("Could not find requried field: ", result);
  }
  return result;
}

export function getRequiredFields(fields: FieldInfo[]): string[] {
  return fields.filter((field) => field.required).map((field) => field.name);
}

export async function safeQuery(
  sql: any,
  queryStr: string
): Promise<{ success: boolean; result: any; queryString: string }> {
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
    queryString: queryStr,
  };
}

export function createMergeQuery(
  dbTable: string,
  reqData: any,
  fields: FieldInfo[]
): string {
  // console.debug("Create Merge Query reqData: ", reqData);
  let newId = !reqData.Id || reqData.Id == "null";
  let getNewIdString = newId ? "SELECT SCOPE_IDENTITY() AS Id;" : "";
  let selectStringFields: string[] = [];
  let mergeOnFields: string[] = [];
  fields.forEach((field) => {
    // if (field.name == "provinceId") {
    //   logger.debug("query field data: ", reqData[field.name]);
    // }
    if (
      reqData[field.name] == undefined ||
      reqData[field.name] == "null" ||
      (field.type == "id" && reqData[field.name] == 0)
    ) {
      selectStringFields.push("null " + field.dbName);
    } else {
      if (field.type == "number") {
        selectStringFields.push(reqData[field.name] + " " + field.dbName);
      } else {
        selectStringFields.push(
          "'" + reqData[field.name] + "' " + field.dbName
        );
      }
    }
    if (field.mergeOn) {
      mergeOnFields.push(field.dbName);
    }
  });
  let selectString = "SELECT " + selectStringFields.join(", ");
  let fieldsWithoutId = fields.filter((field) => field.dbName != "Id");
  let updateString = fieldsWithoutId
    .map((field) => {
      return "Target." + field.dbName + " = Source." + field.dbName;
    })
    .join(", ");
  let insertString =
    "(" +
    fieldsWithoutId.map((field) => field.dbName).join(", ") +
    ") VALUES (" +
    fieldsWithoutId.map((field) => "source." + field.dbName).join(", ") +
    ")";
  let mergeOnString = "Target.Id = Source.Id";
  if (mergeOnFields.length > 0) {
    mergeOnString = mergeOnFields
      .map((fieldName) => `Target.${fieldName} = Source.${fieldName}`)
      .join(" AND ");
  }
  const mergeQuery = `
    MERGE ${dbTable} AS Target
    USING (${selectString}) AS Source
    ON (${mergeOnString})
    WHEN MATCHED THEN UPDATE SET ${updateString}
    WHEN NOT MATCHED THEN INSERT ${insertString}
    ;
    ${getNewIdString}
    `;
  return mergeQuery;
}

// export function createMergeQuery(
//   dbTable: string,
//   reqData: any,
//   fields: FieldInfo[]
// ): string {
//   logger.debug("Create Merge Query reqData: ", reqData);
//   let newId = !reqData.Id || reqData.Id == "null";
//   let getNewIdString = newId ? "SELECT SCOPE_IDENTITY() AS Id;" : "";
//   let selectStringFields: string[] = [];
//   let mergeOnFields: string[] = [];
//   fields.forEach((field) => {
//     // if (field.name == "provinceId") {
//     //   logger.debug("query field data: ", reqData[field.name]);
//     // }
//     if (reqData[field.name] == undefined || reqData[field.name] == "null") {
//       selectStringFields.push("null " + field.dbName);
//     } else {
//       if (field.type == "number") {
//         selectStringFields.push(reqData[field.name] + " " + field.dbName);
//       } else {
//         selectStringFields.push(
//           "'" + reqData[field.name] + "' " + field.dbName
//         );
//       }
//     }
//     if (field.mergeOn) {
//       mergeOnFields.push(field.dbName);
//     }
//   });
//   let selectString = "SELECT " + selectStringFields.join(", ");
//   let fieldsWithoutId = fields.filter((field) => field.dbName != "Id");
//   let updateString = fieldsWithoutId
//     .map((field) => {
//       return "Target." + field.dbName + " = Source." + field.dbName;
//     })
//     .join(", ");
//   let insertString =
//     "(" +
//     fieldsWithoutId.map((field) => field.dbName).join(", ") +
//     ") VALUES (" +
//     fieldsWithoutId.map((field) => "source." + field.dbName).join(", ") +
//     ")";
//   let mergeOnString = "Target.Id = Source.Id";
//   if (mergeOnFields.length > 0) {
//     mergeOnString = mergeOnFields
//       .map((fieldName) => `Target.${fieldName} = Source.${fieldName}`)
//       .join(" AND ");
//   }
//   const mergeQuery = `
//     MERGE ${dbTable} AS Target
//     USING (${selectString}) AS Source
//     ON (${mergeOnString})
//     WHEN MATCHED THEN UPDATE SET ${updateString}
//     WHEN NOT MATCHED THEN INSERT ${insertString}
//     ;
//     ${getNewIdString}
//     `;
//   return mergeQuery;
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
