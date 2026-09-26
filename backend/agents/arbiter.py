"""Arbiter Agent: scores risk and cites Indian legal principles."""
import re
from typing import AsyncGenerator, Tuple
from groq import AsyncGroq
from config import settings
from agents.prompts import ARBITER_SYSTEM_PROMPT

async def stream_arbiter(
    clause_text: str,
    category: str,
    advocate_argument: str,
    shadow_argument: str,
    document_type: str = "unknown"
) -> AsyncGenerator[str, None]:
    """Streams the Arbiter agent's verdict on a clause."""
    client = AsyncGroq(api_key=settings.groq_api_key)
    
    user_prompt = f"""DOCUMENT TYPE: {document_type}
CLAUSE CATEGORY: {category}

CLAUSE TEXT:
\"\"\"{clause_text}\"\"\"

ADVOCATE'S ARGUMENT (FOR USER):
\"\"\"{advocate_argument}\"\"\"

SHADOW PARTY'S ARGUMENT (AGAINST USER):
\"\"\"{shadow_argument}\"\"\"

Deliver your impartial legal verdict under Indian law. End with:
VERDICT: [Low | Medium | High]"""

    stream = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": ARBITER_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        max_tokens=900,
        stream=True
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def parse_verdict_risk(arbiter_full_text: str) -> str:
    """Extracts risk level from Arbiter text (defaults to 'Medium' if undetermined)."""
    match = re.search(r"VERDICT:\s*(Low|Medium|High)", arbiter_full_text, re.IGNORECASE)
    if match:
        val = match.group(1).capitalize()
        if val in ("Low", "Medium", "High"):
            return val
    
    # Fallback heuristic
    lower = arbiter_full_text.lower()
    if "high risk" in lower or "severe" in lower or "unconscionable" in lower or "void under section" in lower:
        return "High"
    elif "low risk" in lower or "balanced" in lower or "standard clause" in lower:
        return "Low"
    return "Medium"
