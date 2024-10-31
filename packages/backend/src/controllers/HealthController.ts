import { Controller } from "@tsed/di";
import { Get, Returns, Summary } from "@tsed/schema";

@Controller("/health")
export class HealthController {
  @Get()
  @Summary("Health check")
  @Returns(200)
  index() {
    return "It works!";
  }
}
