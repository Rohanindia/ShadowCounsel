<div align="center">

# ⚖️ ShadowCounsel

### *Adversarial AI Legal Document Intelligence for India*

**Three AI agents. One contract. Zero blind spots.**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq-LLM-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 🏆 Built for the **"AI for Legal Assistance & Access"** Hackathon Challenge

</div>

---

## 🎯 Problem Statement Alignment

> *"Legal information can often be complex, difficult to understand, and challenging to navigate without professional assistance."*

ShadowCounsel directly addresses every dimension of the hackathon use case:

| Hackathon Use Case | ShadowCounsel Feature |
|---|---|
| ✅ Simplifying complex legal documents | **Auto-summarization** — Every clause distilled into plain-language risk analysis |
| ✅ Comparing contracts, agreements, or policies | **1-Click Demo Library** — Upload any contract; compare with sample benchmarks |
| ✅ Highlighting important clauses, obligations, risks | **3-Agent Adversarial Debate** — Advocate, Shadow Counsel & Arbiter score each clause |
| ✅ Answering questions based on provided legal documents | **Contextual Q&A** — What-If Simulator answers consequence questions from your document |
| ✅ Helping users understand their options and next steps | **Practical Next Steps** — Every scenario generates immediate, prioritized action items |
| ✅ Generating summaries, checklists, or actionable outputs | **Negotiation Pack** — Redlines + Lawyer Consultation Checklist in one click |
| ✅ Helping users prepare for a legal professional | **Lawyer Question Generator** — 4–6 targeted questions ready to bring to DLSA/advocate |

### ⚖️ Legal Boundary
ShadowCounsel provides **information and assistance only** — not professional legal advice. All outputs include prominent NALSA/DLSA referral links. The system explicitly tells users *when* to consult a qualified advocate.

---

## 🚀 What Makes ShadowCounsel Different

Unlike a simple chatbot that summarizes documents, ShadowCounsel **stress-tests your contract using adversarial AI** — the same way a lawyer would, but faster and accessible to everyone.

```
Your Document → 3 AI Agents Debate Every Clause → You See Both Sides → Risk Score → Action Plan
```

**Most legal AI tools** tell you what a clause *says*.  
**ShadowCounsel** tells you what a clause *does to you* — and how to fight back.

---

## ✨ Core Features

### 🛡️👹⚖️ Live 3-Agent Adversarial Debate
The flagship feature. Three AI agents are pitted against each other for every extracted clause:

| Agent | Role | Perspective |
|---|---|---|
| 🛡️ **Advocate** | Your Defender | Protects your rights, flags favorable terms, identifies what you can enforce |
| 👹 **Shadow Counsel** | Counterparty's Weapon | Exploits ambiguities, surfaces how the other party could use the clause against you |
| ⚖️ **Arbiter** | Neutral Verdict | Synthesizes both sides, assigns **High / Medium / Low** risk, grounds in Indian statutes |

All three agents stream **live** via WebSocket — watch the debate unfold in real time.

### 🔬 What-If Scenario Sandbox
> *"What happens if I miss the rent payment by 15 days?"*
> *"What if the other party breaches the NDA clause?"*

Enter any hypothetical. The simulator returns:
- 💰 **Financial Exposure Range** (e.g., ₹5,000 – ₹50,000 penalty)
- ⚖️ **Legal Consequences** grounded in Indian law
- 🗓️ **Timeline to Resolution** (days, months, litigation years)
- 📊 **Likelihood Assessment** (High / Medium / Low probability)
- 🎯 **Practical Next Steps** — immediate actions you can take today

### 📋 Negotiation Pack & Lawyer Consultation Checklist
One click generates a professional-grade package:
- **Executive Risk Summary** — overall document health at a glance
- **Redline Suggestions** — original clause → counter-draft with rationale + statute basis
- **Lawyer Checklist** — 4–6 targeted, document-specific questions to bring to a legal consultation (DLSA / private advocate)

### 📄 Universal Document OCR
Upload any legal document format:
- 📑 **PDF** — pdfplumber text extraction
- 📝 **DOCX** — python-docx paragraph extraction  
- 🖼️ **Scanned Images** — Tesseract OCR (PNG, JPG, TIFF)

### 🇮🇳 Indian Statute Grounding
Every analysis references real Indian law:
- **Indian Contract Act, 1872** (ICA)
- **Bharatiya Nyaya Sanhita, 2023** (BNS) — successor to IPC
- **Bharatiya Nagarik Suraksha Sanhita, 2023** (BNSS)
- **Consumer Protection Act, 2019**
- **Transfer of Property Act, 1882**
- **NALSA / DLSA** legal aid access information

### ⚡ 1-Click Demo Library
No document? No problem. Launch pre-loaded case studies instantly:
- 🏠 **Residential Lease Agreement** — Landlord-heavy rental with hidden penalty clauses
- 📋 **BNS 2023 Case Study** — Criminal law application brief

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER (Next.js 15)                │
│  Upload → Hero Page → Analyze Workspace → 3-Tab Interface   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                   FastAPI Backend (Python 3.12)              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ /api/upload  │  │ /api/whatif  │  │/api/negotiation/ │  │
│  │ OCR Pipeline │  │  Simulator   │  │    Generator     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────▼─────────────────▼────────────────────▼─────────┐  │
│  │              Groq LLM (openai/gpt-oss-20b)             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         WebSocket /ws/debate/{session_id}            │  │
│  │  🛡️ Advocate → 👹 Shadow Counsel → ⚖️ Arbiter        │  │
│  │           (Streams live, clause by clause)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐                                           │
│  │  SQLite DB  │  (sessions, clauses, debate history)     │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Session Flow
```
Upload Document
    │
    ▼
/api/upload → OCR Extract Text → Groq Clause Extraction → Save Session (SQLite)
    │
    ▼
Redirect to /analyze/{session_id}
    │
    ├──► Tab 1: WebSocket → 3-Agent Debate (streams live)
    ├──► Tab 2: What-If Input → /api/whatif → Consequences
    └──► Tab 3: /api/negotiation/{id} → Redlines + Checklist
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **LLM** | Groq (`openai/gpt-oss-20b`) | Ultra-fast inference for all 3 agents + extraction |
| **Backend** | FastAPI + Python 3.12 | REST API + WebSocket streaming |
| **Database** | SQLite + aiosqlite | Session & debate persistence |
| **OCR** | pdfplumber + python-docx + Tesseract | Multi-format document extraction |
| **Frontend** | Next.js 15 + React 19 | SSR app router |
| **Styling** | Tailwind CSS v4 | Utility-first dark luxury design |
| **Fonts** | Plus Jakarta Sans + Playfair Display | Authority + readability |
| **Streaming** | Native WebSocket | Real-time debate rendering |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- [Groq API Key](https://console.groq.com) (free tier available)
- Tesseract OCR (for image/scanned PDF support): [Download](https://github.com/UB-Mannheim/tesseract/wiki)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PromptWar.git
cd PromptWar
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your Groq API key:
# GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be live at: **http://localhost:8000**  
API docs at: **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be live at: **http://localhost:3000**

### 4. Open the App
Navigate to **http://localhost:3000** and:
- Upload any legal document (PDF, DOCX, or image)
- Or click a **1-Click Demo** to instantly load a sample case

---

## 📁 Project Structure

```
PromptWar/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Environment & model configuration
│   ├── database.py                # SQLite session management
│   ├── models.py                  # Pydantic request/response models
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment template (safe to commit)
│   ├── agents/
│   │   ├── advocate.py            # 🛡️ Advocate agent (streaming)
│   │   ├── shadow_party.py        # 👹 Shadow Counsel agent (streaming)
│   │   ├── arbiter.py             # ⚖️ Arbiter agent (streaming + verdict)
│   │   └── prompts.py             # All 3 system prompts (Indian law grounded)
│   ├── ocr/
│   │   ├── pipeline.py            # PDF / DOCX / Image text extraction
│   │   └── clause_extractor.py    # Groq-powered clause segmentation
│   ├── websocket/
│   │   └── debate_stream.py       # WebSocket endpoint (full debate stream)
│   ├── whatif/
│   │   └── simulator.py           # What-If consequence engine
│   ├── negotiation/
│   │   └── generator.py           # Redlines + Lawyer checklist generator
│   └── test_data/
│       └── sample_rental_agreement.txt
│
└── frontend/
    ├── app/
    │   ├── layout.tsx             # Root layout (fonts, metadata)
    │   ├── globals.css            # Dark luxury design system
    │   ├── page.tsx               # Hero / upload page
    │   └── analyze/[sessionId]/
    │       └── page.tsx           # Debate workspace (3-tab interface)
    └── components/
        ├── DocumentUpload.tsx     # Glassmorphic drop-zone
        ├── DebateStream.tsx       # Live HUD + clause cards
        ├── ClauseCard.tsx         # Risk-colored clause container
        ├── AgentMessage.tsx       # Per-agent styled message
        ├── RiskBadge.tsx          # Glowing risk indicators
        ├── WhatIfPanel.tsx        # Scenario explorer
        ├── NegotiationPack.tsx    # Redlines + checklist
        └── Disclaimer.tsx         # NALSA/DLSA legal boundary footer
```

---

## 🔒 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (defaults shown)
GROQ_MODEL=openai/gpt-oss-20b
DATABASE_URL=./shadowcounsel.db
MAX_FILE_SIZE_MB=10
```

> **Never commit your `.env` file.** It is protected by `.gitignore`.

---

## ⚠️ Legal Disclaimer

ShadowCounsel is an **AI-powered legal information tool**. It is designed to:

- ✅ Help you **understand** legal documents
- ✅ **Identify potential risks** in contracts and agreements
- ✅ **Prepare questions** for legal consultations
- ✅ Provide **general legal information** grounded in Indian statutes

It does **NOT**:

- ❌ Provide professional legal advice
- ❌ Establish a lawyer-client relationship
- ❌ Replace consultation with a qualified advocate

**For free legal aid in India:**
- [NALSA — National Legal Services Authority](https://nalsa.gov.in)
- [DLSA — District Legal Services Authority](https://nalsa.gov.in/lsas) (find your nearest office)
- Toll-free Legal Aid Helpline: **15100**

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ⚖️ for equal access to legal understanding**

*ShadowCounsel — Because everyone deserves to know what they're signing.*

[![NALSA](https://img.shields.io/badge/Free_Legal_Aid-NALSA-green?style=flat-square)](https://nalsa.gov.in)
[![DLSA](https://img.shields.io/badge/Find_Your-DLSA-blue?style=flat-square)](https://nalsa.gov.in/lsas)
[![Helpline](https://img.shields.io/badge/Legal_Aid_Helpline-15100-red?style=flat-square)](tel:15100)

</div>
