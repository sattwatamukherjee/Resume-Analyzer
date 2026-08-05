import { useRoute, Link } from "wouter";
import { useGetAnalysis, getGetAnalysisQueryKey } from "@workspace/api-client-react";
import { Gauge } from "@/components/Gauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";
import { cn, getScoreColor, getScoreBgColor } from "@/lib/utils";

const importanceColor = (importance: string) => {
  if (importance === "high") return "bg-score-red text-white";
  if (importance === "medium") return "bg-score-amber text-white";
  return "bg-secondary text-foreground";
};

export default function Results() {
  const [match, params] = useRoute("/results/:id");
  const id = match ? parseInt(params.id) : 0;
  
  const { data: analysis, isLoading, error } = useGetAnalysis(id, {
    query: {
      enabled: !!id,
      queryKey: getGetAnalysisQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary rounded-full animate-pulse" />
          <div className="h-8 bg-secondary rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-[400px] bg-secondary rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-[400px] bg-secondary rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full text-center py-20">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Analysis not found</h1>
        <p className="text-muted-foreground mb-6">This analysis might have been deleted or doesn't exist.</p>
        <Link href="/"><Button asChild><span>Back to Dashboard</span></Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analysis Results</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <span>{analysis.jobTitleGuess || "Custom Position"}</span>
              <span>•</span>
              <span>{analysis.fileName || "Pasted text"}</span>
            </p>
          </div>
        </div>
        <Link href="/analyze">
          <Button variant="outline" asChild><span>Analyze Another</span></Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8 text-center bg-card border-border shadow-sm">
          <Gauge score={analysis.atsScore} animate={true} />
          
          <div className="mt-8 w-full space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground text-left">Score Breakdown</h3>
            
            <div className="space-y-3">
              {[
                { label: "Keyword Match", score: analysis.scoreBreakdown.keywordMatch },
                { label: "Experience Relevance", score: analysis.scoreBreakdown.experienceRelevance },
                { label: "Format & Structure", score: analysis.scoreBreakdown.formatScore },
                { label: "Education Match", score: analysis.scoreBreakdown.educationMatch }
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-mono text-muted-foreground">{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", getScoreBgColor(item.score))} 
                      style={{ width: `${item.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>AI-generated overview of your resume's fit for this role.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg mb-8">
              {analysis.overallSummary || "Your resume demonstrates a strong baseline but lacks specific keyword density required for this ATS system. Focus on emphasizing the missing critical skills and adjusting your experience formatting."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-score-green/10 border border-score-green/20 rounded-xl p-5">
                <h4 className="font-semibold text-score-green flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} /> Top Strengths
                </h4>
                <ul className="space-y-2">
                  {analysis.resumeStrengths.slice(0, 3).map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                      <span className="text-score-green mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-score-red/10 border border-score-red/20 rounded-xl p-5">
                <h4 className="font-semibold text-score-red flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} /> Critical Gaps
                </h4>
                <ul className="space-y-2">
                  {analysis.weakPoints.filter(w => w.severity === 'critical').slice(0, 3).map((wp, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                      <span className="text-score-red mt-0.5">•</span>
                      <span>{wp.issue}</span>
                    </li>
                  ))}
                  {analysis.weakPoints.filter(w => w.severity === 'critical').length === 0 && (
                    <li className="text-sm text-foreground/80">No critical formatting or structural issues found.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border rounded-none p-0 space-x-6 mb-8 overflow-x-auto">
          <TabsTrigger value="skills" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Skills Analysis</TabsTrigger>
          <TabsTrigger value="weaknesses" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Weak Points</TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Action Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills" className="space-y-8 mt-0 focus-visible:ring-0">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">Missing Required Skills</h3>
              <Badge variant="red" className="ml-2">{analysis.missingSkills.length}</Badge>
            </div>
            {analysis.missingSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.missingSkills.map((skill, i) => (
                  <div key={i} className="p-4 border border-score-red/20 bg-score-red/5 rounded-xl flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-foreground">{skill.skill}</span>
                      <Badge className={cn("text-[10px] h-5 px-1.5 uppercase", importanceColor(skill.importance))}>
                        {skill.importance}
                      </Badge>
                    </div>
                    {skill.context && <p className="text-xs text-muted-foreground leading-relaxed">{skill.context}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 text-score-green mx-auto mb-2" />
                <p>Great job! You matched all the critical skills for this role.</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">Matched Skills</h3>
              <Badge variant="green" className="ml-2">{analysis.matchedSkills.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedSkills.map((skill, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-score-green/20 bg-score-green/10 text-sm font-medium">
                  <CheckCircle2 size={14} className="text-score-green" />
                  {skill.skill}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="weaknesses" className="mt-0 focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.weakPoints.map((wp, i) => (
              <Card key={i} className="border-l-4" style={{ borderLeftColor: wp.severity === 'critical' ? 'hsl(var(--score-red))' : wp.severity === 'moderate' ? 'hsl(var(--score-amber))' : 'hsl(var(--muted-foreground))' }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{wp.section}</Badge>
                    <span className={cn(
                      "text-xs font-bold uppercase",
                      wp.severity === 'critical' ? "text-score-red" : wp.severity === 'moderate' ? "text-score-amber" : "text-muted-foreground"
                    )}>
                      {wp.severity} Issue
                    </span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">{wp.issue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="suggestions" className="mt-0 focus-visible:ring-0">
          <div className="space-y-4">
            {analysis.suggestions.map((sug, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Lightbulb size={16} />
                      </div>
                      <h4 className="font-bold text-lg">{sug.category}</h4>
                      <Badge variant={sug.impact === 'high' ? 'default' : 'secondary'} className="ml-auto md:ml-0 text-[10px] uppercase">
                        {sug.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-sm md:text-base md:pl-11">
                      {sug.suggestion}
                    </p>
                  </div>
                  
                  {sug.example && (
                    <div className="md:w-1/3 shrink-0 bg-secondary rounded-lg p-4 font-mono text-xs text-secondary-foreground">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                        <ChevronRight size={12} /> Example Rewrite
                      </div>
                      "{sug.example}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
