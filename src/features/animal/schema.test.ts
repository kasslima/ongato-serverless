import { describe, expect, it } from "vitest";
import { animalCreateInputSchema, animalQuerySchema, animalUpdateInputSchema } from "./schema";

const validAnimalCreateInput = {
  name: "Mingau",
  imageUrl: "https://example.com/mingau.webp",
  age: "1 a 2 anos",
  gender: "macho",
  size: "pequeno",
  type: "gato",
  featured: false,
  attributes: null,
  description: "Gato tranquilo",
};

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

describe("animalCreateInputSchema", () => {
  it.each([
    ["true", true],
    ["false", false],
    ["1", true],
    ["0", false],
  ])("converts multipart featured=%s to %s", (input, expected) => {
    const result = animalCreateInputSchema.parse({
      ...validAnimalCreateInput,
      featured: input,
    });

    expect(result.featured).toBe(expected);
  });

  it("accepts boolean featured from JSON bodies", () => {
    const result = animalCreateInputSchema.parse({
      ...validAnimalCreateInput,
      featured: true,
    });

    expect(result.featured).toBe(true);
  });

  it("rejects invalid featured strings", () => {
    expect(() => animalCreateInputSchema.parse({
      ...validAnimalCreateInput,
      featured: "yes",
    })).toThrow();
  });
});

describe("animalUpdateInputSchema", () => {
  it("converts multipart featured strings", () => {
    const result = animalUpdateInputSchema.parse({ featured: "false" });

    expect(result.featured).toBe(false);
  });
});
