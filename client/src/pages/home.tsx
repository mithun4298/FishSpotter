import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fish, Bell, User, Brain, Search, Image, Smartphone, Camera } from "lucide-react";
import { Link } from "wouter";
import type { FishIdentification } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fish identified successfully!",
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

  const handleFileUpload = (file: File) => {
    identifyFishMutation.mutate(file);
  };

  const handleBatchUpload = (files: File[]) => {
    identifyBatchMutation.mutate(files);
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
        {/* Quick Identify Link */}
        <div className="text-center mb-8">
          <Link href="/identify">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 text-lg">
              <Camera className="mr-3 h-6 w-6" />
              Quick Fish Identification
            </Button>
          </Link>
          <p className="text-blue-200 mt-2">Use our focused identification page for better camera capture</p>
        </div>

        {/* Upload Section */}
        <Card className="glass-morphism border-white/20 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Advanced Upload & Batch Processing</h2>
            
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
                <TabsTrigger value="single" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                  Single Image
                </TabsTrigger>
                <TabsTrigger value="batch" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                  Multiple Images
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="single">
                <FileUpload
                  mode="single"
                  onFileUpload={handleFileUpload}
                  isLoading={identifyFishMutation.isPending}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </TabsContent>
              
              <TabsContent value="batch">
                <FileUpload
                  mode="batch"
                  onBatchUpload={handleBatchUpload}
                  isLoading={identifyBatchMutation.isPending}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024} // 10MB
                  multiple={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Grid */}
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
                      {formatTimeAgo(identification.createdAt || "")}
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
