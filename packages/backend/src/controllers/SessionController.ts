import { Res } from "@tsed/common";
import { Controller, Inject, InjectorService } from "@tsed/di";
import { BadRequest, InternalServerError, NotFound, ServiceUnavailable } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import { BodyParams, PathParams } from "@tsed/platform-params";
import { Get, Post, Returns } from "@tsed/schema";
import { v4 } from "uuid";
import { Session, VqlWebhookRequest } from "../models";
import { SessionRepository } from "../repositories";

@Controller("/sessions")
export class SessionController {
  @Inject(Logger)
  private readonly logger: Logger;

  @Inject(SessionRepository)
  private readonly sessionRepository: SessionRepository;

  @Inject(InjectorService)
  private readonly injector: InjectorService;

  @Get("/:sessionId")
  @Returns(200, String)
  @Returns(NotFound.STATUS)
  @Returns(ServiceUnavailable.STATUS)
  async find(@PathParams("sessionId") sessionId: string, @Res() res: Res) {
    const session = await this.sessionRepository.find({ uuid: sessionId });
    if (!session) {
      throw new NotFound("Session not found");
    }
    // if (session.status !== "completed") {
    //   res.setHeader("Retry-After", 2);
    //   throw new ServiceUnavailable("Session not ready. Retry in a few seconds");
    // }
    return session;
  }

  @Post("/webhook")
  @Returns(200)
  @Returns(BadRequest.STATUS)
  @Returns(InternalServerError.STATUS)
  async onVqlDataReceived(@BodyParams() params: VqlWebhookRequest) {
    if (!params.values) {
      throw new BadRequest("VQL values must be presented.");
    }

    try {
      const attributes = typeof params.values === "string" ? JSON.parse(params.values) : params.values;

      const { vct, ShareLedger_Address: shareledgerAddress, Matic_Address: ethereumAddress } = attributes;

      // some required info
      if (!vct) {
        throw new BadRequest("`vct` must be specified");
      }
      if (!shareledgerAddress) {
        throw new BadRequest("`ShareLedger_Address` must be specified");
      }
      if (!ethereumAddress) {
        throw new BadRequest("`Matic_Address` must be specified");
      }

      // create object base on the received attributes
      const sessionId = params.sessionId || v4();

      this.logger.info(`Webhook trigger: queryId: ${params.queryId} - sessionId: ${params.sessionId} - newSessionId: ${sessionId}`);

      let session = await this.sessionRepository.find({ uuid: sessionId });
      if (!session) {
        session = new Session({ uuid: sessionId, status: "pending", data: attributes });
        session = await this.sessionRepository.save(session);
      }

      session.status = "verifying";
      await this.sessionRepository.save(session);

      // emit event
      this.injector.alterAsync("$startVerification", sessionId, attributes);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerError("An unhandled exception has occurred. Please try again later.");
    }
  }
}
