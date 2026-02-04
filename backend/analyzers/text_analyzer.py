import asyncio
import re
import json
from typing import Dict, Any, List, Tuple, Optional
from collections import Counter
import nltk
from textblob import TextBlob
import requests
from bs4 import BeautifulSoup
import spacy
import yake
from langdetect import detect, LangDetectException
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import textstat
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import newspaper
from goose3 import Goose
from .models import make_text_result
from .azure_ai import azure_ai


# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')


class AdvancedTextAnalyzer:
    """Advanced text analysis with multiple AI models and techniques."""
    
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.sentence_model = None
        self.fake_news_model = None
        self.bias_model = None
        self.nlp = None
        self.kw_extractor = yake.KeywordExtractor(
            lan="en", n=3, dedupLim=0.7, top=10
        )
        self.goose = Goose()
        
        # Initialize models lazily to improve startup time
        self._models_initialized = False
    
    async def initialize_models(self):
        """Initialize heavy ML models lazily."""
        if self._models_initialized:
            return
            
        try:
            # Load sentence transformer for semantic analysis
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Load fake news detection model
            try:
                self.fake_news_model = pipeline(
                    "text-classification",
                    model="martin-ha/toxic-comment-model",
                    tokenizer="martin-ha/toxic-comment-model"
                )
            except:
                self.fake_news_model = None
            
            # Load spaCy for advanced NLP
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                # Fallback if spaCy model not available
                self.nlp = None
            
            self._models_initialized = True
        except Exception as e:
            print(f"Model initialization warning: {e}")
            self._models_initialized = True

    async def analyze_semantic_similarity(self, text: str) -> Dict[str, Any]:
        """Analyze semantic similarity to known misinformation patterns."""
        if not self.sentence_model:
            return {"similarity_score": 0.0, "patterns": []}
        
        try:
            # Known misinformation patterns
            misinformation_templates = [
                "Scientists don't want you to know this secret",
                "Big pharma is hiding the truth about this miracle cure",
                "Government officials are covering up this shocking discovery",
                "Doctors hate this one simple trick",
                "This will change everything you know about health",
                "Media won't report on this breaking news",
                "Exposed: The truth they don't want you to see"
            ]
            
            text_embedding = self.sentence_model.encode([text])
            template_embeddings = self.sentence_model.encode(misinformation_templates)
            
            similarities = cosine_similarity(text_embedding, template_embeddings)[0]
            max_similarity = float(np.max(similarities))
            
            similar_patterns = []
            for i, sim in enumerate(similarities):
                if sim > 0.6:  # High similarity threshold
                    similar_patterns.append({
                        "pattern": misinformation_templates[i],
                        "similarity": float(sim)
                    })
            
            return {
                "similarity_score": max_similarity,
                "patterns": similar_patterns
            }
        except Exception as e:
            return {"error": str(e), "similarity_score": 0.0, "patterns": []}

    async def analyze_bias_and_subjectivity(self, text: str) -> Dict[str, Any]:
        """Analyze text for bias, subjectivity, and emotional manipulation."""
        try:
            # VADER sentiment analysis (better for social media text)
            vader_scores = self.vader_analyzer.polarity_scores(text)
            
            # TextBlob analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            # Bias indicators
            bias_words = {
                'extreme_positive': ['amazing', 'incredible', 'revolutionary', 'miraculous', 'perfect'],
                'extreme_negative': ['terrible', 'horrible', 'disaster', 'catastrophe', 'nightmare'],
                'emotional_triggers': ['urgent', 'shocking', 'secret', 'hidden', 'exposed', 'truth'],
                'authority_appeals': ['experts', 'scientists', 'doctors', 'studies', 'research'],
                'conspiracy': ['they', 'cover-up', 'hidden agenda', 'mainstream media', 'establishment']
            }
            
            bias_scores = {}
            text_lower = text.lower()
            
            for category, words in bias_words.items():
                count = sum(1 for word in words if word in text_lower)
                bias_scores[category] = count
            
            # Emotional manipulation score
            emotional_score = (
                bias_scores['extreme_positive'] + 
                bias_scores['extreme_negative'] + 
                bias_scores['emotional_triggers']
            ) / max(1, len(text.split()) / 10)
            
            return {
                "vader_sentiment": vader_scores,
                "polarity": polarity,
                "subjectivity": subjectivity,
                "bias_scores": bias_scores,
                "emotional_manipulation": emotional_score,
                "overall_bias": "high" if emotional_score > 0.3 else "moderate" if emotional_score > 0.1 else "low"
            }
        except Exception as e:
            return {"error": str(e)}

    async def analyze_readability_and_quality(self, text: str) -> Dict[str, Any]:
        """Analyze text readability and quality metrics."""
        try:
            # Readability scores
            flesch_reading_ease = textstat.flesch_reading_ease(text)
            flesch_kincaid_grade = textstat.flesch_kincaid_grade(text)
            gunning_fog = textstat.gunning_fog(text)
            automated_readability = textstat.automated_readability_index(text)
            
            # Text statistics
            word_count = len(text.split())
            sentence_count = textstat.sentence_count(text)
            avg_sentence_length = word_count / max(1, sentence_count)
            lexical_diversity = len(set(text.lower().split())) / max(1, word_count)
            
            # Quality indicators
            quality_score = 100
            
            # Penalty for poor readability
            if flesch_reading_ease < 30:  # Very difficult
                quality_score -= 20
            elif flesch_reading_ease > 90:  # Very easy (might be dumbed down)
                quality_score -= 10
            
            # Penalty for extreme sentence lengths
            if avg_sentence_length > 25:
                quality_score -= 15
            elif avg_sentence_length < 8:
                quality_score -= 10
            
            # Bonus for good lexical diversity
            if 0.6 < lexical_diversity < 0.9:
                quality_score += 10
            elif lexical_diversity < 0.3:
                quality_score -= 20
            
            return {
                "flesch_reading_ease": flesch_reading_ease,
                "flesch_kincaid_grade": flesch_kincaid_grade,
                "gunning_fog": gunning_fog,
                "automated_readability": automated_readability,
                "word_count": word_count,
                "sentence_count": sentence_count,
                "avg_sentence_length": avg_sentence_length,
                "lexical_diversity": lexical_diversity,
                "quality_score": max(0, min(100, quality_score))
            }
        except Exception as e:
            return {"error": str(e)}

    async def extract_and_verify_claims(self, text: str) -> Dict[str, Any]:
        """Extract factual claims and attempt verification."""
        try:
            claims = []
            
            # Extract potential factual claims using NLP
            if self.nlp:
                doc = self.nlp(text)
                
                # Look for factual patterns
                for sent in doc.sents:
                    sent_text = sent.text.strip()
                    
                    # Patterns that might indicate factual claims
                    factual_patterns = [
                        r'\b\w+ is (the )?capital of \w+',
                        r'\b\w+ was born in \d{4}',
                        r'\b\w+ died in \d{4}',
                        r'\d+% of \w+',
                        r'according to \w+',
                        r'study shows',
                        r'research indicates',
                        r'\w+ causes \w+',
                        r'\w+ prevents \w+'
                    ]
                    
                    for pattern in factual_patterns:
                        if re.search(pattern, sent_text, re.IGNORECASE):
                            claims.append({
                                "claim": sent_text,
                                "confidence": 0.7,
                                "type": "factual"
                            })
                            break
            else:
                # Fallback without spaCy
                sentences = text.split('.')
                for sent in sentences[:5]:  # Check first 5 sentences
                    if any(keyword in sent.lower() for keyword in ['is', 'was', 'according', 'study', 'research']):
                        claims.append({
                            "claim": sent.strip(),
                            "confidence": 0.5,
                            "type": "potential_factual"
                        })
            
            # Extract key phrases for fact-checking
            keywords = self.kw_extractor.extract_keywords(text)
            key_phrases = [kw[1] for kw in keywords[:5]]
            
            return {
                "claims": claims[:10],  # Limit to top 10 claims
                "key_phrases": key_phrases,
                "total_claims": len(claims)
            }
        except Exception as e:
            return {"error": str(e), "claims": [], "key_phrases": []}

    async def detect_ai_generated_content(self, text: str) -> Dict[str, Any]:
        """Detect if text might be AI-generated."""
        try:
            ai_indicators = {
                "repetitive_patterns": 0,
                "unnatural_flow": 0,
                "generic_language": 0,
                "perfect_grammar": 0,
                "ai_likelihood": 0.0
            }
            
            # Check for repetitive patterns
            sentences = text.split('.')
            sentence_similarities = []
            
            if len(sentences) > 2:
                for i in range(len(sentences) - 1):
                    s1 = sentences[i].strip().lower()
                    s2 = sentences[i + 1].strip().lower()
                    if s1 and s2:
                        similarity = len(set(s1.split()) & set(s2.split())) / max(1, len(set(s1.split()) | set(s2.split())))
                        sentence_similarities.append(similarity)
                
                if sentence_similarities:
                    avg_similarity = sum(sentence_similarities) / len(sentence_similarities)
                    if avg_similarity > 0.6:
                        ai_indicators["repetitive_patterns"] = 1
            
            # Check for generic language
            generic_phrases = [
                "it is important to note",
                "in conclusion",
                "furthermore",
                "moreover",
                "it should be mentioned",
                "it is worth noting",
                "in summary",
                "to summarize"
            ]
            
            generic_count = sum(1 for phrase in generic_phrases if phrase in text.lower())
            if generic_count > 2:
                ai_indicators["generic_language"] = 1
            
            # Check grammar perfection (AI tends to have perfect grammar)
            blob = TextBlob(text)
            try:
                corrected = str(blob.correct())
                if corrected == text and len(text) > 100:
                    ai_indicators["perfect_grammar"] = 1
            except:
                pass
            
            # Calculate AI likelihood
            total_indicators = sum(ai_indicators[key] for key in ["repetitive_patterns", "unnatural_flow", "generic_language", "perfect_grammar"])
            ai_indicators["ai_likelihood"] = total_indicators / 4.0
            
            return ai_indicators
        except Exception as e:
            return {"error": str(e), "ai_likelihood": 0.0}

    async def cross_reference_facts(self, text: str) -> Dict[str, Any]:
        """Cross-reference facts with reliable sources."""
        try:
            # Enhanced fact database
            fact_database = {
                # Geography
                'new delhi is capital of india': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'mumbai is capital of maharashtra': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'kolkata is capital of west bengal': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'chennai is capital of tamil nadu': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'bangalore is capital of karnataka': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'hyderabad is capital of telangana': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'washington dc is capital of usa': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'london is capital of england': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                'paris is capital of france': {'truth': True, 'confidence': 1.0, 'source': 'Official Government'},
                
                # Science
                'earth is round': {'truth': True, 'confidence': 1.0, 'source': 'Scientific Consensus'},
                'earth is flat': {'truth': False, 'confidence': 1.0, 'source': 'Scientific Consensus'},
                'vaccines cause autism': {'truth': False, 'confidence': 1.0, 'source': 'Medical Research'},
                'climate change is real': {'truth': True, 'confidence': 1.0, 'source': 'Scientific Consensus'},
                
                # Technology
                'ai can think like humans': {'truth': False, 'confidence': 0.8, 'source': 'Current Technology Limits'},
                'internet was invented in 1969': {'truth': True, 'confidence': 1.0, 'source': 'Historical Records'},
                
                # Health
                'smoking causes cancer': {'truth': True, 'confidence': 1.0, 'source': 'Medical Research'},
                'water is essential for life': {'truth': True, 'confidence': 1.0, 'source': 'Biological Science'},
            }
            
            text_normalized = re.sub(r'[^\w\s]', '', text.lower().strip())
            
            verified_facts = []
            contradicted_facts = []
            
            for fact, info in fact_database.items():
                # Check for exact or partial matches
                if fact in text_normalized or any(word in text_normalized for word in fact.split() if len(word) > 3):
                    if info['truth']:
                        verified_facts.append({
                            'statement': fact,
                            'confidence': info['confidence'],
                            'source': info['source']
                        })
                    else:
                        contradicted_facts.append({
                            'statement': fact,
                            'confidence': info['confidence'],
                            'source': info['source']
                        })
            
            return {
                'verified_facts': verified_facts,
                'contradicted_facts': contradicted_facts,
                'fact_check_score': len(verified_facts) * 20 - len(contradicted_facts) * 50
            }
        except Exception as e:
            return {'error': str(e), 'verified_facts': [], 'contradicted_facts': []}


async def analyze_text(text: str) -> Dict[str, Any]:
    """Analyze text for trustworthiness, sentiment, and provide comprehensive analysis."""
    
    # Initialize advanced analyzer
    analyzer = AdvancedTextAnalyzer()
    await analyzer.initialize_models()
    
    # Detect language
    try:
        detected_language = detect(text)
    except LangDetectException:
        detected_language = "unknown"
    
    # Basic sentiment analysis using TextBlob
    blob = TextBlob(text)
    sentiment_score = blob.sentiment.polarity
    
    if sentiment_score > 0.1:
        sentiment = 'Positive'
    elif sentiment_score < -0.1:
        sentiment = 'Negative'  
    else:
        sentiment = 'Neutral'
    
    # Initialize trust score
    trust = 70
    verdict = 'Neutral'
    
    # Perform comprehensive analysis
    try:
        # Run all analyses concurrently
        bias_task = analyzer.analyze_bias_and_subjectivity(text)
        quality_task = analyzer.analyze_readability_and_quality(text)
        claims_task = analyzer.extract_and_verify_claims(text)
        ai_task = analyzer.detect_ai_generated_content(text)
        facts_task = analyzer.cross_reference_facts(text)
        semantic_task = analyzer.analyze_semantic_similarity(text)
        
        bias_analysis, quality_analysis, claims_analysis, ai_analysis, facts_analysis, semantic_analysis = await asyncio.gather(
            bias_task, quality_task, claims_task, ai_task, facts_task, semantic_task,
            return_exceptions=True
        )
        
        # Adjust trust based on comprehensive analysis
        
        # 1. Bias and emotional manipulation
        if isinstance(bias_analysis, dict) and not bias_analysis.get("error"):
            emotional_manipulation = bias_analysis.get("emotional_manipulation", 0)
            if emotional_manipulation > 0.5:
                trust -= 30
                verdict = "High Emotional Manipulation"
            elif emotional_manipulation > 0.3:
                trust -= 20
                verdict = "Moderate Bias Detected"
            
            subjectivity = bias_analysis.get("subjectivity", 0)
            if subjectivity > 0.8:
                trust -= 15  # Highly subjective content
        
        # 2. Quality analysis
        if isinstance(quality_analysis, dict) and not quality_analysis.get("error"):
            quality_score = quality_analysis.get("quality_score", 50)
            if quality_score < 30:
                trust -= 25
                verdict = "Poor Quality Text"
            elif quality_score > 80:
                trust += 10
            
            lexical_diversity = quality_analysis.get("lexical_diversity", 0.5)
            if lexical_diversity < 0.2:
                trust -= 20  # Very repetitive text
        
        # 3. AI-generated content detection
        if isinstance(ai_analysis, dict) and not ai_analysis.get("error"):
            ai_likelihood = ai_analysis.get("ai_likelihood", 0)
            if ai_likelihood > 0.7:
                trust -= 35
                verdict = "Likely AI-Generated"
            elif ai_likelihood > 0.5:
                trust -= 20
                verdict = "Possibly AI-Generated"
        
        # 4. Fact verification
        if isinstance(facts_analysis, dict) and not facts_analysis.get("error"):
            fact_check_score = facts_analysis.get("fact_check_score", 0)
            verified_facts = facts_analysis.get("verified_facts", [])
            contradicted_facts = facts_analysis.get("contradicted_facts", [])
            
            if contradicted_facts:
                trust = min(trust, 20)  # Heavy penalty for false facts
                verdict = "Contains False Information"
            elif verified_facts:
                trust += min(20, len(verified_facts) * 5)  # Bonus for verified facts
                verdict = "Contains Verified Facts"
        
        # 5. Semantic similarity to misinformation
        if isinstance(semantic_analysis, dict) and not semantic_analysis.get("error"):
            similarity_score = semantic_analysis.get("similarity_score", 0)
            if similarity_score > 0.7:
                trust -= 40
                verdict = "Similar to Known Misinformation"
            elif similarity_score > 0.5:
                trust -= 25
                verdict = "Potentially Misleading"
        
        # 6. Claims analysis
        if isinstance(claims_analysis, dict) and not claims_analysis.get("error"):
            claims = claims_analysis.get("claims", [])
            if len(claims) > 5:
                trust -= 10  # Many claims can be suspicious
        
    except Exception as e:
        # Fallback if comprehensive analysis fails
        bias_analysis = {"error": str(e)}
        quality_analysis = {"error": str(e)}
        claims_analysis = {"error": str(e)}
        ai_analysis = {"error": str(e)}
        facts_analysis = {"error": str(e)}
        semantic_analysis = {"error": str(e)}
    
    # Enhanced false claim detection (existing logic)
    false_claim_patterns = [
        r'\b\w+ is \w+ (girlfriend|boyfriend|wife|husband|partner)',
        r'i am \w+ (owner|ceo|president|founder) of \w+',
        r'\w+ (are|is) my (servant|employee|worker|slave)',
        r'i own \w+ (company|corporation|business|industry)',
        r'i am (billionaire|millionaire|richest|owner of)',
        r'i control \w+ (company|corporation|business)',
        r'i bought \w+ (company|corporation|business)',
    ]
    
    false_claim_count = sum(1 for pattern in false_claim_patterns 
                           if re.search(pattern, text, re.IGNORECASE))
    
    if false_claim_count > 0:
        trust = max(0, trust - (false_claim_count * 30))
        verdict = 'False Claims Detected'
    
    # Enhanced misinformation pattern detection
    misinformation_patterns = [
        r'100% proven', r'doctors hate this', r'scientists don\'t want you to know',
        r'big pharma', r'the truth they hide', r'wake up sheeple',
        r'mainstream media lies', r'they don\'t want you to know',
        r'exposed!', r'shocking truth'
    ]
    
    misinformation_count = sum(1 for pattern in misinformation_patterns 
                              if re.search(pattern, text, re.IGNORECASE))
    
    if misinformation_count > 0:
        trust -= misinformation_count * 20
        verdict = 'Potential Misinformation'
    
    # Knowledge base verification for factual statements
    geographical_facts = {
        'patna is capital of bihar': 95,
        'delhi is capital of india': 95,
        'mumbai is capital of maharashtra': 95,
        'kolkata is capital of west bengal': 95,
        'chennai is capital of tamil nadu': 95,
        'bangalore is capital of karnataka': 95,
        'hyderabad is capital of telangana': 95,
        'washington is capital of usa': 95,
        'london is capital of england': 95,
        'paris is capital of france': 95,
        'earth is round': 98,
        'vaccines are safe': 95,
        'climate change is real': 97,
    }
    
    text_normalized = re.sub(r'[^\w\s]', '', text.lower().strip())
    for fact, score in geographical_facts.items():
        if text_normalized in fact or fact in text_normalized:
            trust = max(trust, score - 5)
            verdict = 'Verified Factual Statement'
            break
    
    # Generate summary
    sentences = list(blob.sentences)
    if len(sentences) >= 3:
        summary_sentences = sentences[:3]
        summary = ' '.join(str(s) for s in summary_sentences)
    else:
        summary = text
    
    if len(summary) > 300:
        summary = summary[:297] + '...'
    
    # Enhanced source recommendations based on content analysis
    sources: List[Dict[str, Any]] = []
    text_lower = text.lower()
    
    # Categorize content and provide relevant sources
    if any(term in text_lower for term in ['health', 'medical', 'disease', 'treatment', 'medicine', 'vaccine']):
        sources.extend([
            {"web": {"uri": "https://www.who.int", "title": "World Health Organization"}},
            {"web": {"uri": "https://www.mayoclinic.org", "title": "Mayo Clinic"}},
            {"web": {"uri": "https://pubmed.ncbi.nlm.nih.gov", "title": "PubMed Medical Research"}},
            {"web": {"uri": "https://www.cdc.gov", "title": "Centers for Disease Control"}},
        ])
    elif any(term in text_lower for term in ['climate', 'global warming', 'environment', 'carbon', 'emissions']):
        sources.extend([
            {"web": {"uri": "https://www.ipcc.ch", "title": "IPCC Climate Reports"}},
            {"web": {"uri": "https://climate.nasa.gov", "title": "NASA Climate Change"}},
            {"web": {"uri": "https://www.epa.gov", "title": "EPA Environmental Information"}},
            {"web": {"uri": "https://www.noaa.gov", "title": "NOAA Climate Data"}},
        ])
    elif any(term in text_lower for term in ['technology', 'ai', 'artificial intelligence', 'computer', 'software']):
        sources.extend([
            {"web": {"uri": "https://www.nature.com/subjects/computer-science", "title": "Nature Computer Science"}},
            {"web": {"uri": "https://spectrum.ieee.org", "title": "IEEE Spectrum"}},
            {"web": {"uri": "https://arxiv.org/list/cs/recent", "title": "arXiv Computer Science"}},
            {"web": {"uri": "https://www.acm.org", "title": "Association for Computing Machinery"}},
        ])
    elif any(term in text_lower for term in ['politics', 'government', 'election', 'policy', 'democracy']):
        sources.extend([
            {"web": {"uri": "https://www.factcheck.org", "title": "FactCheck.org"}},
            {"web": {"uri": "https://www.politifact.com", "title": "PolitiFact"}},
            {"web": {"uri": "https://www.snopes.com", "title": "Snopes"}},
            {"web": {"uri": "https://www.allsides.com", "title": "AllSides"}},
        ])
    elif any(term in text_lower for term in ['science', 'research', 'study', 'experiment', 'discovery']):
        sources.extend([
            {"web": {"uri": "https://www.nature.com", "title": "Nature Scientific Journal"}},
            {"web": {"uri": "https://www.sciencemag.org", "title": "Science Magazine"}},
            {"web": {"uri": "https://www.pnas.org", "title": "PNAS"}},
            {"web": {"uri": "https://www.scientificamerican.com", "title": "Scientific American"}},
        ])
    else:
        sources = [
            {"web": {"uri": "https://www.reuters.com/fact-check", "title": "Reuters Fact Check"}},
            {"web": {"uri": "https://www.bbc.com/news/reality_check", "title": "BBC Reality Check"}},
            {"web": {"uri": "https://www.snopes.com", "title": "Snopes Fact Checking"}},
            {"web": {"uri": "https://www.factcheck.org", "title": "FactCheck.org"}},
        ]
    
    # Azure AI Enhanced Analysis
    try:
        azure_text_analysis = await azure_ai.analyze_text_with_azure(text)
        if azure_text_analysis.get("azure_text_analysis") == "success":
            azure_sentiment = azure_text_analysis.get("sentiment", {})
            
            # Cross-validate sentiment
            azure_sentiment_label = azure_sentiment.get("sentiment", "unknown")
            if azure_sentiment_label != sentiment.lower() and azure_sentiment_label != "unknown":
                trust -= 5  # Minor penalty for sentiment inconsistency
        
        # Azure Content Safety check
        safety_analysis = await azure_ai.check_content_safety_text(text)
        if safety_analysis.get("content_safety") == "success":
            safety_categories = safety_analysis.get("categories", {})
            for category, details in safety_categories.items():
                if details.get("rejected"):
                    trust = 0
                    verdict = f"Harmful Content: {category}"
                elif details.get("severity", 0) >= 2:
                    trust -= 30
                    verdict = f"Potentially Harmful: {category}"
    
    except Exception as e:
        pass  # Don't penalize for Azure service errors
    
    # Final trust score and verdict
    trust = max(0, min(100, trust))
    
    if trust >= 90:
        verdict = 'Highly Trustworthy'
    elif trust >= 75:
        verdict = 'Mostly Trustworthy'
    elif trust >= 60:
        verdict = 'Generally Reliable'
    elif trust >= 45:
        verdict = 'Questionable Content'
    elif trust >= 25:
        verdict = 'Likely Unreliable'
    else:
        verdict = 'High Risk Content'
    
    await asyncio.sleep(0.2)
    return make_text_result(trust, verdict, summary, sentiment, sources)