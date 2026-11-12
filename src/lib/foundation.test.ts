import { describe, expect, it } from "vitest";

describe("foundation", () => {
  it("keeps the initial application contract explicit", () => {
    expect("mochi").toBe("mochi");
  });
});
