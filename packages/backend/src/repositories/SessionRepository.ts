import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { Session } from "../models";
import { Repository } from "./Repository";

@Injectable()
export class SessionRepository extends Repository<Session> {
  @Inject(Session)
  protected Model: MongooseModel<Session>;
}
