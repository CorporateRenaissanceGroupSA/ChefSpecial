export const createCSCycleItemTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND
    TABLE_NAME = 'CSCycleItem'
  ))
  BEGIN
    CREATE TABLE dbo.CSCycleItem (
      Id int IDENTITY(1,1) PRIMARY KEY,
      cycle int not null REFERENCES dbo.CSCycle(Id),
      cycleDay tinyint not null,
      meal int not null REFERENCES dbo.MenuMeal(Id),
      item int not null REFERENCES dbo.Item(Id),
      createDate date not null,
      isActive bit not null,
    );
  END
`;
