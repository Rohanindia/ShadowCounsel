"""WebSocket endpoint for live adversarial debate streaming."""
import json
import os
import glob
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from database import (
    get_session,
    get_document,
    save_document,
    save_debate_entry,
    update_session_status
)
from ocr.pipeline import extract_text
from ocr.clause_extractor import extract_clauses
from agents.advocate import stream_advocate
from agents.shadow_party import stream_shadow_party
from agents.arbiter import stream_arbiter, parse_verdict_risk

router = APIRouter()

@router.websocket("/ws/debate/{session_id}")
async def debate_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    print(f"[WebSocket] Connected for session: {session_id}")

    try:
        # Wait for start command from client
        data = await websocket.receive_text()
        msg = json.loads(data)
        print(f"[WebSocket] Received message: {msg.get('type')}")

        session = await get_session(session_id)
        doc_type = session.get("document_type", "unknown") if session else "unknown"

        # 1. Retrieve or perform clause extraction
        doc = await get_document(session_id)
        clauses = doc.get("extracted_clauses", []) if doc else []

        if not clauses:
            # Check if an uploaded file exists for this session
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
            matches = glob.glob(os.path.join(upload_dir, f"{session_id}.*"))

            if matches:
                file_path = matches[0]
                file_ext = os.path.splitext(file_path)[1].lower()
                print(f"[WebSocket] Extracting text and clauses for {file_path}...")
                
                raw_text, _ = await extract_text(file_path, file_ext)
                extracted_list, detected_type = await extract_clauses(raw_text, doc_type)
                
                clauses = [
                    {
                        "clause_id": c.clause_id,
                        "clause_text": c.clause_text,
                        "category": c.category.value if hasattr(c.category, "value") else str(c.category)
                    }
                    for c in extracted_list
                ]
                await save_document(session_id, raw_text, clauses)
                await update_session_status(session_id, "extracted")
            else:
                print(f"[WebSocket] No uploaded file found for session {session_id}")

        if not clauses:
            # Send sample clause if nothing could be extracted
            clauses = [
                {
                    "clause_id": 1,
                    "clause_text": "The Tenant shall deposit a non-refundable security deposit of Rs. 1,00,000. Landlord may deduct any amount for damages at sole discretion without dispute.",
                    "category": "Security Deposit"
                }
            ]

        # 2. Iterate through clauses and stream the 3-agent adversarial debate
        risk_counts = {"High": 0, "Medium": 0, "Low": 0}

        for clause in clauses:
            clause_id = clause.get("clause_id", 1)
            clause_text = clause.get("clause_text", "")
            category = clause.get("category", "General")

            # A. Notify clause start
            await websocket.send_text(json.dumps({
                "type": "clause_start",
                "clause_id": clause_id,
                "clause_text": clause_text,
                "category": category
            }))

            # B. Stream Advocate Agent
            await websocket.send_text(json.dumps({
                "type": "agent_start",
                "clause_id": clause_id,
                "agent": "advocate"
            }))
            advocate_full = ""
            async for delta in stream_advocate(clause_text, category, doc_type):
                advocate_full += delta
                await websocket.send_text(json.dumps({
                    "type": "agent_delta",
                    "clause_id": clause_id,
                    "agent": "advocate",
                    "content": delta
                }))
            await websocket.send_text(json.dumps({
                "type": "agent_complete",
                "clause_id": clause_id,
                "agent": "advocate"
            }))
            await save_debate_entry(session_id, clause_id, "advocate", advocate_full)

            # C. Stream Shadow-Party Agent
            await websocket.send_text(json.dumps({
                "type": "agent_start",
                "clause_id": clause_id,
                "agent": "shadow_party"
            }))
            shadow_full = ""
            async for delta in stream_shadow_party(clause_text, category, advocate_full, doc_type):
                shadow_full += delta
                await websocket.send_text(json.dumps({
                    "type": "agent_delta",
                    "clause_id": clause_id,
                    "agent": "shadow_party",
                    "content": delta
                }))
            await websocket.send_text(json.dumps({
                "type": "agent_complete",
                "clause_id": clause_id,
                "agent": "shadow_party"
            }))
            await save_debate_entry(session_id, clause_id, "shadow_party", shadow_full)

            # D. Stream Arbiter Agent
            await websocket.send_text(json.dumps({
                "type": "agent_start",
                "clause_id": clause_id,
                "agent": "arbiter"
            }))
            arbiter_full = ""
            async for delta in stream_arbiter(clause_text, category, advocate_full, shadow_full, doc_type):
                arbiter_full += delta
                await websocket.send_text(json.dumps({
                    "type": "agent_delta",
                    "clause_id": clause_id,
                    "agent": "arbiter",
                    "content": delta
                }))
            await websocket.send_text(json.dumps({
                "type": "agent_complete",
                "clause_id": clause_id,
                "agent": "arbiter"
            }))

            # E. Verdict
            risk = parse_verdict_risk(arbiter_full)
            risk_counts[risk] = risk_counts.get(risk, 0) + 1
            await websocket.send_text(json.dumps({
                "type": "arbiter_verdict",
                "clause_id": clause_id,
                "risk": risk
            }))
            await save_debate_entry(session_id, clause_id, "arbiter", arbiter_full, risk_level=risk)

        # 3. Complete debate
        overall_risk = "High" if risk_counts["High"] > 0 else ("Medium" if risk_counts["Medium"] > 0 else "Low")
        await websocket.send_text(json.dumps({
            "type": "debate_complete",
            "overall_risk": overall_risk
        }))
        await update_session_status(session_id, "completed")
        print(f"[WebSocket] Debate completed for session: {session_id}")

    except WebSocketDisconnect:
        print(f"[WebSocket] Client disconnected: {session_id}")
    except Exception as e:
        print(f"[WebSocket] Error during debate stream: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
