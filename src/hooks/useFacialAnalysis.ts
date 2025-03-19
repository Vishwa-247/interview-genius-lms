
import { useState, useEffect, useRef } from 'react';

// Mock facial expression analysis
// In a real app, you would integrate an ML model for facial analysis
const mockAnalyzeFacialExpression = (
  videoElement: HTMLVideoElement | null
): { confident: number; stressed: number; hesitant: number; nervous: number } => {
  // In a real implementation, you would:
  // 1. Capture a frame from the video
  // 2. Send it to an ML model API
  // 3. Get back facial expression probabilities
  
  // For demo purposes, we'll generate random values
  return {
    confident: Math.random() * 0.7 + 0.3, // Between 0.3 and 1.0
    stressed: Math.random() * 0.5,        // Between 0 and 0.5
    hesitant: Math.random() * 0.6,        // Between 0 and 0.6
    nervous: Math.random() * 0.4,         // Between 0 and 0.4
  };
};

const useFacialAnalysis = (
  isActive: boolean = false,
  interval: number = 3000
) => {
  const [facialData, setFacialData] = useState<{
    confident: number;
    stressed: number;
    hesitant: number;
    nervous: number;
  }>({
    confident: 0,
    stressed: 0,
    hesitant: 0,
    nervous: 0,
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisTimerRef = useRef<number | null>(null);
  const allAnalysisData = useRef<typeof facialData[]>([]);

  const startAnalysis = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Browser does not support getUserMedia');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsAnalyzing(true);
        
        // Start analyzing at intervals
        analysisTimerRef.current = window.setInterval(() => {
          const analysis = mockAnalyzeFacialExpression(videoRef.current);
          setFacialData(analysis);
          allAnalysisData.current.push(analysis);
        }, interval);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopAnalysis = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (analysisTimerRef.current) {
      clearInterval(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
    
    setIsAnalyzing(false);
  };

  const getAggregatedAnalysis = () => {
    if (allAnalysisData.current.length === 0) {
      return facialData;
    }
    
    // Calculate average values
    const sum = allAnalysisData.current.reduce(
      (acc, data) => ({
        confident: acc.confident + data.confident,
        stressed: acc.stressed + data.stressed,
        hesitant: acc.hesitant + data.hesitant,
        nervous: acc.nervous + data.nervous,
      }),
      { confident: 0, stressed: 0, hesitant: 0, nervous: 0 }
    );
    
    const count = allAnalysisData.current.length;
    
    return {
      confident: sum.confident / count,
      stressed: sum.stressed / count,
      hesitant: sum.hesitant / count,
      nervous: sum.nervous / count,
    };
  };

  useEffect(() => {
    if (isActive && !isAnalyzing) {
      startAnalysis();
    } else if (!isActive && isAnalyzing) {
      stopAnalysis();
    }
    
    return () => {
      stopAnalysis();
    };
  }, [isActive]);

  return {
    videoRef,
    facialData,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
    getAggregatedAnalysis,
  };
};

export default useFacialAnalysis;
