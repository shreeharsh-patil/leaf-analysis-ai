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

type PredictionResult = {
  name: string;
  confidence: number;
  summary: string;
  treatments: string[];
  isHealthy: boolean;
};

// Mock disease names similar to PlantVillage dataset
const DISEASES = [
  "Apple___Apple_scab",
  "Apple___Black_rot",
  "Corn_(maize)___Common_rust_",
  "Grape___Black_rot",
  "Potato___Early_blight",
  "Potato___Late_blight",
  "Tomato___Bacterial_spot",
  "Tomato___Leaf_Mold",
  "Healthy",
];

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
    setIsLoading(true);
    setPredictionResult(null);

    // Simulate model prediction delay
    setTimeout(async () => {
      try {
        // Mocked prediction
        const predictedDisease =
          DISEASES[Math.floor(Math.random() * DISEASES.length)];
        const confidence = Math.random() * (0.98 - 0.85) + 0.85;

        if (predictedDisease === "Healthy") {
          setPredictionResult({
            name: "Healthy",
            confidence,
            summary: "The leaf appears to be healthy.",
            treatments: [],
            isHealthy: true,
          });
        } else {
          const diseaseInfo = await getDiseaseInfo(predictedDisease);
          setPredictionResult({
            name: predictedDisease.replace(/___/g, " - ").replace(/_/g, " "),
            confidence,
            ...diseaseInfo,
            isHealthy: false,
          });
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not get disease information. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };
  
  const handleReset = () => {
      setImage(null);
      setPredictionResult(null);
      setIsLoading(false);
  }

  const renderInitialState = () => (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 border-2 border-dashed rounded-xl transition-colors duration-300",
        isDragging ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2 text-center">Upload Leaf Image</h2>
      <p className="text-muted-foreground mb-6 text-center">
        Drag & drop your image here, or click to browse.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleBrowseClick} size="lg">
          <UploadCloud className="mr-2 h-5 w-5" />
          Browse Files
        </Button>
        <Button onClick={handleBrowseClick} size="lg" variant="secondary">
          <Camera className="mr-2 h-5 w-5" />
          Use Camera
        </Button>
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
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square w-full max-w-lg mx-auto md:max-w-none rounded-xl overflow-hidden shadow-lg">
            {image && <Image src={image} alt="Uploaded leaf" layout="fill" objectFit="cover" />}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 text-white z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Analyzing leaf...</p>
                </div>
            )}
        </div>
        <div className="flex flex-col gap-6">
            {!predictionResult && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-card rounded-xl shadow-lg">
                    <Leaf className="w-16 h-16 text-primary" />
                    <h2 className="text-2xl font-bold">Ready to Analyze</h2>
                    <p className="text-muted-foreground text-center">Click the button below to start the AI-powered disease prediction.</p>
                    <Button onClick={handleAnalyze} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
        <Card className="shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl font-bold mb-2">
                            {predictionResult?.isHealthy ? 'Healthy' : predictionResult?.name}
                        </CardTitle>
                        <Badge variant={predictionResult?.isHealthy ? "default" : "destructive"} className="text-sm">
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
            <Card className="shadow-lg">
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
        <div className="flex items-center justify-center">
            {image ? renderAnalysisState() : renderInitialState()}
        </div>
    </section>
  );
}
