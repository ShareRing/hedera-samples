import { Optional, Property, Required } from "@tsed/schema";

export class VqlWebhookRequest {
  @Required()
  queryId: string;

  @Optional()
  sessionId?: string;

  @Optional()
  values: any; // JSON string

  @Required()
  result: string;

  @Property()
  metadata?: string;
}
