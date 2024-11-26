export const createCSNoteTableQueryStr = `
  IF (NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND
    TABLE_NAME = 'CSNote'
  ))
  BEGIN
    CREATE TABLE dbo.CSNote (
      Id int IDENTITY(1,1) PRIMARY KEY,
      hospital int not null REFERENCES dbo.Hospital(Id),
      note text not null
      createdBy int not null REFERENCES dbo.users(Id),
      createDate date not null,
      isActive bit not null,
    );
  END
`;
