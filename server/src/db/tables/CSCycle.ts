export const createCSCycleTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND
    TABLE_NAME = 'CSCycle'
  ))
  BEGIN
    CREATE TABLE dbo.CSCycle (
      Id int IDENTITY(1,1) PRIMARY KEY,
      name varchar(100) not null,
      startDate date not null,
      createDate date not null,
      isActive bit not null,
    );
  END
`;
