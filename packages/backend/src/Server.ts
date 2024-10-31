import "@tsed/ajv";
import { PlatformApplication } from "@tsed/common";
import { Configuration, Inject } from "@tsed/di";
// import "@tsed/mongoose";
import "@tsed/platform-express"; // /!\ keep this import
import "@tsed/swagger";
import { isProduction } from "./config/envs/index";
import { config } from "./config/index";
import * as controllers from "./controllers/index";

// modules
import "./providers/hedera";

function removeTrailingSlash(url: string) {
  return url === "/" ? url : url.replace(/\/+/g, "/").replace(/\/+$/, "");
}

export const basePath = removeTrailingSlash(process.env.BASE_PATH || "/");

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8084,
  httpsPort: false, // CHANGE
  disableComponentsScan: true,
  mount: {
    [basePath]: [...Object.values(controllers)]
  },
  swagger: isProduction
    ? undefined
    : [
        {
          //viewPath: isProduction ? false : undefined,
          path: removeTrailingSlash(`${basePath}${process.env.SWAGGER_BASE_PATH || ""}/docs`),
          specVersion: "3.0.1"
        }
      ],
  middlewares: [
    "cors",
    "cookie-parser",
    "compression",
    "method-override",
    { use: "json-parser", options: { limit: "1024mb" } },
    { use: "urlencoded-parser", options: { limit: "1024mb", extended: true } }
  ],
  exclude: ["**/*.spec.ts"]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Configuration()
  protected settings: Configuration;
}
