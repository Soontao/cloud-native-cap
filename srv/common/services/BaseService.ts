import { ApplicationService } from "@sap/cds";
import { EventContext } from "@sap/cds/apis/services";
import { applyMethodBindings } from "../../annotations/MethodBinding";
import { MemoryCacheProvider, RedisCacheProvider } from "../cache";
import { CacheProvider } from "../cache/type";
import { Logger } from "../logger";

/**
 * the fundamental service
 */
export class BaseService extends ApplicationService {

  /**
   * fundamental cache layer
   * 
   * @example
   * 
   * ```ts
   * this.cacheProvider.provision("cacheName")
   * ```
   */
  protected cacheProvider!: CacheProvider;
  
  /**
   * fundamental logger layer
   * 
   * @example
   * ```ts
   * this.logger.info("message payload is", req.body, "please check input")
   * ```
   */
  protected logger!: Logger;

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

  /**
   * get tenant string from context info
   */
  get tenant() {
    // @ts-ignore
    return (cds.context as EventContext)?.tenant;
  }

}
