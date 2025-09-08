"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Camera,
  Loader2,
  Leaf,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  X,
  Info
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
import { getDiseaseInfo } from "@/app/actions";
import { cn } from "@/lib/utils";
import { analyzeImage } from "@/ai/flows/analyze-image-flow";

type PredictionResult = {
  name: string;
  confidence: number;
  summary: string;
  treatments: string[];
  isHealthy: boolean;
};

export default function LeafyAiClient() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setPredictionResult(null);
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
      const diseaseName = result.identification.commonName;

      if (isHealthy) {
        setPredictionResult({
          name: "Healthy",
          confidence: result.diagnosis.confidence,
          summary: "The leaf appears to be healthy.",
          treatments: [],
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
  
  const handleReset = () => {
      setImage(null);
      setPredictionResult(null);
      setIsLoading(false);
  }

  const renderInitialState = () => (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 border-2 border-dashed rounded-xl transition-all duration-300",
        isDragging ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleBrowseClick}
    >
      <div className="text-center cursor-pointer">
        <UploadCloud className="w-16 h-16 text-muted-foreground mx-auto mb-4 transition-transform group-hover:scale-110" />
        <h2 className="text-2xl font-bold mb-2">Tap here or drop a leaf photo</h2>
        <p className="text-muted-foreground mb-6">
          Upload an image to get an AI-powered analysis of your plant's health.
        </p>
      </div>
       <p className="text-xs text-muted-foreground/50 mt-4 text-center">
        Disclaimer: This tool is for informational purposes only and is not a substitute for professional advice.
      </p>
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
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square w-full max-w-lg mx-auto md:max-w-none rounded-xl overflow-hidden shadow-lg border border-border">
            {image && <Image src={image} alt="Uploaded leaf" layout="fill" objectFit="cover" />}
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 text-foreground z-10 backdrop-blur-sm">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Analyzing leaf...</p>
                </div>
            )}
        </div>
        <div className="flex flex-col gap-6">
            {!predictionResult && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-card rounded-xl shadow-lg border border-border">
                    <Leaf className="w-16 h-16 text-primary" />
                    <h2 className="text-2xl font-bold">Ready to Analyze</h2>
                    <p className="text-muted-foreground text-center">Click the button below to start the AI-powered disease prediction.</p>
                    <Button onClick={handleAnalyze} size="lg">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Analyze Leaf
                    </Button>
                </div>
            )}
            {predictionResult && renderResults()}
        </div>
    </div>
  );

  const renderResults = () => (
      <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500">
        <Card className="shadow-lg border border-border">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-bold mb-2">
                            {predictionResult?.isHealthy ? 'Healthy' : predictionResult?.name}
                        </CardTitle>
                        <Badge variant={predictionResult?.isHealthy ? "default" : "destructive"} className="text-sm bg-opacity-20 text-opacity-100 border-opacity-30">
                            {predictionResult?.isHealthy ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Info className="mr-2 h-4 w-4" />}
                            {((predictionResult?.confidence ?? 0) * 100).toFixed(1)}% Confidence
                        </Badge>
                    </div>
                     <Button onClick={handleReset} variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{predictionResult?.summary}</p>
            </CardContent>
        </Card>

        {!predictionResult?.isHealthy && predictionResult?.treatments && predictionResult?.treatments.length > 0 && (
            <Card className="shadow-lg border border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="text-primary"/>
                        Suggested Treatments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {predictionResult?.treatments.map((treatment, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>Treatment #{index + 1}</AccordionTrigger>
                                <AccordionContent className="text-base">
                                    {treatment}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}
      </div>
  )

  return (
    <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
            {image ? renderAnalysisState() : renderInitialState()}
        </div>
    </section>
  );
}
