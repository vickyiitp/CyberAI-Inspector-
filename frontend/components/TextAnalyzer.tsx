import React, { useState, useCallback } from 'react';
import type { FC, ChangeEvent } from 'react';
import { analyzeTextWithBackend, testBackendConnection } from '../services/api_simple';
import { generateTextReportPdf } from '../services/pdfGenerator';
import type { TextAnalysisResult, GroundingSource } from '../types';
import Spinner from './common/Spinner';
import TrustScoreGauge from './common/TrustScoreGauge';
import ResultSection from './common/ResultSection';

const TextAnalyzer: FC = () => {
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextAnalysisResult | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!text.trim()) {
        setError('Please enter some text to analyze.');
        return;
    }
    
    console.log('Starting text analysis...');
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
      const analysisResult = await analyzeTextWithBackend(text);
      console.log('Analysis completed successfully:', analysisResult);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Text Analysis Error:', err);
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  const handleDownloadReport = () => {
    if (result) {
      generateTextReportPdf(result);
    }
  };

  const getVerdictColor = (score: number) => {
    if (score > 65) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-cyan-300">Text Verifier</h2>
      <p className="text-gray-400">Paste text to have our AI fact-checker analyze its claims. It uses Google Search to find and cite authoritative sources, providing a summary and credibility assessment.</p>
      
      <div className="p-6 bg-gray-800/50 rounded-lg border border-cyan-500/20">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <label htmlFor="text-input" className="block mb-2 text-sm font-medium text-gray-300">Text to Analyze</label>
            <textarea
              id="text-input"
              value={text}
              onChange={handleTextChange}
              rows={8}
              placeholder="Paste an article, social media post, or any text here..."
              className="block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyzeClick}
              disabled={!text || isLoading}
              className="w-full md:w-auto px-8 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading && <Spinner />}
              <span>{isLoading ? 'Analyzing...' : 'Verify Text'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-4 text-red-300 bg-red-800/30 rounded-lg">{error}</div>}

      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Trust Score Header */}
          <ResultSection title="Analysis Report" onDownload={handleDownloadReport}>
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <TrustScoreGauge score={result.trustScore} />
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-200">Overall Verdict</h3>
                    <p className={`text-3xl font-bold ${getVerdictColor(result.trustScore)}`}>{result.verdict}</p>
                    <p className="mt-2 text-gray-400">This score reflects our confidence based on cross-referencing with web sources.</p>
                </div>
            </div>
          </ResultSection>

          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultSection title="AI-Powered Summary">
              <p className="text-gray-300 whitespace-pre-wrap">{result.summary}</p>
            </ResultSection>
            <ResultSection title="Verified Sources">
              {result.sources.length > 0 ? (
                <ul className="space-y-3">
                  {result.sources.map((source, index) => (
                    <li key={index}>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-700/50 rounded-md hover:bg-gray-700 transition-colors">
                        <p className="font-semibold text-cyan-400 truncate">{source.web.title}</p>
                        <p className="text-xs text-gray-400 truncate">{source.web.uri}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No authoritative sources could be found to verify the claims in the provided text.</p>
              )}
            </ResultSection>
          </div>

          {/* Bias Analysis Section */}
          {result.biasAnalysis && !result.biasAnalysis.error && (
            <ResultSection title="📊 Bias & Sentiment Analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-blue-500/20">
                  <h5 className="font-medium text-blue-300 mb-2">Sentiment Distribution</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-400">Positive:</span>
                      <span className="font-semibold text-gray-200">{(result.biasAnalysis.vader_sentiment.pos * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Neutral:</span>
                      <span className="font-semibold text-gray-200">{(result.biasAnalysis.vader_sentiment.neu * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Negative:</span>
                      <span className="font-semibold text-gray-200">{(result.biasAnalysis.vader_sentiment.neg * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2">
                      <span className="text-gray-300">Compound:</span>
                      <span className="font-bold text-cyan-400">{result.biasAnalysis.vader_sentiment.compound.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4 border border-yellow-500/20">
                  <h5 className="font-medium text-yellow-300 mb-2">Bias Indicators</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Extreme Language:</span>
                      <span className={`font-semibold ${result.biasAnalysis.bias_scores.extreme_positive > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(result.biasAnalysis.bias_scores.extreme_positive * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Emotional Triggers:</span>
                      <span className={`font-semibold ${result.biasAnalysis.bias_scores.emotional_triggers > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(result.biasAnalysis.bias_scores.emotional_triggers * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Authority Appeals:</span>
                      <span className={`font-semibold ${result.biasAnalysis.bias_scores.authority_appeals > 0.5 ? 'text-orange-400' : 'text-green-400'}`}>
                        {(result.biasAnalysis.bias_scores.authority_appeals * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-purple-500/20">
                  <h5 className="font-medium text-purple-300 mb-2">Overall Assessment</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Polarity:</span>
                      <span className="font-semibold text-gray-200">{result.biasAnalysis.polarity.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Subjectivity:</span>
                      <span className="font-semibold text-gray-200">{result.biasAnalysis.subjectivity.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Emotional Manipulation:</span>
                      <span className={`font-semibold ${result.biasAnalysis.emotional_manipulation > 0.6 ? 'text-red-400' : result.biasAnalysis.emotional_manipulation > 0.3 ? 'text-orange-400' : 'text-green-400'}`}>
                        {(result.biasAnalysis.emotional_manipulation * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2">
                      <span className="text-gray-300">Bias Level:</span>
                      <span className={`font-bold capitalize ${result.biasAnalysis.overall_bias === 'high' ? 'text-red-400' : result.biasAnalysis.overall_bias === 'moderate' ? 'text-orange-400' : 'text-green-400'}`}>
                        {result.biasAnalysis.overall_bias}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ResultSection>
          )}

          {/* Quality Analysis Section */}
          {result.qualityAnalysis && !result.qualityAnalysis.error && (
            <ResultSection title="📝 Text Quality & Readability">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-green-500/20">
                  <h5 className="font-medium text-green-300 mb-2">Readability Scores</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Flesch Reading Ease:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.flesch_reading_ease.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Flesch-Kincaid Grade:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.flesch_kincaid_grade.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gunning Fog:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.gunning_fog.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Auto Readability:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.automated_readability.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4 border border-blue-500/20">
                  <h5 className="font-medium text-blue-300 mb-2">Text Statistics</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Word Count:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.word_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sentences:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.sentence_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Sentence Length:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.avg_sentence_length.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Lexical Diversity:</span>
                      <span className="font-semibold text-gray-200">{result.qualityAnalysis.lexical_diversity.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 border border-indigo-500/20">
                  <h5 className="font-medium text-indigo-300 mb-2">Overall Quality</h5>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-400 mb-2">
                      {(result.qualityAnalysis.quality_score * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-gray-400">Quality Score</p>
                  </div>
                </div>
              </div>
            </ResultSection>
          )}

          {/* AI Analysis Section */}
          {result.aiAnalysis && !result.aiAnalysis.error && (
            <ResultSection title="🤖 AI-Generated Content Detection">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-red-500/20">
                  <h5 className="font-medium text-red-300 mb-2">AI Detection Indicators</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Repetitive Patterns:</span>
                      <span className={`font-semibold ${result.aiAnalysis.repetitive_patterns > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(result.aiAnalysis.repetitive_patterns * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Unnatural Flow:</span>
                      <span className={`font-semibold ${result.aiAnalysis.unnatural_flow > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(result.aiAnalysis.unnatural_flow * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Generic Language:</span>
                      <span className={`font-semibold ${result.aiAnalysis.generic_language > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(result.aiAnalysis.generic_language * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Perfect Grammar:</span>
                      <span className={`font-semibold ${result.aiAnalysis.perfect_grammar > 0.8 ? 'text-orange-400' : 'text-green-400'}`}>
                        {(result.aiAnalysis.perfect_grammar * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4 border border-orange-500/20">
                  <h5 className="font-medium text-orange-300 mb-2">AI Likelihood Assessment</h5>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${result.aiAnalysis.ai_likelihood > 0.7 ? 'text-red-400' : result.aiAnalysis.ai_likelihood > 0.4 ? 'text-orange-400' : 'text-green-400'}`}>
                      {(result.aiAnalysis.ai_likelihood * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-gray-400">Likelihood of AI Generation</p>
                    <p className={`text-xs mt-2 font-medium ${result.aiAnalysis.ai_likelihood > 0.7 ? 'text-red-400' : result.aiAnalysis.ai_likelihood > 0.4 ? 'text-orange-400' : 'text-green-400'}`}>
                      {result.aiAnalysis.ai_likelihood > 0.7 ? 'Likely AI-Generated' : result.aiAnalysis.ai_likelihood > 0.4 ? 'Possibly AI-Generated' : 'Likely Human-Written'}
                    </p>
                  </div>
                </div>
              </div>
            </ResultSection>
          )}

          {/* Facts Analysis Section */}
          {result.factsAnalysis && !result.factsAnalysis.error && (
            <ResultSection title="✅ Fact Verification">
              <div className="mb-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-500/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-300">Fact Check Score:</span>
                    <span className={`text-2xl font-bold ${result.factsAnalysis.fact_check_score > 0.7 ? 'text-green-400' : result.factsAnalysis.fact_check_score > 0.4 ? 'text-orange-400' : 'text-red-400'}`}>
                      {(result.factsAnalysis.fact_check_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.factsAnalysis.verified_facts.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-green-500/20">
                    <h5 className="font-medium text-green-300 mb-3">✅ Verified Facts ({result.factsAnalysis.verified_facts.length})</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.factsAnalysis.verified_facts.map((fact, index) => (
                        <div key={index} className="bg-gray-800/50 rounded p-2 border border-green-500/30">
                          <p className="text-sm text-gray-200">{fact.statement}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-green-400">Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                            <span className="text-xs text-gray-400">{fact.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.factsAnalysis.contradicted_facts.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-red-500/20">
                    <h5 className="font-medium text-red-300 mb-3">❌ Contradicted Facts ({result.factsAnalysis.contradicted_facts.length})</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.factsAnalysis.contradicted_facts.map((fact, index) => (
                        <div key={index} className="bg-gray-800/50 rounded p-2 border border-red-500/30">
                          <p className="text-sm text-gray-200">{fact.statement}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-red-400">Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                            <span className="text-xs text-gray-400">{fact.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ResultSection>
          )}

          {/* Claims Analysis Section */}
          {result.claimsAnalysis && !result.claimsAnalysis.error && result.claimsAnalysis.claims.length > 0 && (
            <ResultSection title="🔍 Claims Analysis">
              <div className="mb-4">
                <p className="text-gray-400">Total Claims Identified: <span className="font-semibold text-cyan-400">{result.claimsAnalysis.total_claims}</span></p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {result.claimsAnalysis.claims.map((claim, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-blue-500/20">
                    <p className="text-gray-200 mb-2">{claim.claim}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded ${claim.type === 'factual' ? 'bg-green-600/20 text-green-400' : claim.type === 'opinion' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-gray-600/20 text-gray-400'}`}>
                        {claim.type}
                      </span>
                      <span className="text-xs text-blue-400">Confidence: {(claim.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {result.claimsAnalysis.key_phrases.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-300 mb-2">Key Phrases:</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.claimsAnalysis.key_phrases.slice(0, 10).map((phrase, index) => (
                      <span key={index} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </ResultSection>
          )}

          {/* Semantic Analysis Section */}
          {result.semanticAnalysis && !result.semanticAnalysis.error && (
            <ResultSection title="🧠 Semantic Analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-purple-500/20">
                  <h5 className="font-medium text-purple-300 mb-2">Similarity Score</h5>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {(result.semanticAnalysis.similarity_score * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-400">Content Coherence</p>
                  </div>
                </div>

                {result.semanticAnalysis.patterns.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-purple-500/20">
                    <h5 className="font-medium text-purple-300 mb-2">Semantic Patterns</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {result.semanticAnalysis.patterns.slice(0, 5).map((pattern, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-300 truncate">{pattern.pattern}</span>
                          <span className="text-xs text-purple-400 ml-2">{(pattern.similarity * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
};

export default TextAnalyzer;
