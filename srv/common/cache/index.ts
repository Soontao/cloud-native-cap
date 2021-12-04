import { Service } from "@sap/cds/apis/services";
import { RedisService } from "./redis";

export interface CacheService extends Service {}

export { RedisService };
