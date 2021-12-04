import { ApplicationService } from "@sap/cds";
import { applyMethodBindings } from "../../annotations/MethodBinding";
import type { RedisService } from "../cache/redis";
import { Logger } from "../logger";

/**
 * the fundamental part
 */
export class BaseService extends ApplicationService {
  protected redis: RedisService;

  protected logger: Logger;

  async init() {
    await super.init();
    // @ts-ignore
    this.logger = cds.log(this?.constructor?.name ?? "UnknownService");
    // @ts-ignore
    this.redis = await cds.connect.to("redis");
    applyMethodBindings(this);
  }
}
