import { isArray, isEmpty } from "@newdash/newdash";
import { Request } from "@sap/cds/apis/services";
import { AfterRead } from "./annotations/MethodBinding";
import { BaseService } from "./common/services/BaseService";

// must use module exports now
class ExampleService extends BaseService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async _afterReadHouse(result, req: Request) {
    await this.redis.set("a", 1);
    if (isEmpty(result.address)) {
      result.address = "Unknown";
    }
  }

  @AfterRead("Houses")
  public async _afterReadHouses(results: any | any[], req: Request) {
    if (isArray(results)) {
      for (const item of results) {
        await this._afterReadHouse(item, req);
      }
    } else {
      await this._afterReadHouse(results, req);
    }
  }
}

module.exports = ExampleService;
