import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, Upload, Loader2, ArrowLeft, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface FishIdentificationResult {
  species: string;
  commonName: string;
  confidence: number;
  details: {
    description?: string;
    habitat?: string;
    size?: string;
    diet?: string;
    characteristics?: string[];
    conservationStatus?: string;
  };
}

export default function Identify() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<FishIdentificationResult | null>(null);
  const { toast } = useToast();

  const identifyFishMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await apiRequest("POST", "/api/identify-fish", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setIdentificationResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/fish-identifications"] });
      toast({
        title: "Fish Identified!",
        description: `Found: ${data.commonName}`,
      });
    },
    onError: (error) => {
      console.error("Fish identification error:", error);
      toast({
        title: "Identification Failed",
        description: "Please try again with a clearer image of the fish.",
        variant: "destructive",
      });
    },
  });

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Prefer rear camera
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelection(file);
      }
    };
    input.click();
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelection(file);
      }
    };
    input.click();
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Clear previous results
    setIdentificationResult(null);
  };

  const handleIdentify = () => {
    if (selectedFile) {
      identifyFishMutation.mutate(selectedFile);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    if (confidence >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
    return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 dark:from-ocean-900 dark:to-ocean-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation & Header */}
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-ocean-700 dark:text-ocean-300 hover:text-ocean-900 dark:hover:text-ocean-100">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center ml-4">
              <Fish className="w-6 h-6 text-cyan-600 transform -rotate-12 mr-2" />
              <span className="text-xl font-bold text-ocean-900 dark:text-ocean-100">Fish ID</span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-ocean-900 dark:text-ocean-100 mb-4">
              Fish Identification
            </h1>
            <p className="text-lg text-ocean-700 dark:text-ocean-300">
              Capture or upload a photo to identify fish species with AI precision
            </p>
          </div>

          {/* Photo Capture & Upload Section */}
          <div className="bg-white/80 dark:bg-ocean-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Button
                onClick={handleCameraCapture}
                size="lg"
                className="h-24 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl flex flex-col gap-2"
              >
                <Camera className="h-8 w-8" />
                <span className="text-lg font-semibold">Capture from Camera</span>
              </Button>

              <Button
                onClick={handleFileUpload}
                size="lg"
                variant="outline"
                className="h-24 border-2 border-ocean-300 hover:bg-ocean-50 dark:border-ocean-600 dark:hover:bg-ocean-800 rounded-xl flex flex-col gap-2"
              >
                <Upload className="h-8 w-8" />
                <span className="text-lg font-semibold">Upload Photo</span>
              </Button>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-6">
                <div className="relative mx-auto max-w-md">
                  <img
                    src={previewUrl}
                    alt="Fish preview"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div className="text-center mt-4">
                  <Button
                    onClick={handleIdentify}
                    disabled={identifyFishMutation.isPending}
                    className="bg-ocean-600 hover:bg-ocean-700 text-white px-8 py-2"
                  >
                    {identifyFishMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Identifying...
                      </>
                    ) : (
                      "Identify Fish"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            {identifyFishMutation.isPending && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
                <p className="mt-2 text-ocean-700 dark:text-ocean-300">
                  Processing your image with AI...
                </p>
              </div>
            )}
          </div>

          {/* Identification Results */}
          {identificationResult && (
            <div className="bg-white/80 dark:bg-ocean-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-ocean-900 dark:text-ocean-100 mb-2">
                  {identificationResult.commonName}
                </h2>
                <p className="text-lg text-ocean-600 dark:text-ocean-400 italic mb-4">
                  {identificationResult.species}
                </p>
                <Badge className={`text-lg px-4 py-2 ${getConfidenceColor(identificationResult.confidence)}`}>
                  {identificationResult.confidence}% Confidence
                </Badge>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="basic-info">
                  <AccordionTrigger className="text-left text-lg font-semibold text-ocean-900 dark:text-ocean-100">
                    Basic Information
                  </AccordionTrigger>
                  <AccordionContent className="text-ocean-700 dark:text-ocean-300 space-y-4">
                    {identificationResult.details.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p>{identificationResult.details.description}</p>
                      </div>
                    )}
                    {identificationResult.details.size && (
                      <div>
                        <h4 className="font-semibold mb-2">Size</h4>
                        <p>{identificationResult.details.size}</p>
                      </div>
                    )}
                    {identificationResult.details.characteristics && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Characteristics</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {identificationResult.details.characteristics.map((char, index) => (
                            <li key={index}>{char}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="habitat">
                  <AccordionTrigger className="text-left text-lg font-semibold text-ocean-900 dark:text-ocean-100">
                    Habitat & Distribution
                  </AccordionTrigger>
                  <AccordionContent className="text-ocean-700 dark:text-ocean-300">
                    <p>{identificationResult.details.habitat || "Habitat information not available."}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="diet">
                  <AccordionTrigger className="text-left text-lg font-semibold text-ocean-900 dark:text-ocean-100">
                    Diet & Behavior
                  </AccordionTrigger>
                  <AccordionContent className="text-ocean-700 dark:text-ocean-300">
                    <p>{identificationResult.details.diet || "Diet information not available."}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="conservation">
                  <AccordionTrigger className="text-left text-lg font-semibold text-ocean-900 dark:text-ocean-100">
                    Conservation Status
                  </AccordionTrigger>
                  <AccordionContent className="text-ocean-700 dark:text-ocean-300">
                    <p>{identificationResult.details.conservationStatus || "Conservation status information not available."}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}