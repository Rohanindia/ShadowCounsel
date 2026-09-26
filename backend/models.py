from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime
import uuid

# === Enums ===
class DocumentType(str, Enum):
    RENTAL = "rental"
    LOAN_EMI = "loan_emi"
    EMPLOYMENT = "employment"
    GIG_PLATFORM = "gig_platform"
    INSURANCE = "insurance"
    UNKNOWN = "unknown"

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class AgentRole(str, Enum):
    ADVOCATE = "advocate"
    SHADOW_PARTY = "shadow_party"
    ARBITER = "arbiter"

class ClauseCategory(str, Enum):
    PARTIES_DEFINITIONS = "Parties & Definitions"
    AGREEMENT_DURATION = "Agreement Date & Duration"
    AUTO_RENEWAL = "Auto-Renewal / Renewal Term"
    NOTICE_PERIOD = "Notice Period"
    TERMINATION_CONVENIENCE = "Termination for Convenience"
    TERMINATION_CAUSE = "Termination for Cause"
    NON_COMPETE = "Non-Compete"
    EXCLUSIVITY = "Exclusivity"
    NON_SOLICITATION = "Non-Solicitation"
    INDEMNIFICATION = "Indemnification"
    LIABILITY_CAP = "Liability Cap"
    LIQUIDATED_DAMAGES = "Liquidated Damages / Penalty"
    SECURITY_DEPOSIT = "Security Deposit"
    RENT_ESCALATION = "Rent Escalation"
    MAINTENANCE_REPAIRS = "Maintenance & Repairs"
    PAYMENT_TERMS = "Payment Terms / EMI"
    INTEREST_LATE_FEES = "Interest & Late Fees"
    INSURANCE_OBLIGATIONS = "Insurance Obligations"
    DATA_SHARING_PRIVACY = "Data Sharing / Privacy"
    IP_ASSIGNMENT = "IP Assignment"
    GOVERNING_LAW = "Governing Law & Jurisdiction"
    DISPUTE_RESOLUTION = "Dispute Resolution / Arbitration"
    FORCE_MAJEURE = "Force Majeure"
    MISCELLANEOUS = "Miscellaneous / Catch-All"

# === Document Models ===
class ExtractedClause(BaseModel):
    clause_id: int
    clause_text: str
    category: ClauseCategory
    confidence: float = Field(ge=0.0, le=1.0)
    page_number: Optional[int] = None

class DocumentExtraction(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_name: str
    document_type: DocumentType
    raw_text: str
    clauses: List[ExtractedClause]
    extracted_at: datetime = Field(default_factory=datetime.utcnow)

# === RAG Models ===
class StatuteCitation(BaseModel):
    act_name: str
    section_number: str
    section_title: Optional[str] = None
    text_excerpt: str
    relevance_score: float

# === Agent Models ===
class AgentMessage(BaseModel):
    agent: AgentRole
    clause_id: int
    content: str
    citations: Optional[List[StatuteCitation]] = None
    risk_level: Optional[RiskLevel] = None

class ClauseVerdict(BaseModel):
    clause_id: int
    clause_text: str
    category: ClauseCategory
    advocate_analysis: str
    shadow_party_analysis: str
    arbiter_verdict: str
    risk_level: RiskLevel
    citations: List[StatuteCitation]
    redline_suggestion: Optional[str] = None

class DebateSummary(BaseModel):
    session_id: str
    document_name: str
    document_type: DocumentType
    clause_verdicts: List[ClauseVerdict]
    overall_risk: RiskLevel
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int

# === What-If Models ===
class WhatIfQuery(BaseModel):
    session_id: str
    scenario: str
    language: str = "en"

class WhatIfConsequence(BaseModel):
    matched_clause_id: int
    matched_clause_text: str
    financial_range: Optional[str] = None
    legal_consequences: str
    timeline: Optional[str] = None
    likelihood: str
    statute_citations: List[StatuteCitation]

class WhatIfResponse(BaseModel):
    scenario: str
    consequences: List[WhatIfConsequence]

# === WebSocket Event Models ===
class WSEvent(BaseModel):
    type: str
    data: Dict[str, Any] = {}

# === Negotiation Models ===
class RedlineSuggestion(BaseModel):
    clause_id: int
    original_text: str
    suggested_text: str
    rationale: str
    statute_basis: Optional[str] = None

class NegotiationPack(BaseModel):
    session_id: str
    high_risk_clauses: List[RedlineSuggestion]
    spoken_script: Optional[str] = None
    spoken_script_audio_b64: Optional[str] = None
