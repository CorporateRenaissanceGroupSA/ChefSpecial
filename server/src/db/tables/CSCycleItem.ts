export const createCSCycleItemTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSCycleItem'
  ))
  BEGIN
    CREATE TABLE Ems.CSCycleItem (
      Id int IDENTITY(1,1) PRIMARY KEY,
      cycleId int not null REFERENCES Ems.CSCycle(Id),
      mealTypeId int not null REFERENCES dbo.MenuMeal(Id),
      mealId int not null REFERENCES Ems.CSMeal(Id),
      cycleDay tinyint not null,
      createDate datetime DEFAULT GETDATE(),
      createdBy int REFERENCES dbo.users(Id),
      isActive bit DEFAULT 'true',
    );
  END
`;
