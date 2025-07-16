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
    <div className="min-h-screen wave-pattern">
      {/* Header */}
      <header className="pt-16 pb-8 px-6 text-center animate-fade-in">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Fish className="w-8 h-8 text-ocean-400 transform -rotate-12 floating-animation" />
          <h1 className="text-3xl font-bold gradient-text">Fish ID</h1>
        </div>
        <p className="text-ocean-300 text-sm">Welcome to your underwater world</p>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-slide-in">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Identify Fish Species
              <br />
              <span className="gradient-text">With AI Precision</span>
            </h2>
            <p className="text-ocean-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Upload any fish image and get instant, accurate species identification powered by advanced machine learning algorithms
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="modern-button text-white font-semibold px-8 py-3 rounded-xl shadow-glow-lg"
            >
              Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="modern-card text-center p-6 hover:scale-105 transition-transform duration-300">
              <CardContent className="pt-6">
                <Brain className="w-12 h-12 text-ocean-400 mx-auto mb-4 pulse-glow" />
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-ocean-200 text-sm">Advanced machine learning algorithms for precise species matching</p>
              </CardContent>
            </Card>
            
            <Card className="modern-card text-center p-6 hover:scale-105 transition-transform duration-300">
              <CardContent className="pt-6">
                <Search className="w-12 h-12 text-aqua-400 mx-auto mb-4 pulse-glow" />
                <h3 className="text-lg font-semibold text-white mb-2">High Accuracy</h3>
                <p className="text-ocean-200 text-sm">99%+ accuracy rate with thousands of fish species in our database</p>
              </CardContent>
            </Card>
            
            <Card className="modern-card text-center p-6 hover:scale-105 transition-transform duration-300">
              <CardContent className="pt-6">
                <Image className="w-12 h-12 text-ocean-400 mx-auto mb-4 pulse-glow" />
                <h3 className="text-lg font-semibold text-white mb-2">Batch Processing</h3>
                <p className="text-ocean-200 text-sm">Upload multiple images for comparison and analysis</p>
              </CardContent>
            </Card>
            
            <Card className="modern-card text-center p-6 hover:scale-105 transition-transform duration-300">
              <CardContent className="pt-6">
                <Smartphone className="w-12 h-12 text-aqua-400 mx-auto mb-4 pulse-glow" />
                <h3 className="text-lg font-semibold text-white mb-2">Mobile Ready</h3>
                <p className="text-ocean-200 text-sm">Optimized for mobile devices with offline capabilities</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center animate-fade-in">
            <Card className="modern-card p-8 shimmer">
              <CardContent>
                <h3 className="text-2xl font-semibold text-white mb-4">Ready to Explore?</h3>
                <p className="text-ocean-200 mb-6">Join thousands of marine enthusiasts and researchers using Fish ID for accurate species identification</p>
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="modern-button text-white font-semibold px-8 py-3 rounded-xl shadow-glow-lg"
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
        <p className="text-ocean-300 text-xs">Powered by advanced AI technology</p>
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
