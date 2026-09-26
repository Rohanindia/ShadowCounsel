"""Negotiation pack generator: redline language + legal consultation checklist."""
import json
from typing import Dict, Any, List
from groq import AsyncGroq
from config import settings
from database import get_document, get_session_debates, get_or_extract_clauses

NEGOTIATION_SYSTEM_PROMPT = """You are an expert contract negotiation attorney under Indian law.
Your role: Review the high/medium risk clauses and debate arguments from a contract.
Produce an actionable, empowering negotiation and legal consultation pack for the user.

Generate a JSON response with:
1. "executive_summary": A 2-3 sentence clear, non-legalese summary of the primary risks and user obligations.
2. "high_risk_clauses": An array of suggested redlines for clauses that are one-sided or risky:
   - "clause_id": integer
   - "original_text": original wording
   - "suggested_text": fair, reciprocal replacement wording that protects the user while remaining commercially reasonable
   - "rationale": explanation of why this counter-proposal is fair
   - "statute_basis": relevant Indian statute or precedent (e.g., Section 73/74 Contract Act, Consumer Protection Act)
3. "lawyer_questions": An actionable checklist of 4-6 specific, high-impact questions the user can take to a licensed advocate or legal aid clinic (DLSA) to verify their legal exposure.

Respond ONLY with valid JSON in this exact structure:
{
  "executive_summary": "...",
  "high_risk_clauses": [
    {
      "clause_id": 1,
      "original_text": "...",
      "suggested_text": "...",
      "rationale": "...",
      "statute_basis": "..."
    }
  ],
  "lawyer_questions": [
    "Is the lock-in period enforceable if the premises become uninhabitable under local rent laws?",
    "..."
  ]
}

Do not wrap in markdown or add commentary. Return pure JSON only.
"""

async def generate_negotiation_pack(session_id: str) -> Dict[str, Any]:
    """Generates redlines and questions for legal counsel using Groq LLM."""
    clauses = await get_or_extract_clauses(session_id)
    debates = await get_session_debates(session_id)

    # Find high and medium risk clauses
    risk_by_clause = {}
    for d in debates:
        if d.get("risk_level"):
            risk_by_clause[d["clause_id"]] = d["risk_level"]

    # Filter or prioritize clauses that have high/medium risk or look risky
    target_clauses = [
        c for c in clauses
        if risk_by_clause.get(c.get("clause_id")) in ("High", "Medium")
    ]
    if not target_clauses:
        target_clauses = clauses[:5]  # Fallback to first 5 clauses if no verdicts yet

    if not target_clauses:
        return {
            "session_id": session_id,
            "executive_summary": "No contract clauses available. Please upload a document to begin analysis.",
            "high_risk_clauses": [],
            "lawyer_questions": []
        }

    clauses_summary = "\n\n".join([
        f"Clause #{c.get('clause_id')} ({c.get('category')} - Risk: {risk_by_clause.get(c.get('clause_id'), 'Unrated')}):\n{c.get('clause_text')}"
        for c in target_clauses
    ])

    client = AsyncGroq(api_key=settings.groq_api_key)

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": NEGOTIATION_SYSTEM_PROMPT},
            {"role": "user", "content": f"CONTRACT CLAUSES TO ANALYZE:\n\n{clauses_summary}"}
        ],
        temperature=0.2,
        max_tokens=2500,
        response_format={"type": "json_object"}
    )

    try:
        data = json.loads(response.choices[0].message.content)
    except Exception:
        data = {
            "executive_summary": "Analysis completed. Review the clauses with a legal professional.",
            "high_risk_clauses": [],
            "lawyer_questions": [
                "Does this contract impose unilateral liability on me?",
                "Are the penalty clauses enforceable under Section 74 of the Indian Contract Act?"
            ]
        }

    data["session_id"] = session_id
    return data
