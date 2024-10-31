import { $log, DILoggerOptions } from "@tsed/common";
import { isProduction } from "../envs/index";
import "@tsed/logger-file";

if (isProduction) {
  $log.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug"],
    layout: {
      type: "json"
    }
  });

  $log.appenders.set("stderr", {
    levels: ["trace", "fatal", "error", "warn"],
    type: "stderr",
    layout: {
      type: "json"
    }
  });

  $log.appenders.set("file", {
    type: "file",
    filename: `${__dirname}/../../../logs/app.log`,
    pattern: ".yyyy-MM-dd",
    maxLogSize: 10485760,
    backups: 8,
    compress: true,
    layout: {
      type: "json"
    }
  });
}

export default <DILoggerOptions>{
  level: "info",
  disableRoutesSummary: isProduction
};
