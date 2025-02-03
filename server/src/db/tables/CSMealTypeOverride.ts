export const createCSMealTypeOverrideTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSMealTypeOverride'
  ))
  BEGIN
    CREATE TABLE Ems.CSMealTypeOverride (
      Id int IDENTITY(1,1) PRIMARY KEY,
      mealTypeId int REFERENCES dbo.MenuMeal(Id) not null,
      hospitalId int REFERENCES dbo.Hospital(Id) not null,
      name varchar(100) not null,
      cutoffTime varchar(10),
      servedTime varchar(10),
      isActive bit DEFAULT 'true',
      createdAt datetime DEFAULT GETDATE(),
      createdBy int REFERENCES dbo.users(Id),
    );
  END
`;
