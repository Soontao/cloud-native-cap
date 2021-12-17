import { RedisCacheProvider } from "../../srv/common/cache";
import { setupTest } from "../utils";

describe("Redis Service Test", () => {
  const server = setupTest();

  it("should support basic set/get", async () => {
    const provider: RedisCacheProvider = await new RedisCacheProvider().connect();
    const cache = await provider.provision<string, any>("test");
    expect(await cache.get("test-uuid")).toBeNull();
    expect(await cache.set("test-uuid", "value", 1));
    expect(await cache.get("test-uuid")).toBe("value");
    await server.sleep(1100);
    expect(await cache.get("test-uuid")).toBeNull();
    await provider.stop();
  });

 
});
