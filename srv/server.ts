import cds from "@sap/cds";
import { defaultRedisService } from "./services/RedisService";
cds.on("bootstrap", async (app) => {
  // await some services ready
  await defaultRedisService.connect();
});
module.exports = cds.server;
