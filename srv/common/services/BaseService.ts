import { ApplicationService } from "@sap/cds";
import { applyMethodBindings } from "../../annotations/MethodBinding";
import type { RedisService } from "../../fundamental/redis";

/**
 * the fundamental part
 */
export class BaseService extends ApplicationService {
  protected redis: RedisService;
  async init() {
    await super.init();
    // @ts-ignore
    this.redis = await cds.connect.to("redis");
    applyMethodBindings(this);
  }
}
