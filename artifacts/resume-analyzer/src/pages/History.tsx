import { useState } from "react";
import { Link } from "wouter";
import { useListAnalyses, useDeleteAnalysis, getListAnalysesQueryKey, getGetUserStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Trash2, Search, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn, getScoreColor, getScoreBgColor } from "@/lib/utils";

export default function History() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: analyses, isLoading } = useListAnalyses();
  const deleteAnalysis = useDeleteAnalysis();
  
  const [search, setSearch] = useState("");

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    
    deleteAnalysis.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Analysis deleted" });
        queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUserStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    });
  };

  const filteredAnalyses = analyses?.filter(a => {
    const term = search.toLowerCase();
    return (
      (a.jobTitleGuess && a.jobTitleGuess.toLowerCase().includes(term)) ||
      (a.fileName && a.fileName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground mt-1">Review your past ATS analyses.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search roles or files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Link href="/analyze">
            <Button asChild><span>New Analysis</span></Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !analyses || analyses.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-card">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No history found</h3>
          <p className="text-muted-foreground mb-6">You haven't run any resume analyses yet.</p>
          <Link href="/analyze"><Button asChild><span>Start your first analysis</span></Button></Link>
        </div>
      ) : filteredAnalyses?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No results found for "{search}"
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnalyses?.map(analysis => (
            <Link href={`/results/${analysis.id}`} key={analysis.id}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center font-bold font-mono text-xl shrink-0", 
                    getScoreBgColor(analysis.atsScore).replace('bg-', 'bg-').concat('/15'), 
                    getScoreColor(analysis.atsScore)
                  )}>
                    {analysis.atsScore}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                      {analysis.jobTitleGuess || "Custom Position"}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground mt-1">
                      <span className="truncate flex items-center gap-1">
                        <FileText size={14} /> {analysis.fileName || "Pasted text"}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{format(new Date(analysis.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={(e) => handleDelete(analysis.id, e)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors hover-elevate"
                      title="Delete analysis"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
