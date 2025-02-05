require("dotenv").config();
import { startApi } from "./api/api-main";
import { connectDb } from "./db/connect";
import { logger } from "./utils/logger";

export let sql: any;
main();

async function main() {
  logger.info("Hello template!");
  sql = await connectDb();
  startApi(4000);
}
