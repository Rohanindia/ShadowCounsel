"""What-if scenario simulator: concrete consequences tied to clauses and legal principles."""
import json
from typing import List, Dict, Any
from groq import AsyncGroq
from config import settings
from database import get_document, get_session, save_whatif_query

SIMULATOR_SYSTEM_PROMPT = """You are an expert Indian Contract Law advisor in ShadowCounsel.
Your role: The user asks a hypothetical question or what-if scenario (e.g., "What if I leave before the notice period?", "What if I miss rent?", "What if equipment gets damaged?").

Evaluate the contract clauses provided and determine the exact legal and financial consequences for the user under Indian law (e.g. Indian Contract Act 1872, Transfer of Property Act, Consumer Protection Act).

Respond ONLY with valid JSON in this exact structure:
{
  "consequences": [
    {
      "matched_clause_id": 1,
      "matched_clause_text": "text excerpt from the matched clause",
      "financial_range": "e.g., Rs. 50,000 - Rs. 1,00,000 forfeiture or penalty",
      "legal_consequences": "Clear, plain-English explanation of what happens legally, what rights you have or lose, and what action the counterparty can initiate.",
      "timeline": "e.g., Immediate deduction / 15-day cure notice / 30-day arbitration",
      "likelihood": "likely"
    }
  ],
  "practical_advice": "Actionable next steps the user should take immediately to protect themselves."
}

Use "likely" or "possible" for likelihood.
Do not output any markdown code fences or conversational text outside the JSON. Return only the raw JSON.
"""

async def simulate_scenario(session_id: str, scenario: str) -> Dict[str, Any]:
    """Analyzes a what-if query against contract clauses using Groq LLM."""
    doc = await get_document(session_id)
    clauses = doc.get("extracted_clauses", []) if doc else []
    
    # Format clauses for context
    clauses_context = "\n".join([
        f"[Clause #{c.get('clause_id')}] ({c.get('category')}): {c.get('clause_text')}"
        for c in clauses[:15]  # Top clauses
    ])

    if not clauses_context:
        clauses_context = "No contract clauses uploaded yet. Analyze based on standard Indian contract terms."

    client = AsyncGroq(api_key=settings.groq_api_key)

    user_prompt = f"""CONTRACT CLAUSES:
{clauses_context}

USER'S WHAT-IF SCENARIO:
"{scenario}"

Analyze the clauses and provide the consequences and advice in JSON format."""

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": SIMULATOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        max_tokens=1500,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    try:
        result = json.loads(content)
    except Exception:
        result = {
            "consequences": [
                {
                    "matched_clause_id": 1,
                    "matched_clause_text": "Contract terms",
                    "financial_range": "Dependent on contract terms",
                    "legal_consequences": content,
                    "timeline": "Immediate",
                    "likelihood": "possible"
                }
            ]
        }

    # Save to database
    await save_whatif_query(session_id, scenario, result)
    return result
