export const createCSMealTypeOverrideTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSMealTypeOverride'
  ))
  BEGIN
    CREATE TABLE Ems.CSMealTypeOverride (
      Id int IDENTITY(1,1) PRIMARY KEY,
      menuMealId int REFERENCES dbo.MenuMeal(Id),
      hospitalId int REFERENCES dbo.Hospital(Id),
      name varchar(100) not null,
      cutoffTime varchar(10),
      servedTime varchar(10)
      isActive bit DEFAULT 'true',
      createdAt datetime DEFAULT GETDATE(),
      createdBy int REFERENCES dbo.users(Id),
    );
  END
`;
