
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Leaf,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  X,
  Info,
  ScanLine,
  Bot,
  HelpingHand
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getDiseaseInfo, askQuestionAboutDisease } from "@/app/actions";
import { cn } from "@/lib/utils";
import { analyzeImage } from "@/ai/flows/analyze-image-flow";
import { Textarea } from "@/components/ui/textarea";

type PredictionResult = {
  name: string;
  confidence: number;
  summary: string;
  treatments: string[];
  causes: string[];
  isHealthy: boolean;
};

export default function LeafAnalysisClient() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setPredictionResult(null);
        setAnswer(null);
        setQuestion("");
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload a valid image file.",
      });
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsLoading(true);
    setPredictionResult(null);

    try {
      const result = await analyzeImage({ photoDataUri: image });
      
      const isHealthy = result.diagnosis.isHealthy;
      const diseaseName = result.diagnosis.disease || result.identification.commonName;

      if (isHealthy) {
        setPredictionResult({
          name: "Healthy",
          confidence: result.diagnosis.confidence,
          summary: "The leaf appears to be healthy.",
          treatments: [],
          causes: [],
          isHealthy: true,
        });
      } else {
        const diseaseInfo = await getDiseaseInfo(diseaseName);
        setPredictionResult({
          name: diseaseName,
          confidence: result.diagnosis.confidence,
          ...diseaseInfo,
          isHealthy: false,
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAskQuestion = async () => {
    if (!question || !predictionResult) return;

    setIsAsking(true);
    setAnswer(null);

    try {
      const result = await askQuestionAboutDisease({
        diseaseName: predictionResult.name,
        summary: predictionResult.summary,
        treatments: predictionResult.treatments,
        question: question,
      });
      setAnswer(result.answer);
    } catch (error) {
      console.error("Failed to ask question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get an answer. Please try again.",
      });
    } finally {
      setIsAsking(false);
    }
  };

  const handleReset = () => {
      setImage(null);
      setPredictionResult(null);
      setIsLoading(false);
      setAnswer(null);
      setQuestion("");
  }

  const renderInitialState = () => (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full p-8 border-2 border-dashed rounded-3xl transition-all duration-300",
        "bg-card/5 border-border/20 backdrop-blur-sm",
        isDragging ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105" : "hover:border-primary/50",
        "animate-in fade-in-50 zoom-in-95 duration-500"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      <div className="text-center cursor-pointer group">
        <ScanLine className="w-24 h-24 text-muted-foreground/50 mx-auto mb-6 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
        <h2 className="text-3xl font-bold mb-2">Tap here or drop a leaf photo</h2>
        <p className="text-muted-foreground mb-6 text-lg">
          Upload an image to get an AI-powered analysis of your plant's health.
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelected}
        accept="image/*"
        className="hidden"
      />
    </div>
  );

  const renderAnalysisState = () => (
    <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in-50 duration-500">
        <div className="relative aspect-square w-full max-w-lg mx-auto md:max-w-none rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-border/20">
            {image && <Image src={image} alt="Uploaded leaf" layout="fill" objectFit="cover" />}
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 text-foreground z-10 backdrop-blur-sm">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Analyzing leaf...</p>
                    <p className="text-sm text-muted-foreground">This may take a moment...</p>
                </div>
            )}
        </div>
        <div className="flex flex-col gap-6 justify-center">
            {!predictionResult && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-card/10 backdrop-blur-lg rounded-3xl shadow-lg border border-border/10 animate-in fade-in-50 duration-500">
                    <Leaf className="w-16 h-16 text-primary" />
                    <h2 className="text-3xl font-bold">Ready to Analyze</h2>
                    <p className="text-muted-foreground text-center max-w-sm">Click the button below to start the AI-powered disease prediction.</p>
                    <Button onClick={handleAnalyze} size="lg" className="mt-4 text-lg py-7 px-10 rounded-full shadow-lg shadow-primary/20">
                        <Sparkles className="mr-3 h-6 w-6" />
                        Analyze Leaf
                    </Button>
                </div>
            )}
            {predictionResult && renderResults()}
        </div>
    </div>
  );

  const getConfidenceInfo = (confidence: number) => {
    if (confidence > 0.85) {
      return { level: "High Confidence", color: "text-primary" };
    }
    if (confidence > 0.6) {
      return { level: "Medium Confidence", color: "text-yellow-400" };
    }
    return { level: "Low Confidence", color: "text-orange-500" };
  };

  const renderResults = () => {
    const confidence = predictionResult?.confidence ?? 0;
    const confidenceInfo = getConfidenceInfo(confidence);
    const diagnosisLevel = predictionResult?.isHealthy ? "Confirmed" : confidence > 0.85 ? "Confirmed" : "Possible";
      
    return (
      <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
        <Card className="shadow-2xl shadow-black/20 border border-border/20 bg-card/20 backdrop-blur-xl rounded-3xl">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-4xl font-bold mb-2">
                            {predictionResult?.isHealthy ? 'Healthy' : predictionResult?.name}
                        </CardTitle>
                         <div className="flex items-center gap-4">
                            <Badge variant={predictionResult?.isHealthy ? "default" : "destructive"} className="text-sm bg-opacity-20 text-opacity-100 border-opacity-30">
                                {predictionResult?.isHealthy ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Info className="mr-2 h-4 w-4" />}
                                Diagnosis: {diagnosisLevel}
                            </Badge>
                             {!predictionResult?.isHealthy && (
                                <span className={cn("text-sm font-medium", confidenceInfo.color)}>
                                    {confidenceInfo.level}
                                </span>
                            )}
                        </div>
                    </div>
                     <Button onClick={handleReset} variant="ghost" size="icon" className="rounded-full h-10 w-10">
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-base">{predictionResult?.summary}</p>
            </CardContent>
        </Card>

        {!predictionResult?.isHealthy && (
          <div className="grid md:grid-cols-2 gap-6">
            {predictionResult?.causes && predictionResult?.causes.length > 0 && (
                <Card className="shadow-2xl shadow-black/20 border border-border/20 bg-card/20 backdrop-blur-xl rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <HelpingHand className="text-primary"/>
                            Common Causes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                           {predictionResult.causes.map((cause, index) => <li key={index}>{cause}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
            {predictionResult?.treatments && predictionResult?.treatments.length > 0 && (
                <Card className="shadow-2xl shadow-black/20 border border-border/20 bg-card/20 backdrop-blur-xl rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <Stethoscope className="text-primary"/>
                            Suggested Treatments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                           {predictionResult.treatments.map((treatment, index) => <li key={index}>{treatment}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
        {!predictionResult?.isHealthy && renderQuestionSection()}
      </div>
  )};

  const renderQuestionSection = () => (
    <div className="flex flex-col gap-6">
      <Card className="shadow-2xl shadow-black/20 border border-border/20 bg-card/20 backdrop-blur-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Bot className="text-primary" />
            Ask a Follow-up Question
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            placeholder="e.g., How often should I apply the treatment?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isAsking}
          />
          <Button onClick={handleAskQuestion} disabled={!question || isAsking}>
            {isAsking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asking...
              </>
            ) : (
              "Ask AI"
            )}
          </Button>
        </CardContent>
      </Card>

      {isAsking && (
        <Card className="shadow-2xl shadow-black/20 border border-border/20 bg-card/20 backdrop-blur-xl rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating answer...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {answer && (
        <Card className="shadow-2xl shadow-black/20 border border-border/20 bg-card/20 backdrop-blur-xl rounded-3xl animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              AI Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );


  return (
    <section className="relative container mx-auto px-4 md:px-6 py-12 min-h-screen flex flex-col items-center justify-center">
       <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(https://picsum.photos/1920/1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-ai-hint="leaf macro"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/50 via-background to-background" />

        <div className="relative z-20 flex items-center justify-center w-full min-h-[calc(100vh-10rem)] max-w-5xl">
            {image ? renderAnalysisState() : renderInitialState()}
        </div>
    </section>
  );
}



    
