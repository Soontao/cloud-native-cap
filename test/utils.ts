// @ts-nocheck
import cds from "@sap/cds";
import type { AxiosInstance } from "axios";
import path from "path";

interface TestUtil {
  assert: Chai.AssertStatic;
  expect: Chai.ExpectStatic;
  chai: Chai;
  sleep: (timeout: number) => Promise<void>;
}
type TestFacade = TestUtil & Pick<AxiosInstance, "get" | "post" | "delete" | "patch" | "put">;

/**
 * setup test server
 * @returns test server & test util
 */
export function setupTest(): TestFacade {
  return cds.test(path.join(__dirname, ".."));
}
