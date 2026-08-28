import { describe, expect, it } from "vitest";

import { appRouter } from "./index";

describe("API Smoke Test", () => {
  it("should have an appRouter", () => {
    expect(appRouter).toBeDefined();
  });
});
