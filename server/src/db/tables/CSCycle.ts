export const createCSCycleTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSCycle'
  ))
  BEGIN
    CREATE TABLE Ems.CSCycle (
      Id int IDENTITY(1,1) PRIMARY KEY,
      hospitalId int not null REFERENCES dbo.Hospital(Id),
      name varchar(100) not null,
      cycleDays tinyint not null,
      startDate date not null,
      endDate date,
      createDate datetime DEFAULT GETDATE(),
      createdBy int REFERENCES dbo.users(Id),
      isActive bit not null,
    );
  END
`;

export const insertValuesCSCycleQueryStr = `
INSERT INTO Ems.CSCycle (hospitalId, name, cycleDays, startDate, isActive)
VALUES
(1, 'Cycle 1', 8 , '2024-11-20', 'true'),
(1, 'Cycle 2', 3 , '2024-11-20', 'true'),
(2, 'Cycle 3', 7 , '2024-11-20', 'true')
`;
