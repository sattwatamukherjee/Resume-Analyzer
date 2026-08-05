import { openai } from "./openaiClient";
import { logger } from "./logger";

export interface SkillItem {
  skill: string;
  importance: "high" | "medium" | "low";
  context: string | null;
}

export interface WeakPoint {
  section: string;
  issue: string;
  severity: "critical" | "moderate" | "minor";
}

export interface Suggestion {
  category: string;
  suggestion: string;
  impact: "high" | "medium" | "low";
  example: string | null;
}

export interface ScoreBreakdown {
  keywordMatch: number;
  formatScore: number;
  experienceRelevance: number;
  educationMatch: number;
}

export interface AnalysisResult {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: SkillItem[];
  missingSkills: SkillItem[];
  weakPoints: WeakPoint[];
  suggestions: Suggestion[];
  jobTitleGuess: string | null;
  resumeStrengths: string[];
  overallSummary: string | null;
}

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume analyst with 15+ years of experience in technical recruiting. Your job is to analyze a resume against a job description and provide detailed, actionable feedback.

Analyze the resume carefully and return a JSON object with the following exact structure:

{
  "atsScore": <integer 0-100, overall ATS compatibility score>,
  "scoreBreakdown": {
    "keywordMatch": <integer 0-100, how well resume keywords match job requirements>,
    "formatScore": <integer 0-100, resume formatting and structure quality>,
    "experienceRelevance": <integer 0-100, how relevant the experience is>,
    "educationMatch": <integer 0-100, how well education matches requirements>
  },
  "jobTitleGuess": "<string: the target job title inferred from the job description, or null>",
  "resumeStrengths": ["<strength 1>", "<strength 2>", ...],
  "overallSummary": "<2-3 sentence plain English summary of the analysis>",
  "matchedSkills": [
    {
      "skill": "<skill name>",
      "importance": "high|medium|low",
      "context": "<why this skill matters for the role>"
    }
  ],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "importance": "high|medium|low",
      "context": "<why the candidate should add this>"
    }
  ],
  "weakPoints": [
    {
      "section": "<resume section: Summary|Experience|Education|Skills|Projects|Achievements|Formatting>",
      "issue": "<specific, actionable description of the weakness>",
      "severity": "critical|moderate|minor"
    }
  ],
  "suggestions": [
    {
      "category": "<Keywords|Formatting|Content|Quantification|Tailoring|ATS-Optimization>",
      "suggestion": "<specific, actionable suggestion>",
      "impact": "high|medium|low",
      "example": "<concrete before/after example, or null>"
    }
  ]
}

Guidelines:
- Be realistic and specific. An average resume gets 40-60. A well-tailored resume gets 70-85. Only truly exceptional matches get 85+.
- Matched skills: skills/keywords explicitly present in both resume and job description
- Missing skills: important skills in the JD that are absent from the resume
- Identify at least 3-5 weak points (sections that could be improved)
- Provide 5-8 concrete, actionable suggestions
- Score breakdown components should average close to the overall atsScore
- Return ONLY the JSON object, no markdown or explanatory text`;

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const userMessage = `## RESUME:\n${resumeText}\n\n## JOB DESCRIPTION:\n${jobDescription}`;

  logger.info("Starting resume analysis with OpenAI");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(content) as AnalysisResult;
  } catch {
    logger.error({ content }, "Failed to parse OpenAI JSON response");
    throw new Error("Failed to parse AI analysis response");
  }

  // Validate and clamp score
  parsed.atsScore = Math.max(0, Math.min(100, parsed.atsScore ?? 0));
  parsed.scoreBreakdown = {
    keywordMatch: Math.max(0, Math.min(100, parsed.scoreBreakdown?.keywordMatch ?? 0)),
    formatScore: Math.max(0, Math.min(100, parsed.scoreBreakdown?.formatScore ?? 0)),
    experienceRelevance: Math.max(0, Math.min(100, parsed.scoreBreakdown?.experienceRelevance ?? 0)),
    educationMatch: Math.max(0, Math.min(100, parsed.scoreBreakdown?.educationMatch ?? 0)),
  };
  parsed.matchedSkills = parsed.matchedSkills ?? [];
  parsed.missingSkills = parsed.missingSkills ?? [];
  parsed.weakPoints = parsed.weakPoints ?? [];
  parsed.suggestions = parsed.suggestions ?? [];
  parsed.resumeStrengths = parsed.resumeStrengths ?? [];

  logger.info({ score: parsed.atsScore }, "Resume analysis complete");
  return parsed;
}
