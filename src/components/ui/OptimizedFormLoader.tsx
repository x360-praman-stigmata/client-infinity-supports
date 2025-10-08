"use client";

import { useState, useEffect } from 'react';

interface OptimizedFormLoaderProps {
  children: React.ReactNode;
  loadingText?: string;
  minLoadTime?: number; // Minimum loading time to prevent flash
}

export default function OptimizedFormLoader({ 
  children, 
  loadingText = "Loading Form",
  minLoadTime = 300 // Reduced from 800ms
}: OptimizedFormLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading with better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 50);

    // Complete loading after minimum time
    const loadingTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 100);
    }, minLoadTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(loadingTimer);
    };
  }, [minLoadTime]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center max-w-sm">
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Spinner */}
          <div className="w-12 h-12 border-3 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Text */}
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{loadingText}</h3>
          <p className="text-slate-600 text-sm">Please wait...</p>
          
          {/* Progress indicator */}
          <div className="mt-3 text-xs text-slate-500">
            {Math.round(progress)}% complete
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
