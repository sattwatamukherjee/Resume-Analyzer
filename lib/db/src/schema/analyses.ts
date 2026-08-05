import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  atsScore: integer("ats_score").notNull(),
  jobTitleGuess: text("job_title_guess"),
  fileName: text("file_name"),
  jobDescription: text("job_description"),
  resumeText: text("resume_text").notNull(),
  overallSummary: text("overall_summary"),
  scoreBreakdown: jsonb("score_breakdown").notNull(),
  matchedSkills: jsonb("matched_skills").notNull(),
  missingSkills: jsonb("missing_skills").notNull(),
  weakPoints: jsonb("weak_points").notNull(),
  suggestions: jsonb("suggestions").notNull(),
  resumeStrengths: jsonb("resume_strengths").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
