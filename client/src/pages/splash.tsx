import { Fish } from "lucide-react";

export default function Splash() {
  return (
    <div className="fixed inset-0 ocean-gradient flex flex-col items-center justify-center z-50">
      <div className="text-center animate-pulse">
        {/* Fish ID Logo */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Fish className="w-16 h-16 text-cyan-300 transform -rotate-12" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
            <div className="text-5xl font-bold text-white">Fish ID</div>
          </div>
          <div className="text-cyan-300 text-sm font-medium mt-2 tracking-wide">SPECIES IDENTIFICATION</div>
        </div>
        
        {/* Loading Animation */}
        <div className="flex space-x-2 justify-center mb-4">
          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        
        <p className="text-blue-200 text-sm">Advanced AI-Powered Fish Recognition</p>
      </div>
      
      {/* Ocean Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-32 wave-pattern"></div>
    </div>
  );
}
