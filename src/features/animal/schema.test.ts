import { describe, expect, it } from "vitest";
import { animalQuerySchema } from "./schema";

describe("animalQuerySchema", () => {
  it.each([
    ["0", false],
    ["1", true],
  ])("converts featured=%s to %s", (input, expected) => {
    const result = animalQuerySchema.parse({ featured: input });

    expect(result.featured).toBe(expected);
  });

  it("rejects featured values other than 0 and 1", () => {
    expect(() => animalQuerySchema.parse({ featured: "true" })).toThrow();
  });

  it("accepts age and size filters", () => {
    const result = animalQuerySchema.parse({
      age: "1 a 2 anos",
      size: "medio",
    });

    expect(result).toMatchObject({
      age: "1 a 2 anos",
      size: "medio",
    });
  });
});
