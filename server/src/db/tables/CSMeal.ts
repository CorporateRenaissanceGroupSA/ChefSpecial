import { safeQuery } from "../../api/api-utils";

export const createCSMealTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSMeal'
  ))
  BEGIN
    CREATE TABLE Ems.CSMeal (
      Id int IDENTITY(1,1) PRIMARY KEY,
      name varchar(100) not null,
      description varchar(250),
      hospitalId int REFERENCES dbo.Hospital(Id) not null,
      createDate datetime DEFAULT GETDATE(),
      createdBy int REFERENCES dbo.users(Id),
      isActive bit DEFAULT 'true',
    );
  END
`;

export const insertValuesCSMealQueryStr = `
INSERT INTO Ems.CSMeal (name, description, hospitalId, isActive)
VALUES
('Yummy Breakfast', '', 1, 'true'),
('Standard Lunch', 'A standard lunch option.', 1, 'true'),
('Burger and Chips', '', 1, 'true')
`;

export async function addCsMealEntries(sql: any) {
  await CSMealEntry(sql, 1, "Yummy Breakfast");
  await CSMealEntry(sql, 1, "Standard Lunch");
  await CSMealEntry(sql, 1, "Burger and Chips");
}

async function CSMealEntry(
  sql: any,
  hospitalId: number,
  name: string,
  description: string = ""
) {
  const queryString = `
  INSERT INTO Ems.CSMeal (name, description, hospitalId) 
  VALUES ('${name}', '${description}', ${hospitalId})
  `;
  let queryResult = await safeQuery(sql, queryString);
  if (!queryResult.success) {
    console.error(
      "Could not add CSMeal entry: ",
      queryResult.result,
      queryResult.queryString
    );
    throw new Error("Could not add CSMeal entry.");
  }
}
