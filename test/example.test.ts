import { setupTest, stopRedis } from "./utils";

describe("Example Service Test Suite", () => {
  const server = setupTest();

  it("should support basic CRUD", async () => {
    const response = await server.get("/example/Houses");

    expect(response.status).toBe(200);
    expect(response.data?.["@odata.context"]).toBe("$metadata#Houses");
    expect(response.data.value).toHaveLength(0);

    const { data: created } = await server.post("/example/Houses", {});
    expect(created).not.toBeUndefined();
    expect(created?.["ID"]).not.toBeUndefined();

    const { data: updated } = await server.patch(`/example/Houses(${created.ID})`, { price: 1.15 });
    expect(updated?.["price"]).not.toBeUndefined();

    // custom enhanced query logic test
    const { data: quired } = await server.get(`/example/Houses(${created.ID})`);
    expect(quired.address).toBe("Unknown");

    const {
      data: { value: list }
    } = await server.get(`/example/Houses`);
    expect(list?.[0]?.address).toBe("Unknown");
  });

  afterAll(async () => {
    await stopRedis();
  });
});
