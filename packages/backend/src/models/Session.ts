import { Expires, Model, MongooseDocument, ObjectID, PreHook, Unique } from "@tsed/mongoose";
import { Enum, Optional, Required } from "@tsed/schema";

export enum SessionStatus {
  PENDING = "pending",
  VERIFYING = "verifying",
  COMPLETED = "completed"
}

export type SessionStatusType = Lowercase<keyof typeof SessionStatus>;

@Model({
  name: "sessions",
  schemaOptions: {
    timestamps: { createdAt: true, updatedAt: true, currentTime: Date.now }
    // toJSON: {
    //   virtuals: true
    // },
    // toObject: { virtuals: true }
  }
})
export class Session {
  @ObjectID("id")
  _id: string;

  @Required()
  @Unique()
  uuid: string;

  @Required()
  @Enum(SessionStatus)
  status: SessionStatusType = "pending";

  @Optional()
  data: any;

  @Optional()
  verificationResult: any;

  @Expires(0)
  expiresAt: Date;

  constructor(args?: Partial<Session>) {
    args && Object.assign(this, args);
  }

  @PreHook("save")
  @PreHook("updateOne")
  static async beforeSave(model: MongooseDocument<Session>, next: any) {
    if (model.isNew) {
      // use ttl index to automatically wipe session after 1 day
      model.expiresAt = new Date(Date.now() + 86400 * 1000);
    }
    next();
  }
}
