import { Fish } from "lucide-react";

export default function Splash() {
  return (
    <div className="fixed inset-0 wave-pattern flex flex-col items-center justify-center z-50">
      <div className="modern-card p-8 text-center max-w-lg mx-4 animate-slide-in">
        {/* Fish ID Logo */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Fish className="w-16 h-16 text-ocean-400 transform -rotate-12 floating-animation pulse-glow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-aqua-400 rounded-full animate-ping"></div>
            </div>
            <div className="text-5xl font-bold gradient-text">Fish ID</div>
          </div>
          <div className="text-ocean-300 text-sm font-medium mt-2 tracking-wide shimmer">SPECIES IDENTIFICATION</div>
        </div>
        
        {/* Loading Animation */}
        <div className="flex space-x-2 justify-center mb-6">
          <div className="w-3 h-3 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-aqua-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-ocean-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-aqua-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
        </div>
        
        <p className="text-ocean-200 text-sm mb-4">Advanced AI-Powered Fish Recognition</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-ocean-800 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-ocean-400 via-aqua-400 to-ocean-500 h-full rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Enhanced Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 wave-pattern opacity-30"></div>
    </div>
  );
}
