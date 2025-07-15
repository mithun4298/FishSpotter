import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Fish, Brain, Search, Image, Smartphone } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useLocation } from "wouter";

/**
 * Landing Page Component
 * 
 * Modern landing page with modal authentication system.
 * Features beautiful ocean gradient background, feature showcase,
 * and seamless authentication modal integration.
 */
export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    // Redirect to home page after successful authentication
    setLocation("/");
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Header */}
      <header className="pt-16 pb-8 px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Fish className="w-8 h-8 text-cyan-300 transform -rotate-12" />
          <h1 className="text-3xl font-bold text-white">Fish ID</h1>
        </div>
        <p className="text-blue-200 text-sm">Welcome to your underwater world</p>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Identify Fish Species
              <br />
              <span className="text-cyan-300">With AI Precision</span>
            </h2>
            <p className="text-blue-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Upload any fish image and get instant, accurate species identification powered by advanced machine learning algorithms
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Brain className="w-12 h-12 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-blue-200 text-sm">Advanced machine learning algorithms for precise species matching</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Search className="w-12 h-12 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">High Accuracy</h3>
                <p className="text-blue-200 text-sm">99%+ accuracy rate with thousands of fish species in our database</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Image className="w-12 h-12 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Batch Processing</h3>
                <p className="text-blue-200 text-sm">Upload multiple images for comparison and analysis</p>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism border-white/20 text-center p-6">
              <CardContent className="pt-6">
                <Smartphone className="w-12 h-12 text-cyan-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Mobile Ready</h3>
                <p className="text-blue-200 text-sm">Optimized for mobile devices with offline capabilities</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="glass-morphism border-white/20 p-8">
              <CardContent>
                <h3 className="text-2xl font-semibold text-white mb-4">Ready to Explore?</h3>
                <p className="text-blue-200 mb-6">Join thousands of marine enthusiasts and researchers using Fish ID for accurate species identification</p>
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Identifying Fish
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-blue-300 text-xs">Powered by advanced AI technology</p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
