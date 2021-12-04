import cds from "@sap/cds";
import { RedisService } from "../../srv/common/cache";
import { setupTest, stopRedis } from "../utils";

describe("Redis Service Test", () => {
  const server = setupTest();

  it("should support basic set/get", async () => {
    const redis: RedisService = (await cds.connect.to("redis")) as any;
    expect(await redis.get("test-uuid")).toBeNull();
    expect(await redis.set("test-uuid", "value", 1));
    expect(await redis.get("test-uuid")).toBe("value");
    await server.sleep(1100);
    expect(await redis.get("test-uuid")).toBeNull();
  });

  afterAll(async () => {
    await stopRedis();
  });
});
