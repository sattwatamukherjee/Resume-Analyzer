import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateAnalysis, getListAnalysesQueryKey, getGetUserStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist/build/pdf.worker.min.mjs";

const LOADING_MESSAGES = [
  "Parsing resume...",
  "Extracting keywords...",
  "Matching job requirements...",
  "Calculating ATS score...",
  "Generating feedback..."
];

export default function Analyze() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createAnalysis = useCreateAnalysis();
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle loading messages when analyzing
  useEffect(() => {
    if (!createAnalysis.isPending) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [createAnalysis.isPending]);

  const extractText = async (file: File) => {
    setIsExtracting(true);
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        setResumeText(text);
        setFile(file);
      } else if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        setFile(file);
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
      }
    } catch (error: any) {
      toast({
        title: "Failed to read file",
        description: error.message || "An error occurred while reading the file.",
        variant: "destructive"
      });
      setFile(null);
      setResumeText("");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) extractText(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) extractText(selectedFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || resumeText.length < 50) {
      toast({ title: "Insufficient Resume Content", description: "Please upload a valid resume with enough text.", variant: "destructive" });
      return;
    }
    if (!jobDescription || jobDescription.length < 50) {
      toast({ title: "Insufficient Job Description", description: "Please paste a complete job description.", variant: "destructive" });
      return;
    }

    createAnalysis.mutate({
      data: {
        resumeText,
        jobDescription,
        fileName: file?.name || "pasted_text.txt"
      }
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUserStatsQueryKey() });
        setLocation(`/results/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Analysis Failed",
          description: error?.error || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    });
  };

  if (createAnalysis.isPending) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
        </div>
        <div className="mt-8 h-8 flex items-center justify-center overflow-hidden">
          <h2 key={loadingMsgIdx} className="text-2xl font-bold tracking-tight animate-in slide-in-from-bottom-4 fade-in duration-300">
            {LOADING_MESSAGES[loadingMsgIdx]}
          </h2>
        </div>
        <p className="text-muted-foreground mt-2 max-w-sm text-center">This usually takes about 10-30 seconds depending on the length of your resume.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">New Analysis</h1>
        <p className="text-muted-foreground">Upload your resume and paste the job description to get your ATS match score.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
              Upload Resume
            </h2>
            {file && <span className="text-sm font-medium text-score-green flex items-center gap-1"><CheckCircle2 size={16} /> Extracted {resumeText.length} chars</span>}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.txt" 
            onChange={handleFileChange}
          />

          {!file ? (
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-card hover:bg-secondary/30",
                isDragging ? "border-primary bg-primary/5" : "border-border",
                isExtracting && "opacity-50 pointer-events-none"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary mb-4 animate-spin" />
                  <p className="font-medium text-lg">Extracting text...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                    <UploadCloud size={32} />
                  </div>
                  <p className="font-semibold text-lg mb-1">Drag and drop your resume here</p>
                  <p className="text-sm text-muted-foreground mb-6">Supports PDF or TXT up to 5MB</p>
                  <Button type="button" variant="outline">Browse Files</Button>
                </>
              )}
            </div>
          ) : (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center text-primary shadow-sm border border-border">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setFile(null); setResumeText(""); }}>
                  Replace
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
              Job Description
            </h2>
            <span className="text-xs text-muted-foreground">{jobDescription.length} chars</span>
          </div>
          
          <div className="relative">
            <textarea
              className="w-full min-h-[250px] p-4 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            disabled={!resumeText || !jobDescription || createAnalysis.isPending}
            className="w-full sm:w-auto h-12 px-8 text-base shadow-lg"
          >
            Analyze Resume <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
