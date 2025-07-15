import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Fish, Bell, User, Brain, Search, Image, Smartphone, Camera, Upload, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FishIdentification } from "@shared/schema";

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

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<FishIdentificationResult | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [sourceMode, setSourceMode] = useState<'camera' | 'gallery'>('gallery');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch fish identifications
  const { data: identifications, isLoading: isLoadingIdentifications } = useQuery<FishIdentification[]>({
    queryKey: ["/api/fish-identifications"],
    enabled: isAuthenticated,
  });

  // Fish identification mutations
  const identifyFishMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await apiRequest("POST", "/api/identify-fish", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setIdentificationResult(data);
      toast({
        title: "Fish Identified!",
        description: `Found: ${data.commonName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fish-identifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to identify fish. Please try again.",
        variant: "destructive",
      });
    },
  });

  const identifyBatchMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("images", file);
      });
      
      const response = await apiRequest("POST", "/api/identify-fish-batch", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setBatchResults(data);
      setShowBatchDetails(true);
      toast({
        title: "Batch Processing Complete",
        description: `Successfully identified ${data.processedCount} out of ${data.totalFiles} fish images.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fish-identifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to process batch identification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.multiple = true;
    input.capture = "environment"; // Prefer rear camera
    input.setAttribute("accept", "image/jpeg,image/png,image/webp");
    input.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        // Validate file sizes (10MB max each)
        const validFiles = files.filter(file => {
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "File too large",
              description: `${file.name} exceeds 10MB limit`,
              variant: "destructive",
            });
            return false;
          }
          return true;
        });
        
        if (validFiles.length === 1) {
          handleSingleFileSelection(validFiles[0]);
        } else if (validFiles.length > 1) {
          handleBatchUpload(validFiles);
        }
      }
    };
    input.click();
  };

  const handleGalleryUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.multiple = true;
    input.onchange = (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        // Validate file sizes (10MB max each)
        const validFiles = files.filter(file => {
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "File too large",
              description: `${file.name} exceeds 10MB limit`,
              variant: "destructive",
            });
            return false;
          }
          return true;
        });
        
        if (validFiles.length === 1) {
          handleSingleFileSelection(validFiles[0]);
        } else if (validFiles.length > 1) {
          handleBatchUpload(validFiles);
        }
      }
    };
    input.click();
  };

  const handleSingleFileSelection = (file: File) => {
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Clear previous results
    setIdentificationResult(null);
    setBatchResults(null);
    setShowBatchDetails(false);
    
    // Automatically identify the fish
    identifyFishMutation.mutate(file);
  };

  const handleBatchUpload = (files: File[]) => {
    // Clear single file results
    setSelectedFile(null);
    setPreviewUrl(null);
    setIdentificationResult(null);
    
    identifyBatchMutation.mutate(files);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    if (confidence >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
    return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return <div className="min-h-screen ocean-gradient flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="glass-morphism border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Fish className="w-6 h-6 text-cyan-300 transform -rotate-12" />
              <h1 className="text-xl font-bold text-white">Fish ID</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-blue-200">
                    {user?.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-white/20 text-blue-200 hover:text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Fish Identification Section */}
        <Card className="glass-morphism border-white/20 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Fish Identification</h2>
            
            {/* Dual Source Selector */}
            <div className="flex gap-4 mb-8 max-w-md mx-auto">
              <Button
                onClick={() => setSourceMode('camera')}
                variant={sourceMode === 'camera' ? 'default' : 'outline'}
                className={`flex-1 h-12 rounded-xl font-semibold ${
                  sourceMode === 'camera' 
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                    : 'border-2 border-white/30 hover:bg-white/10 text-white bg-transparent'
                }`}
              >
                <Camera className="h-5 w-5 mr-2" />
                Capture from Camera
              </Button>

              <Button
                onClick={() => setSourceMode('gallery')}
                variant={sourceMode === 'gallery' ? 'default' : 'outline'}
                className={`flex-1 h-12 rounded-xl font-semibold ${
                  sourceMode === 'gallery' 
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                    : 'border-2 border-white/30 hover:bg-white/10 text-white bg-transparent'
                }`}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload from Gallery
              </Button>
            </div>

            {/* Single File Input Area */}
            <div className="mb-8">
              <Button
                onClick={sourceMode === 'camera' ? handleCameraCapture : handleGalleryUpload}
                size="lg"
                className="w-full h-32 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl flex flex-col gap-3 border-2 border-dashed border-white/30"
              >
                {sourceMode === 'camera' ? (
                  <>
                    <Camera className="h-12 w-12" />
                    <div className="text-center">
                      <div className="text-xl font-bold">Take Photo</div>
                      <div className="text-sm opacity-90">JPEG, PNG, WebP • Max 10MB each • Multiple photos supported</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12" />
                    <div className="text-center">
                      <div className="text-xl font-bold">Choose Files</div>
                      <div className="text-sm opacity-90">JPEG, PNG, WebP • Max 10MB each • Multiple photos supported</div>
                    </div>
                  </>
                )}
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
              </div>
            )}

            {/* Progress Indicator */}
            {identifyFishMutation.isPending && (
              <div className="text-center mb-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                <p className="mt-2 text-blue-200">
                  Processing your image with AI...
                </p>
              </div>
            )}

            {/* Identification Results */}
            {identificationResult && (
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {identificationResult.commonName}
                  </h3>
                  <p className="text-lg text-blue-200 italic mb-4">
                    {identificationResult.species}
                  </p>
                  <Badge className={`text-lg px-4 py-2 ${getConfidenceColor(identificationResult.confidence)}`}>
                    {identificationResult.confidence}% Confidence
                  </Badge>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="basic-info" className="border-white/20">
                    <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-cyan-300">
                      Basic Information
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200 space-y-4">
                      {identificationResult.details.description && (
                        <div>
                          <h4 className="font-semibold mb-2 text-white">Description</h4>
                          <p>{identificationResult.details.description}</p>
                        </div>
                      )}
                      {identificationResult.details.size && (
                        <div>
                          <h4 className="font-semibold mb-2 text-white">Size</h4>
                          <p>{identificationResult.details.size}</p>
                        </div>
                      )}
                      {identificationResult.details.characteristics && (
                        <div>
                          <h4 className="font-semibold mb-2 text-white">Key Characteristics</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {identificationResult.details.characteristics.map((char, index) => (
                              <li key={index}>{char}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="habitat" className="border-white/20">
                    <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-cyan-300">
                      Habitat & Distribution
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <p>{identificationResult.details.habitat || "Habitat information not available."}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="diet" className="border-white/20">
                    <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-cyan-300">
                      Diet & Behavior
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <p>{identificationResult.details.diet || "Diet information not available."}</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="conservation" className="border-white/20">
                    <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-cyan-300">
                      Conservation Status
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <p>{identificationResult.details.conservationStatus || "Conservation status information not available."}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Batch Processing Results */}
            {batchResults && showBatchDetails && (
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    Batch Processing Results
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBatchDetails(false)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-300">{batchResults.processedCount}</div>
                    <div className="text-green-200 text-sm">Successfully Processed</div>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-300">{batchResults.errorCount}</div>
                    <div className="text-red-200 text-sm">Failed to Process</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-300">{batchResults.totalFiles}</div>
                    <div className="text-blue-200 text-sm">Total Files</div>
                  </div>
                </div>

                {/* Successful Results */}
                {batchResults.results && batchResults.results.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Successfully Identified</h4>
                    <div className="space-y-3">
                      {batchResults.results.map((result: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-green-400/30">
                          <div className="flex items-start space-x-4">
                            <img 
                              src={result.imageUrl} 
                              alt={result.commonName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-white font-medium">{result.commonName}</h5>
                                <Badge className={`${getConfidenceColor(parseFloat(result.confidence))}`}>
                                  {result.confidence}% Confidence
                                </Badge>
                              </div>
                              <p className="text-blue-200 text-sm italic mb-2">{result.species}</p>
                              <p className="text-xs text-gray-300">File: {result.originalName}</p>
                              {result.details && (
                                <p className="text-blue-200 text-sm mt-2 line-clamp-2">
                                  {result.details.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Results */}
                {batchResults.errors && batchResults.errors.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Failed to Process</h4>
                    <div className="space-y-2">
                      {batchResults.errors.map((error: any, index: number) => (
                        <div key={index} className="bg-red-500/10 rounded-lg p-3 border border-red-400/30">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-sm">{error.originalName}</span>
                            <span className="text-red-300 text-xs">{error.error}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid - Only show when not authenticated */}
        {!isAuthenticated && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Brain className="w-8 h-8 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-blue-200 text-sm">Advanced machine learning algorithms for precise species matching</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Search className="w-8 h-8 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">High Accuracy</h3>
                <p className="text-blue-200 text-sm">99%+ accuracy rate with thousands of fish species in our database</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Image className="w-8 h-8 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Batch Processing</h3>
                <p className="text-blue-200 text-sm">Upload multiple images for comparison and analysis</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Smartphone className="w-8 h-8 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Mobile Ready</h3>
                <p className="text-blue-200 text-sm">Optimized for mobile devices with offline capabilities</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Identifications */}
        <Card className="glass-morphism border-white/20">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Identifications</h3>
            
            {isLoadingIdentifications ? (
              <div className="text-center py-8">
                <div className="text-blue-200">Loading identifications...</div>
              </div>
            ) : !identifications || identifications.length === 0 ? (
              <div className="text-center py-8">
                <Fish className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <h4 className="text-white font-medium mb-2">No identifications yet</h4>
                <p className="text-blue-200 text-sm">Upload your first fish image to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {identifications.slice(0, 5).map((identification) => (
                  <div key={identification.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <img 
                      src={identification.imageUrl} 
                      alt={identification.commonName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{identification.species}</h4>
                      <p className="text-blue-200 text-sm">{identification.commonName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          parseFloat(identification.confidence) >= 90 
                            ? "bg-emerald-400" 
                            : parseFloat(identification.confidence) >= 70 
                            ? "bg-yellow-400" 
                            : "bg-red-400"
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          parseFloat(identification.confidence) >= 90 
                            ? "text-emerald-400" 
                            : parseFloat(identification.confidence) >= 70 
                            ? "text-yellow-400" 
                            : "text-red-400"
                        }`}>
                          {identification.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <span className="text-blue-300 text-sm">
                      {formatTimeAgo(identification.createdAt ? identification.createdAt.toString() : "")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
