"""Versatile legal clause, section, and issue extraction via Groq LLM."""
import json
import asyncio
from typing import List, Tuple
from groq import AsyncGroq

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config import settings
from models import ExtractedClause, ClauseCategory, DocumentType

CLAUSE_EXTRACTION_PROMPT = """You are an expert Indian legal document analyst.
Analyze the following legal document (which may be a contract, agreement, case study, legal brief, petition, policy, or legal notice).
Extract each distinct clause, legal issue, charge, obligation, or section (between 3 to 10 key provisions).

For each item provide:
1. clause_id: sequential integer starting from 1
2. clause_text: the complete text or concise excerpt of the provision/issue (do not truncate prematurely)
3. category: a concise category name (e.g., 'Charges & Allegations', 'Evidentiary Standards', 'Liability & Penalty', 'Rights & Obligations', 'Jurisdiction & Procedure', 'Parties & Definitions', 'Termination & Breach', 'Financial Terms')
4. confidence: float between 0.0 and 1.0 indicating confidence

Also determine the document_type from: "rental", "loan_emi", "employment", "gig_platform", "insurance", "legal_brief", "case_study", "unknown"

IMPORTANT: Return ONLY valid JSON in this exact structure:
{
  "document_type": "legal_brief",
  "clauses": [
    {
      "clause_id": 1,
      "clause_text": "...",
      "category": "Charges & Allegations",
      "confidence": 0.95
    }
  ]
}

Do NOT include any text outside the JSON object. No markdown, no explanation.

DOCUMENT TEXT:
"""

async def extract_clauses(raw_text: str, document_type_hint: str = "unknown") -> Tuple[List[ExtractedClause], DocumentType]:
    """Extract and categorize clauses/sections from raw legal text using Groq LLM."""
    client = AsyncGroq(api_key=settings.groq_api_key)
    
    # Cap text to 4000 characters to stay within token per minute limits
    truncated_text = raw_text[:4000]

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": "You are an expert Indian legal document analyst. You extract and categorize key clauses, provisions, and legal issues. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": CLAUSE_EXTRACTION_PROMPT + truncated_text
            }
        ],
        temperature=0.1,
        max_tokens=2500,
        response_format={"type": "json_object"}
    )
    
    result_text = response.choices[0].message.content
    try:
        result = json.loads(result_text)
    except Exception:
        result = {"document_type": "unknown", "clauses": []}
    
    # Parse document type
    doc_type_str = result.get("document_type", "unknown")
    try:
        doc_type = DocumentType(doc_type_str)
    except ValueError:
        doc_type = DocumentType.UNKNOWN
    
    # Parse clauses
    clauses = []
    for c in result.get("clauses", []):
        category_str = c.get("category", "Miscellaneous / Catch-All")
        try:
            category = ClauseCategory(category_str)
        except ValueError:
            # Fallback to MISCELLANEOUS enum
            category = ClauseCategory.MISCELLANEOUS
        
        clause = ExtractedClause(
            clause_id=c.get("clause_id", len(clauses) + 1),
            clause_text=c.get("clause_text", ""),
            category=category,
            confidence=min(max(float(c.get("confidence", 0.8)), 0.0), 1.0)
        )
        clauses.append(clause)
    
    return clauses, doc_type
