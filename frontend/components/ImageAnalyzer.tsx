import React, { useState, useCallback } from 'react';
import type { FC, ChangeEvent, DragEvent } from 'react';
import { analyzeImageWithBackend, testBackendConnection } from '../services/api_simple';
import { generateImageReportPdf } from '../services/pdfGenerator';
import type { ImageAnalysisResult } from '../types';
import TrustScoreGauge from './common/TrustScoreGauge';
import ResultSection from './common/ResultSection';
import Spinner from './common/Spinner';

const ImageAnalyzer: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file (e.g., JPEG, PNG, WEBP).');
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
  };
  
  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!selectedFile) return;
    
    console.log('Starting image analysis...');
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // First test backend connection
      console.log('Testing backend connection...');
      const isConnected = await testBackendConnection();
      
      if (!isConnected) {
        throw new Error('Cannot connect to backend server. Please ensure it is running on port 8000.');
      }
      
      console.log('Backend connection successful, proceeding with analysis...');
      const analysisResult = await analyzeImageWithBackend(selectedFile);
      console.log('Analysis completed successfully:', analysisResult);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Image Analysis Error:', err);
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleDownloadReport = () => {
    if (result) {
      generateImageReportPdf(result);
    }
  };

  const getVerdictColor = (score: number) => {
    if (score > 70) return 'text-green-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-cyan-300">Image Inspector</h2>
      <p className="text-gray-400">Upload an image to perform a forensic analysis for signs of deepfake or AI generation. The system checks metadata, compression patterns, and visual artifacts.</p>
      
      <div 
        className={`p-6 bg-gray-800/50 rounded-lg border border-cyan-500/20 transition-all ${isDragging ? 'border-cyan-400 ring-2 ring-cyan-400' : ''}`}
        onDragEnter={handleDragEvents}
        onDragOver={handleDragEvents}
        onDragLeave={handleDragEvents}
        onDrop={handleDrop}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
             <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-gray-300">Upload Image</label>
             <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={onFileSelect} />
                </label>
            </div> 
          </div>

          {preview && (
            <div className="w-full md:w-1/3">
              <p className="block mb-2 text-sm font-medium text-gray-300">Preview</p>
              <img src={preview} alt="Selected file preview" className="w-full h-40 object-cover rounded-lg border border-gray-600" />
            </div>
          )}
        </div>
        
        {selectedFile && (
          <div className="mt-4 flex flex-col items-center">
             <p className="text-sm text-gray-400 mb-4">File: <span className="font-medium text-gray-200">{selectedFile.name}</span></p>
             <button
              onClick={handleAnalyzeClick}
              disabled={!selectedFile || isLoading}
              className="w-full md:w-1/2 px-8 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading && <Spinner />}
              <span>{isLoading ? 'Analyzing...' : 'Analyze Image'}</span>
            </button>
          </div>
        )}
      </div>

      {error && <div className="p-4 text-red-300 bg-red-800/30 rounded-lg">{error}</div>}

      {result && (
        <div className="space-y-6 animate-fadeIn">
          <ResultSection title="Analysis Report" onDownload={handleDownloadReport}>
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <TrustScoreGauge score={result.trustScore} />
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-200">Overall Verdict</h3>
                    <p className={`text-3xl font-bold ${getVerdictColor(result.trustScore)}`}>{result.verdict}</p>
                    <p className="mt-2 text-gray-400">This score reflects our confidence in the image's authenticity.</p>
                </div>
            </div>
          </ResultSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ResultSection title="Metadata (EXIF)">
                <ul className="text-sm space-y-2">
                    {result.analysis.metadata.map(item => <li key={item.name}><span className="font-semibold text-gray-300">{item.name}:</span> <span className="text-gray-400">{item.value}</span></li>)}
                </ul>
            </ResultSection>
            <ResultSection title="Compression Analysis">
                 <ul className="text-sm space-y-2">
                    {result.analysis.compression.map(item => <li key={item.name}><span className="font-semibold text-gray-300">{item.name}:</span> <span className="text-gray-400">{item.value}</span></li>)}
                </ul>
            </ResultSection>
            <ResultSection title="Detected Artifacts">
                <ul className="text-sm space-y-2 list-disc list-inside">
                    {result.analysis.artifacts.map((item, i) => <li key={i} className="text-gray-400">{item}</li>)}
                </ul>
            </ResultSection>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;