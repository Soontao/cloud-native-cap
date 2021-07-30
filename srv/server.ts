import cds from "@sap/cds";
import { RedisService } from "./fundamental/redis";
cds.on("bootstrap", async (app) => {
  // @ts-ignore
  await cds.connect.to("redis", { kind: "kv", impl: RedisService });
});
module.exports = cds.server;
