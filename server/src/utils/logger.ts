import winston, { format } from "winston";
// import "winston-daily-rotate-file";
const { align, colorize, combine, errors, json, printf, timestamp } =
  winston.format;
const util = require("util");

const myLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    api: 3,
    tx: 4,
    db: 5,
    unassigned6: 6,
    unassigned7: 7,
    debug: 8,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    api: "blue",
    tx: "cyan",
    db: "grey",
    unassigned6: "white cyanBG",
    unassigned7: "white cyanBG",
    debug: "white",
  },
};

// const commonFileFormat = {
//   dirname: "logs",
//   datePattern: "YY-MM-DD",
//   maxFiles: 2,
//   format: combine(json()),
// };

// const onlyTxsFormat = format((info) => {
//   // console.debug("onlyTxsFormat called. Info: ", info);
//   if (info.level != "tx") {
//     return false;
//   }
//   return info;
// });

// const onlyAirdropsFormat = format((info) => {
//   // console.debug("onlyTxsFormat called. Info: ", info);
//   if (info.level != "airdrop") {
//     return false;
//   }
//   return info;
// });

// const onlyAirdropRewardsFormat = format((info) => {
//   // console.debug("onlyTxsFormat called. Info: ", info);
//   if (info.level != "airdroprewards") {
//     return false;
//   }
//   return info;
// });

export const logger = setupLogger();

export function setupLogger() {
  winston.addColors(myLevels.colors);
  const logger = winston.createLogger({
    levels: myLevels.levels,
    level: process.env.LOG_LEVEL || "debug",
    format: combine(errors({ stack: true }), timestamp(), utilFormatter()),
    transports: [
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          align(),
          printf((info) => `${info.level} [${info.timestamp}]: ${info.message}`)
        ),
      }),
      // log all messages with level at or below api to file
      // new winston.transports.DailyRotateFile({
      //   ...commonFileFormat,
      //   level: "api",
      //   filename: "all-%DATE%.log",
      // }),
      // // log all messages with level at or below error to file
      // new winston.transports.DailyRotateFile({
      //   ...commonFileFormat,
      //   level: "error",
      //   filename: "errors-%DATE%.log",
      // }),
      // // log all messages with level tx to file
      // new winston.transports.DailyRotateFile({
      //   ...commonFileFormat,
      //   format: format.combine(onlyTxsFormat(), json()),
      //   filename: "txs-%DATE%.log",
      //   datePattern: "YY-MM",
      // }),
      // new winston.transports.File({
      //   dirname: "logs",
      //   filename: "airdrops.log",
      //   format: format.combine(
      //     onlyAirdropsFormat(),
      //     timestamp(),
      //     printf((info) => `${info.timestamp}, ${info.message}`)
      //   ),
      // }),
      // new winston.transports.File({
      //   dirname: "logs",
      //   filename: "airdroprewards.log",
      //   format: format.combine(
      //     onlyAirdropRewardsFormat(),
      //     timestamp(),
      //     printf((info) => `${info.timestamp}, ${info.message}`)
      //   ),
      // }),
    ],
    // exceptionHandlers: [
    //   new winston.transports.Console(),
    //   new winston.transports.DailyRotateFile({
    //     ...commonFileFormat,
    //     filename: "exceptions-%DATE%.log",
    //   }),
    // ],
    rejectionHandlers: [
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          align(),
          printf((info) => `${info.level} [${info.timestamp}]: ${info.message}`)
        ),
      }),
    ],
  }) as winston.Logger &
    Record<keyof (typeof myLevels)["levels"], winston.LeveledLogMethod>;
  process.on("uncaughtException", (ex) => {
    logger.error("Uncaught Exception: ", ex);
    logger.on("finish", () => {
      process.exit(1);
    });
  });
  return logger;
}

export function customError(msg: string, ...args: any[]): Error {
  const error = new Error(msg);
  logger.error("Error Thrown: ", error, ...args);
  return error;
}

// transform function to allow using winston logger like you would console.log.
// solution from here: https://stackoverflow.com/questions/55387738/how-to-make-winston-logging-library-work-like-console-log
function transform(info: any, opts: any) {
  const args = info[Symbol.for("splat")];
  if (args) {
    info.message = util.format(info.message, ...args);
  }
  return info;
}

function utilFormatter() {
  return { transform };
}
