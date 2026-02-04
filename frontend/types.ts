export type ActiveModule = 'home' | 'image' | 'url' | 'text';

export interface ImageAnalysisResult {
  trustScore: number;
  verdict: string;
  analysis: {
    metadata: { name: string; value: string }[];
    compression: { name: string; value: string }[];
    artifacts: string[];
  };
}

export interface UrlAnalysisResult {
  trustScore: number;
  verdict: string;
  domainInfo: { name: string; value: string | number }[];
  sslInfo: { name: string; value: string }[];
  backlinkProfile: { total: number; reputable: number };
  privacyInfo?: {
    has_privacy_policy: boolean;
    policy_url?: string;
    data_collection: string;
    third_party_sharing: string;
    cookie_usage: string;
    user_rights: string;
    error?: string;
  };
  securityHeaders?: {
    hsts: boolean;
    xss_protection: boolean;
    content_type_options: boolean;
    frame_options: boolean;
    csp: boolean;
    referrer_policy: boolean;
    security_score: number;
    error?: string;
  };
  dnsSecurity?: {
    spf_record: boolean;
    dmarc_record: boolean;
    dkim_record: boolean;
    dnssec: boolean;
    mx_records: number;
    security_score: number;
    error?: string;
  };
  trackingInfo?: {
    total_cookies: number;
    third_party_cookies: number;
    tracking_scripts: number;
    analytics_detected: string[];
    advertising_detected: string[];
    privacy_score: number;
    error?: string;
  };
}

export interface TextAnalysisResult {
    trustScore: number;
    verdict: string;
    summary: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    sources: GroundingSource[];
    biasAnalysis?: {
        vader_sentiment: {
            neg: number;
            neu: number;
            pos: number;
            compound: number;
        };
        polarity: number;
        subjectivity: number;
        bias_scores: {
            extreme_positive: number;
            extreme_negative: number;
            emotional_triggers: number;
            authority_appeals: number;
            conspiracy: number;
        };
        emotional_manipulation: number;
        overall_bias: 'high' | 'moderate' | 'low';
        error?: string;
    };
    qualityAnalysis?: {
        flesch_reading_ease: number;
        flesch_kincaid_grade: number;
        gunning_fog: number;
        automated_readability: number;
        word_count: number;
        sentence_count: number;
        avg_sentence_length: number;
        lexical_diversity: number;
        quality_score: number;
        error?: string;
    };
    claimsAnalysis?: {
        claims: Array<{
            claim: string;
            confidence: number;
            type: string;
        }>;
        key_phrases: string[];
        total_claims: number;
        error?: string;
    };
    aiAnalysis?: {
        repetitive_patterns: number;
        unnatural_flow: number;
        generic_language: number;
        perfect_grammar: number;
        ai_likelihood: number;
        error?: string;
    };
    factsAnalysis?: {
        verified_facts: Array<{
            statement: string;
            confidence: number;
            source: string;
        }>;
        contradicted_facts: Array<{
            statement: string;
            confidence: number;
            source: string;
        }>;
        fact_check_score: number;
        error?: string;
    };
    semanticAnalysis?: {
        similarity_score: number;
        patterns: Array<{
            pattern: string;
            similarity: number;
        }>;
        error?: string;
    };
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    }
}
