# Financial Passport

> **Wema Hackathon Submission**

## 🏆 Hackathon Judging Criteria

### 1. Project Description
**Financial Passport** is a system that helps small businesses record their activity, understand their finances, and gradually build a verifiable financial history. We don't just record what a business says happened — we attach evidence to business activity using cryptographic proofs and multi-party attestation. This allows businesses to build a reliable financial history that can be fully trusted by banks, lenders, and partners. 

Our core pipeline is: `Business Activity → Records → Evidence → Financial Intelligence → Business Health → Financial Passport`

Every transaction has an attestation level (Grey: Self-Reported, Blue: Settled, Green: Attested) based on the evidence chain backing it up.

### 2. Live Frontend Application
👉 **[Insert Frontend Deployment Link Here]**

### 3. Live Backend API
👉 **[Insert Backend API Link Here]**

### 4. Recorded Loom Demo
👉 **[Insert Loom Demo Link Here]**

---

## 🏗️ Product Spec & Architecture

### The Pipeline
| Stage | What it means |
| --- | --- |
| **Business Activity** | A sale, a purchase, a stock movement, a payment — anything that happens |
| **Records** | The activity is logged as a structured transaction/inventory record |
| **Evidence** | Receipts, photos, POS slips, bank alerts, supplier invoices attached to a record |
| **Financial Intelligence** | The system derives patterns, cash flow, margins, trends from verified records |
| **Business Health** | A digestible score/summary of how the business is doing |
| **Financial Passport** | The exportable, shareable, evidence-backed financial history of the business |

*This story guides every UI decision: every screen makes it obvious whether something is "just recorded" or "verified with evidence."*

### Tech Stack
- **Monorepo Structure**
- **Frontend**: TanStack Start + React + shadcn/ui + Tailwind CSS
- **Backend**: Python FastAPI + SQLModel + PostgreSQL

### Mock Data Fallback Strategy
Since hackathon API contracts can be volatile, the frontend is structured to gracefully fall back to an in-memory database.
By changing the `VITE_USE_MOCKS` environment variable, the application instantly switches between real Python FastAPI endpoints and realistic in-memory mock fixtures.
