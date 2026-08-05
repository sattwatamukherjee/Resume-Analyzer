import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Zap, FileSearch, ShieldCheck } from "lucide-react";
import { useGetUserStats, getGetUserStatsQueryKey } from "@workspace/api-client-react";
import { Gauge } from "@/components/Gauge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getScoreColor, getScoreBgColor, cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const { data: stats, isLoading } = useGetUserStats({
    query: {
      enabled: isAuthenticated
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="w-full flex-1 flex flex-col items-center bg-background">
        <div className="w-full max-w-5xl px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Stop guessing. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Start optimizing.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              ResumeIQ acts as a ruthless, precise recruiter that analyzes your software engineering resume against real job descriptions in 30 seconds.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button size="lg" className="text-lg px-8 h-14 rounded-full shadow-xl" onClick={login} data-testid="button-hero-login">
              Try Analyzer Now <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16 text-left">
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">Instant Feedback</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Drop your PDF and a job description. Get a score and detailed breakdown immediately.</p>
            </div>
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50">
              <FileSearch className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">Skill Gap Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">See exactly which required skills are missing or not prominently featured.</p>
            </div>
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50">
              <ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">Actionable Suggestions</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">No generic advice. Get specific rewrites and formatting tips to beat the ATS.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your resume performance.</p>
        </div>
        <Link href="/analyze">
          <Button asChild><span>New Analysis</span></Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-pulse">
          <div className="h-40 bg-secondary rounded-xl" />
          <div className="h-40 bg-secondary rounded-xl" />
          <div className="h-40 bg-secondary rounded-xl" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Score</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className={cn("text-4xl font-bold font-mono tracking-tighter", getScoreColor(stats.averageScore))}>
                  {stats.averageScore.toFixed(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Out of {stats.totalAnalyses} analyses</div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full", getScoreBgColor(stats.averageScore))} style={{ width: `${stats.averageScore}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analysis Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 mb-2">
                  <div className="text-4xl font-bold">{stats.totalAnalyses}</div>
                  <div className="text-sm text-muted-foreground mb-1 pb-1">Total run</div>
                </div>
                <div className="flex justify-between text-sm mt-4 pt-4 border-t border-border">
                  <div>High: <span className={cn("font-medium", getScoreColor(stats.highestScore))}>{stats.highestScore}</span></div>
                  <div>Low: <span className={cn("font-medium", getScoreColor(stats.lowestScore))}>{stats.lowestScore}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Missing Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topMissingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {stats.topMissingSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-sm bg-accent/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4">No data yet.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Recent Analyses</h2>
              {stats.recentAnalyses.length > 0 && (
                <Link href="/history" className="text-sm text-primary font-medium hover:underline">
                  View all
                </Link>
              )}
            </div>

            {stats.recentAnalyses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                    <FileSearch size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No analyses yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">Upload your resume and a job description to get your first ATS score and actionable feedback.</p>
                  <Link href="/analyze">
                    <Button asChild><span>Run First Analysis</span></Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {stats.recentAnalyses.map(analysis => (
                  <Link href={`/results/${analysis.id}`} key={analysis.id}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-bold font-mono text-lg shrink-0", getScoreBgColor(analysis.atsScore).replace('bg-', 'bg-').concat('/15'), getScoreColor(analysis.atsScore))}>
                          {analysis.atsScore}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {analysis.jobTitleGuess || "Unknown Position"}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="truncate max-w-[200px] sm:max-w-xs">{analysis.fileName || "Pasted text"}</span>
                            <span>•</span>
                            <span>{format(new Date(analysis.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                          <ArrowRight size={20} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
