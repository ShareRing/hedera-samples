import { readFileSync } from "fs";
import { envs } from "./envs/index";
import loggerConfig from "./logger/index";
import mongooseConfig from "./mongoose/index";
import hederaConfig from "./hedera/index";

const pkg = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));

function parseBoolean(value: any) {
  if (typeof value === "string") {
    if (!Number.isNaN(parseInt(value))) {
      return parseInt(value) !== 0;
    }
    return value.toLowerCase() === "true";
  } else if (typeof value === "number") {
    return value !== 0;
  }
  return Boolean(value); // For other types, return the default boolean conversion
}

export const config: Partial<TsED.Configuration> = {
  version: pkg.version,
  envs,
  logger: loggerConfig,
  mongoose: mongooseConfig,
  // additional shared configuration
  hedera: hederaConfig
};

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace TsED {
//     interface Configuration {

//     }
//   }
// }
