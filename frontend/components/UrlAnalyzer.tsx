import React, { useState, useCallback } from 'react';
import type { FC, ChangeEvent } from 'react';
import { analyzeUrlWithBackend, testBackendConnection } from '../services/api_simple';
import { generateUrlReportPdf } from '../services/pdfGenerator';
import type { UrlAnalysisResult } from '../types';
import TrustScoreGauge from './common/TrustScoreGauge';
import ResultSection from './common/ResultSection';
import Spinner from './common/Spinner';

const UrlAnalyzer: FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      // Use a more robust regex to check for protocol
      const pattern = new RegExp('^(https?|ftp)://', 'i');
      if (!pattern.test(urlString)) return false;
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!url.trim()) {
        setError('Please enter a URL to analyze.');
        return;
    }
    if (!isValidUrl(url)) {
        setError('Please enter a valid URL including http:// or https://');
        return;
    }
    
    console.log('Starting URL analysis...');
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
      const analysisResult = await analyzeUrlWithBackend(url);
      console.log('Analysis completed successfully:', analysisResult);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('URL Analysis Error:', err);
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const handleDownloadReport = () => {
    if (result) {
      generateUrlReportPdf(result);
    }
  };

  const getVerdictColor = (score: number) => {
    if (score > 70) return 'text-green-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-cyan-300">URL Analyzer</h2>
      <p className="text-gray-400">Enter a website URL to assess its credibility. This tool examines domain registration details, SSL certificate validity, and other technical markers of trust.</p>
      
      <div className="p-6 bg-gray-800/50 rounded-lg border border-cyan-500/20">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="url-input" className="block mb-2 text-sm font-medium text-gray-300">Website URL</label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div className="w-full md:w-auto">
            <button
              onClick={handleAnalyzeClick}
              disabled={!url || isLoading}
              className="w-full px-8 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
               {isLoading && <Spinner />}
              <span>{isLoading ? 'Analyzing...' : 'Analyze URL'}</span>
            </button>
          </div>
        </div>
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
                    <p className="mt-2 text-gray-400">This score reflects our confidence in the site's technical credibility.</p>
                </div>
            </div>
          </ResultSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultSection title="Domain Information">
                <ul className="text-sm space-y-2">
                    {result.domainInfo.map(item => <li key={item.name}><span className="font-semibold text-gray-300">{item.name}:</span> <span className="text-gray-400">{String(item.value)}</span></li>)}
                </ul>
            </ResultSection>
            <ResultSection title="SSL/TLS Certificate">
                 <ul className="text-sm space-y-2">
                    {result.sslInfo.map(item => <li key={item.name}><span className="font-semibold text-gray-300">{item.name}:</span> <span className="text-gray-400">{item.value}</span></li>)}
                </ul>
            </ResultSection>
          </div>

          {/* Enhanced Security Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.securityHeaders && !result.securityHeaders.error && (
              <ResultSection title="Security Headers">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Security Score:</span>
                    <span className={`text-sm font-bold ${result.securityHeaders.security_score > 60 ? 'text-green-400' : result.securityHeaders.security_score > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.securityHeaders.security_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-2 ${result.securityHeaders.hsts ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.securityHeaders.hsts ? '✓' : '✗'}</span>
                      <span>HSTS</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.securityHeaders.xss_protection ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.securityHeaders.xss_protection ? '✓' : '✗'}</span>
                      <span>XSS Protection</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.securityHeaders.content_type_options ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.securityHeaders.content_type_options ? '✓' : '✗'}</span>
                      <span>Content Type</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.securityHeaders.frame_options ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.securityHeaders.frame_options ? '✓' : '✗'}</span>
                      <span>Frame Options</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.securityHeaders.csp ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.securityHeaders.csp ? '✓' : '✗'}</span>
                      <span>CSP</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.securityHeaders.referrer_policy ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.securityHeaders.referrer_policy ? '✓' : '✗'}</span>
                      <span>Referrer Policy</span>
                    </div>
                  </div>
                </div>
              </ResultSection>
            )}

            {result.dnsSecurity && !result.dnsSecurity.error && (
              <ResultSection title="DNS Security">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">DNS Security Score:</span>
                    <span className={`text-sm font-bold ${result.dnsSecurity.security_score > 50 ? 'text-green-400' : result.dnsSecurity.security_score > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.dnsSecurity.security_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-2 ${result.dnsSecurity.spf_record ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.dnsSecurity.spf_record ? '✓' : '✗'}</span>
                      <span>SPF Record</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.dnsSecurity.dmarc_record ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.dnsSecurity.dmarc_record ? '✓' : '✗'}</span>
                      <span>DMARC Record</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.dnsSecurity.dnssec ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{result.dnsSecurity.dnssec ? '✓' : '✗'}</span>
                      <span>DNSSEC</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <span>📧</span>
                      <span>{result.dnsSecurity.mx_records} MX Records</span>
                    </div>
                  </div>
                </div>
              </ResultSection>
            )}

            {result.privacyInfo && !result.privacyInfo.error && (
              <ResultSection title="Privacy & Data Protection">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Privacy Policy:</span>
                    <span className={result.privacyInfo.has_privacy_policy ? 'text-green-400' : 'text-red-400'}>
                      {result.privacyInfo.has_privacy_policy ? 'Available' : 'Not Found'}
                    </span>
                  </div>
                  {result.privacyInfo.policy_url && (
                    <div className="text-xs text-gray-500 truncate">
                      <a href={result.privacyInfo.policy_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                        {result.privacyInfo.policy_url}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-300">Data Collection:</span>
                    <span className="text-gray-400 text-xs">{result.privacyInfo.data_collection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Third Party Sharing:</span>
                    <span className="text-gray-400 text-xs">{result.privacyInfo.third_party_sharing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cookie Usage:</span>
                    <span className="text-gray-400 text-xs">{result.privacyInfo.cookie_usage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">User Rights:</span>
                    <span className="text-gray-400 text-xs">{result.privacyInfo.user_rights}</span>
                  </div>
                </div>
              </ResultSection>
            )}

            {result.trackingInfo && !result.trackingInfo.error && (
              <ResultSection title="Cookies & Tracking">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Privacy Score:</span>
                    <span className={`text-sm font-bold ${result.trackingInfo.privacy_score > 70 ? 'text-green-400' : result.trackingInfo.privacy_score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.trackingInfo.privacy_score}/100
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Cookies:</span>
                      <span className="text-gray-400">{result.trackingInfo.total_cookies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tracking Scripts:</span>
                      <span className="text-gray-400">{result.trackingInfo.tracking_scripts}</span>
                    </div>
                    {result.trackingInfo.analytics_detected.length > 0 && (
                      <div>
                        <span className="text-gray-300 text-xs">Analytics Detected:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {result.trackingInfo.analytics_detected.map((tracker, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">
                              {tracker}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ResultSection>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultSection title="Backlink Profile">
                 <div className="text-sm space-y-2">
                    <p><span className="font-semibold text-gray-300">Total Backlinks:</span> <span className="text-gray-400">{result.backlinkProfile.total}</span></p>
                    <p><span className="font-semibold text-gray-300">Reputable Backlinks:</span> <span className="text-gray-400">{result.backlinkProfile.reputable}</span></p>
                    <p className="text-xs text-gray-500 pt-2">A low number of reputable backlinks can be a sign of a new or untrustworthy site.</p>
                 </div>
            </ResultSection>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlAnalyzer;