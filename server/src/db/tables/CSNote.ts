export const createCSNoteTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'Ems' AND
    TABLE_NAME = 'CSNote'
  ))
  BEGIN
    CREATE TABLE Ems.CSNote (
      Id int IDENTITY(1,1) PRIMARY KEY,
      hospitalId int not null REFERENCES dbo.Hospital(Id),
      note text not null,
      startDate date not null,
      endDate date,
      createdBy int not null REFERENCES dbo.users(Id),
      createdAt date DEFAULT GETDATE(),
      isActive bit not null,
    );
  END
`;
