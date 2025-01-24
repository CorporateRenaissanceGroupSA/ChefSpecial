export const createCSMealTypeTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSMealType'
  ))
  BEGIN
    CREATE TABLE Ems.CSMealType (
      Id int IDENTITY(1,1) PRIMARY KEY,
      mealId int REFERENCES Ems.CSMeal(Id) not null,
      mealTypeId int REFERENCES dbo.MenuMeal(Id) not null,
      isActive bit DEFAULT 'true',
    );
  END
`;
