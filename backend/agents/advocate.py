"""Advocate Agent: reads every clause from the user's interest."""
from typing import AsyncGenerator
from groq import AsyncGroq
from config import settings
from agents.prompts import ADVOCATE_SYSTEM_PROMPT

async def stream_advocate(
    clause_text: str,
    category: str,
    document_type: str = "unknown"
) -> AsyncGenerator[str, None]:
    """Streams the Advocate agent's analysis of a clause."""
    client = AsyncGroq(api_key=settings.groq_api_key)
    
    user_prompt = f"""DOCUMENT TYPE: {document_type}
CLAUSE CATEGORY: {category}

CLAUSE TEXT:
\"\"\"{clause_text}\"\"\"

Analyze this clause from the perspective of protecting the user."""

    stream = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": ADVOCATE_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,
        max_tokens=800,
        stream=True
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
