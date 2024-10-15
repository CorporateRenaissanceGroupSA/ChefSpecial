import sql from "mssql";
import { logger } from "../utils/logger";

export const sqlConfig = {
  user: process.env.DB_USER!,
  password: process.env.DB_PWD!,
  database: process.env.DB_NAME!,
  server: process.env.DB_URL!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
export async function connectDb(): Promise<any> {
  try {
    await sql.connect(sqlConfig);
  } catch (error) {
    logger.error("Could not connect to db. ", error);
  }
  logger.db("Connected to DB");
  return sql;
}
