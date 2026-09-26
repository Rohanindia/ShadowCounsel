from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from contextlib import asynccontextmanager
import uuid
import os

from config import settings
from database import init_db, create_session, get_session, update_session_status, save_document
from models import DocumentType, DocumentExtraction

from ocr.pipeline import extract_text
from ocr.clause_extractor import extract_clauses
from websocket.debate_stream import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and RAG store on startup."""
    await init_db()
    # TODO Phase 3: Initialize RAG store
    # from rag.store import init_rag_store
    # await init_rag_store()
    print("ShadowCounsel backend started.")
    yield
    print("ShadowCounsel backend shutting down.")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response

app = FastAPI(
    title="ShadowCounsel",
    description="Adversarial AI legal document analyzer for Indian contracts",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)

# === Health Check ===
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ShadowCounsel",
        "version": "0.1.0"
    }

# === Document Upload ===
@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
    document_type: str = Form(default="unknown")
):
    """Upload a document (PDF, DOCX, or image) for analysis."""
    # Validate file type
    allowed_extensions = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_ext}. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Create session
    session_id = str(uuid.uuid4())
    await create_session(session_id, file.filename or "unknown", document_type, language)
    
    # Save uploaded file temporarily
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{session_id}{file_ext}")
    
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 10MB."
        )
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Phase 2: Extract text and clauses
    try:
        raw_text, _ = await extract_text(file_path, file_ext)
        clauses, detected_type = await extract_clauses(raw_text, document_type)
        clauses_dicts = [
            {
                "clause_id": c.clause_id,
                "clause_text": c.clause_text,
                "category": c.category.value if hasattr(c.category, "value") else str(c.category)
            }
            for c in clauses
        ]
        await save_document(session_id, raw_text, clauses_dicts)
        await update_session_status(session_id, "extracted")
    except Exception as e:
        print(f"Extraction during upload failed (will retry on websocket): {e}")
    
    return {
        "session_id": session_id,
        "document_name": file.filename,
        "status": "uploaded",
        "message": "Document uploaded. Use WebSocket to start analysis."
    }

# === 1-Click Demo Launcher ===
@app.post("/api/demo/{demo_type}")
async def load_demo_document(demo_type: str = "rental"):
    """Instant 1-click demo document loader for seamless testing."""
    session_id = str(uuid.uuid4())
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    if demo_type == "case_study":
        doc_name = "Indian_Law_Case_Study_BNS_2023.pdf"
        target_path = os.path.join(upload_dir, f"{session_id}.pdf")
        source_path = os.path.join(upload_dir, "902b6501-320a-4f1d-ae7e-533dc3bd2b83.pdf")
        if os.path.exists(source_path):
            import shutil
            shutil.copyfile(source_path, target_path)
            raw_text, _ = await extract_text(target_path, ".pdf")
        else:
            raw_text = "Illustrative Indian Law Case Study under BNS 318(4) and BNS 336(3)."
            with open(os.path.join(upload_dir, f"{session_id}.txt"), "w", encoding="utf-8") as f:
                f.write(raw_text)
    else:
        # Standard rental agreement
        doc_name = "Residential_Rental_Agreement_Bangalore.txt"
        sample_path = os.path.join(os.path.dirname(__file__), "test_data", "sample_rental_agreement.txt")
        if os.path.exists(sample_path):
            with open(sample_path, "r", encoding="utf-8") as f:
                raw_text = f.read()
        else:
            raw_text = "Standard 11-Month Residential Rental Agreement with 10-Month Security Deposit."
        target_path = os.path.join(upload_dir, f"{session_id}.txt")
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(raw_text)

    await create_session(session_id, doc_name, "rental" if demo_type == "rental" else "case_study", "en")
    
    # Extract clauses immediately
    try:
        clauses, detected_type = await extract_clauses(raw_text)
        clauses_dicts = [
            {
                "clause_id": c.clause_id,
                "clause_text": c.clause_text,
                "category": c.category.value if hasattr(c.category, "value") else str(c.category)
            }
            for c in clauses
        ]
        await save_document(session_id, raw_text, clauses_dicts)
        await update_session_status(session_id, "extracted")
    except Exception as e:
        print(f"Demo extraction error: {e}")

    return {
        "session_id": session_id,
        "document_name": doc_name,
        "status": "ready"
    }

# === Session Status ===
@app.get("/api/session/{session_id}")
async def get_session_status(session_id: str):
    """Get the current status of an analysis session."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# === Disclaimer ===
@app.get("/api/disclaimer")
async def get_disclaimer():
    return {
        "text": (
            "IMPORTANT DISCLAIMER: ShadowCounsel is an informational tool only. "
            "It is NOT a substitute for advice from a licensed advocate. "
            "For legal aid, contact your nearest District Legal Services Authority (DLSA)."
        ),
        "dlsa_link": "https://nalsa.gov.in/lsam/",
        "is_legal_advice": False
    }

# === What-If Scenario ===
@app.post("/api/whatif")
async def whatif_scenario(query: dict):
    """Run a what-if scenario against the analyzed contract."""
    session_id = query.get("session_id")
    scenario = query.get("scenario")
    if not session_id or not scenario:
        raise HTTPException(status_code=400, detail="session_id and scenario are required")
    if len(scenario) > 2000:
        raise HTTPException(status_code=400, detail="Scenario text too long. Maximum 2000 characters.")
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    from whatif.simulator import simulate_scenario
    result = await simulate_scenario(session_id, scenario)
    return result

# === Negotiation Pack & Lawyer Checklist ===
@app.get("/api/negotiation/{session_id}")
async def get_negotiation_pack_endpoint(session_id: str):
    """Get negotiation pack with redline suggestions and questions for legal counsel."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    from negotiation.generator import generate_negotiation_pack
    pack = await generate_negotiation_pack(session_id)
    return pack

# Mount WebSocket router
app.include_router(ws_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
