"""Shadow-Party Agent: argues how the other party's lawyer would exploit ambiguities."""
from typing import AsyncGenerator
from groq import AsyncGroq
from config import settings
from agents.prompts import SHADOW_PARTY_SYSTEM_PROMPT

async def stream_shadow_party(
    clause_text: str,
    category: str,
    advocate_argument: str,
    document_type: str = "unknown"
) -> AsyncGenerator[str, None]:
    """Streams the Shadow Party agent's counter-argument."""
    client = AsyncGroq(api_key=settings.groq_api_key)
    
    user_prompt = f"""DOCUMENT TYPE: {document_type}
CLAUSE CATEGORY: {category}

CLAUSE TEXT:
\"\"\"{clause_text}\"\"\"

THE USER'S ADVOCATE ARGUED:
\"\"\"{advocate_argument}\"\"\"

Rebut the Advocate's concerns and explain how our client will leverage this clause."""

    stream = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": SHADOW_PARTY_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.4,
        max_tokens=800,
        stream=True
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
