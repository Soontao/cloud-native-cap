import { ApplicationService } from "@sap/cds";

// must use module exports now
module.exports = class ExampleService extends ApplicationService {
  async init() {
    await super.init();

    this.after("READ", "Houses", async (result) => {
      // perform some logic here.
    });
  }
};
