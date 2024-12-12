import { safeQuery } from "../../utils/api-utils";

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
      servedId int REFERENCES dbo.ItemServed,
      hospitalId int REFERENCES dbo.Hospital(Id) not null,
      createdAt datetime DEFAULT GETDATE(),
      createdBy int REFERENCES dbo.users(Id),
      isActive bit DEFAULT 'true',
    );
  END
`;

export const insertValuesCSMealQueryStr = `
INSERT INTO Ems.CSMeal (name, description, servedId, hospitalId, isActive)
VALUES
('Yummy Breakfast', '', 1, 1, 'true'),
('Standard Lunch', 'A standard lunch option.', 1, 1, 'true'),
('Burger and Chips', '', 1, 1, 'true')
`;
