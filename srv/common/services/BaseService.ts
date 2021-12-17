import { ApplicationService } from "@sap/cds";
import { applyMethodBindings } from "../../annotations/MethodBinding";
import { MemoryCacheProvider, RedisCacheProvider } from "../cache";
import { CacheProvider } from "../cache/type";
import { Logger } from "../logger";

/**
 * the fundamental service
 */
export class BaseService extends ApplicationService {

  protected cacheProvider: CacheProvider;
  
  protected logger: Logger;

  async init() {
    await super.init();
    
    // @ts-ignore
    this.logger = cds.log(this?.constructor?.name ?? "UnknownService");

    if (process.env.REDIS_HOST) {
      this.cacheProvider = (await new RedisCacheProvider().connect());
    } else {
      this.cacheProvider = new MemoryCacheProvider();
    }
    
    applyMethodBindings(this);
    
  }

  get tenant() {
    // @ts-ignore
    return cds.context?.tenant;
  }

  
}
