# Financial Passport — Product Spec & UI Build Plan

**Wema Hackathon**

## 1. Core Idea
We are not building another accounting or inventory tool. We are building a system that helps small businesses record their activity, understand their finances, and gradually build a verifiable financial history.

We don't just record what a business says happened — we attach evidence to business activity, so the business builds a financial history that can be trusted by banks, lenders, and partners.

### The Pipeline
`Business Activity → Records → Evidence → Financial Intelligence → Business Health → Financial Passport`

| Stage | What it means |
| --- | --- |
| **Business Activity** | A sale, a purchase, a stock movement, a payment — anything that happens |
| **Records** | The activity is logged as a structured transaction/inventory record |
| **Evidence** | Receipts, photos, POS slips, bank alerts, supplier invoices attached to a record |
| **Financial Intelligence** | The system derives patterns, cash flow, margins, trends from verified records |
| **Business Health** | A digestible score/summary of how the business is doing |
| **Financial Passport** | The exportable, shareable, evidence-backed financial history of the business |

*This story should guide every UI decision: every screen should make it obvious whether something is "just recorded" or "verified with evidence."*

---

## 2. MVP Scope
To ship in hackathon time, the MVP is 5 pages:
1. **Dashboard / Business Health**
2. **Transactions**
3. **Inventory**
4. **Verified Activity**
5. **Financial Passport**

*Note: Transaction Details is not a separate page — it's a slide-over panel opened from the Transactions (and Verified Activity) list.*

---

## 3. Tech Stack
- **Monorepo**: Vite+ (VoidZero)
- **Frontend**: TanStack Start + React + shadcn/ui + Tailwind CSS
- **Backend**: Python FastAPI

---

## 4. Mock Data Layer Strategy
Since the API contract isn't settled yet, the frontend is structured so that swapping mocks for real API calls is a one-file change.

- Use a `src/services/` folder with one interface per domain.
- Two implementations: `mock` and `api`.
- UI code only imports from `services/`, never directly from mock data or fetch calls.
- Use an environment flag (`VITE_USE_MOCKS`) to toggle between mock fixtures and real API calls.
