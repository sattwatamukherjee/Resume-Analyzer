import { describe, expect, it } from "vitest";
import { z } from "zod";

const createAnalysisSchema = z.object({
  resumeText: z.string().trim().min(50).max(100_000),
  jobDescription: z.string().trim().min(50).max(50_000),
  fileName: z.string().trim().max(255).nullable().optional(),
});

describe("analysis request validation", () => {
  it("accepts a valid analysis request", () => {
    const result = createAnalysisSchema.safeParse({
      resumeText: "R".repeat(100),
      jobDescription: "J".repeat(100),
      fileName: "resume.pdf",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing or too-short resume", () => {
    const result = createAnalysisSchema.safeParse({
      resumeText: "too short",
      jobDescription: "J".repeat(100),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing or too-short job description", () => {
    const result = createAnalysisSchema.safeParse({
      resumeText: "R".repeat(100),
      jobDescription: "too short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects oversized resume text", () => {
    const result = createAnalysisSchema.safeParse({
      resumeText: "R".repeat(100_001),
      jobDescription: "J".repeat(100),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an oversized file name", () => {
    const result = createAnalysisSchema.safeParse({
      resumeText: "R".repeat(100),
      jobDescription: "J".repeat(100),
      fileName: "x".repeat(256),
    });

    expect(result.success).toBe(false);
  });
});
