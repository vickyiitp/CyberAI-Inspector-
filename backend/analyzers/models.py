from typing import List, Dict, Any, Optional


def make_image_result(
    trust: int,
    verdict: str,
    metadata: List[Dict[str, str]],
    compression: List[Dict[str, str]],
    artifacts: List[str],
) -> Dict[str, Any]:
    return {
        "trustScore": trust,
        "verdict": verdict,
        "analysis": {
            "metadata": metadata,
            "compression": compression,
            "artifacts": artifacts,
        },
    }


def make_url_result(
    trust: int,
    verdict: str,
    domain_info: List[Dict[str, Any]],
    ssl_info: List[Dict[str, str]],
    backlink_profile: Dict[str, int],
    privacy_info: Optional[Dict[str, Any]] = None,
    security_headers: Optional[Dict[str, Any]] = None,
    dns_security: Optional[Dict[str, Any]] = None,
    tracking_info: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    result = {
        "trustScore": trust,
        "verdict": verdict,
        "domainInfo": domain_info,
        "sslInfo": ssl_info,
        "backlinkProfile": backlink_profile,
    }
    
    # Add advanced security analysis if available
    if privacy_info:
        result["privacyInfo"] = privacy_info
    if security_headers:
        result["securityHeaders"] = security_headers
    if dns_security:
        result["dnsSecurity"] = dns_security
    if tracking_info:
        result["trackingInfo"] = tracking_info
    
    return result


def make_text_result(
    trust: int,
    verdict: str,
    summary: str,
    sentiment: str,
    sources: List[Dict[str, Any]],
) -> Dict[str, Any]:
    return {
        "trustScore": trust,
        "verdict": verdict,
        "summary": summary,
        "sentiment": sentiment,
        "sources": sources,
    }