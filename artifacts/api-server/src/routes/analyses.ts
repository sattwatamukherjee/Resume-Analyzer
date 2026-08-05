import { Router, type IRouter } from "express";
import { eq, and, desc, avg, max, min, count } from "drizzle-orm";
import { z } from "zod";
import { db, analysesTable } from "@workspace/db";
import { analyzeResume } from "../lib/resumeAnalyzer";
import { logger } from "../lib/logger";
import { analysisRateLimit } from "../lib/rateLimit";

const router: IRouter = Router();

const createAnalysisSchema = z.object({
  resumeText: z.string().trim().min(50).max(100_000),
  jobDescription: z.string().trim().min(50).max(50_000),
  fileName: z.string().trim().max(255).nullable().optional(),
});

// POST /analyses - create a new analysis
router.post("/analyses", analysisRateLimit, async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const validation = createAnalysisSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: "Invalid analysis request." });
    return;
  }

  const { resumeText, jobDescription, fileName } = validation.data;

  try {
    const result = await analyzeResume(resumeText, jobDescription);

    const [saved] = await db
      .insert(analysesTable)
      .values({
        userId: req.user.id,
        atsScore: result.atsScore,
        jobTitleGuess: result.jobTitleGuess ?? null,
        fileName: fileName ?? null,
        jobDescription: jobDescription.slice(0, 2000),
        resumeText: resumeText.slice(0, 10000),
        overallSummary: result.overallSummary ?? null,
        scoreBreakdown: result.scoreBreakdown,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        weakPoints: result.weakPoints,
        suggestions: result.suggestions,
        resumeStrengths: result.resumeStrengths,
      })
      .returning();

    res.status(201).json({
      id: saved.id,
      atsScore: saved.atsScore,
      scoreBreakdown: saved.scoreBreakdown,
      matchedSkills: saved.matchedSkills,
      missingSkills: saved.missingSkills,
      weakPoints: saved.weakPoints,
      suggestions: saved.suggestions,
      jobTitleGuess: saved.jobTitleGuess,
      resumeStrengths: saved.resumeStrengths,
      overallSummary: saved.overallSummary,
      fileName: saved.fileName,
      jobDescription: saved.jobDescription,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to analyze resume");
    res.status(500).json({ error: "Resume analysis failed. Please try again." });
  }
});

// GET /analyses/stats - user stats (must be before /:id route)
router.get("/analyses/stats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  try {
    const [statsRow] = await db
      .select({
        totalAnalyses: count(analysesTable.id),
        averageScore: avg(analysesTable.atsScore),
        highestScore: max(analysesTable.atsScore),
        lowestScore: min(analysesTable.atsScore),
      })
      .from(analysesTable)
      .where(eq(analysesTable.userId, userId));

    const recentRows = await db
      .select()
      .from(analysesTable)
      .where(eq(analysesTable.userId, userId))
      .orderBy(desc(analysesTable.createdAt))
      .limit(5);

    const allRows = await db
      .select({ missingSkills: analysesTable.missingSkills })
      .from(analysesTable)
      .where(eq(analysesTable.userId, userId));

    const skillCount: Record<string, number> = {};
    for (const row of allRows) {
      const skills = row.missingSkills as Array<{ skill: string }>;
      if (Array.isArray(skills)) {
        for (const s of skills) {
          if (s.skill) {
            skillCount[s.skill] = (skillCount[s.skill] ?? 0) + 1;
          }
        }
      }
    }
    const topMissingSkills = Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([skill]) => skill);

    res.json({
      totalAnalyses: Number(statsRow?.totalAnalyses ?? 0),
      averageScore: Math.round(Number(statsRow?.averageScore ?? 0)),
      highestScore: Number(statsRow?.highestScore ?? 0),
      lowestScore: Number(statsRow?.lowestScore ?? 0),
      topMissingSkills,
      recentAnalyses: recentRows.map((r) => ({
        id: r.id,
        atsScore: r.atsScore,
        jobTitleGuess: r.jobTitleGuess,
        fileName: r.fileName,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to load analysis statistics");
    res.status(500).json({ error: "Unable to load analysis statistics." });
  }
});

// GET /analyses - list current user's analyses
router.get("/analyses", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(analysesTable)
      .where(eq(analysesTable.userId, req.user.id))
      .orderBy(desc(analysesTable.createdAt));

    res.json(
      rows.map((r) => ({
        id: r.id,
        atsScore: r.atsScore,
        jobTitleGuess: r.jobTitleGuess,
        fileName: r.fileName,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err }, "Failed to list analyses");
    res.status(500).json({ error: "Unable to load analyses." });
  }
});

// GET /analyses/:id - get a single analysis
router.get("/analyses/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [row] = await db
      .select()
      .from(analysesTable)
      .where(and(eq(analysesTable.id, id), eq(analysesTable.userId, req.user.id)));

    if (!row) {
      res.status(404).json({ error: "Analysis not found" });
      return;
    }

    res.json({
      id: row.id,
      atsScore: row.atsScore,
      scoreBreakdown: row.scoreBreakdown,
      matchedSkills: row.matchedSkills,
      missingSkills: row.missingSkills,
      weakPoints: row.weakPoints,
      suggestions: row.suggestions,
      jobTitleGuess: row.jobTitleGuess,
      resumeStrengths: row.resumeStrengths,
      overallSummary: row.overallSummary,
      fileName: row.fileName,
      jobDescription: row.jobDescription,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to load analysis");
    res.status(500).json({ error: "Unable to load analysis." });
  }
});

// DELETE /analyses/:id
router.delete("/analyses/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(analysesTable)
      .where(and(eq(analysesTable.id, id), eq(analysesTable.userId, req.user.id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Analysis not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    logger.error({ err }, "Failed to delete analysis");
    res.status(500).json({ error: "Unable to delete analysis." });
  }
});

export default router;
