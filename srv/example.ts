import { isArray, isEmpty } from "@newdash/newdash";
import { ApplicationService } from "@sap/cds";
import { Request } from "@sap/cds/apis/services";

// must use module exports now
module.exports = class ExampleService extends ApplicationService {
  async init() {
    await super.init();

    this.after("READ", "Houses", this._afterReadHouses.bind(this));
  }

  private async _afterReadHouse(result, req: Request) {
    if (isEmpty(result.address)) {
      result.address = "Unknown";
    }
  }

  private async _afterReadHouses(results: any | any[], req: Request) {
    if (isArray(results)) {
      for (const item of results) {
        await this._afterReadHouse(item, req);
      }
    } else {
      await this._afterReadHouse(results, req);
    }
  }
};
