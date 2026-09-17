# Financial Passport — UI Design System & Frontend Spec

Built on **shadcn/ui** — reference style: navy fintech dashboard (StackMenu-style)

This doc provides a concrete, shadcn-mapped design system so every page comes out visually consistent, specifically tailored to the Health/Fintech intersection (Clinic / Pharmacy / Bank).

---

## 1. Design Tokens

### Colors
| Token | Hex | Use |
| --- | --- | --- |
| `--primary` (navy) | `#1B2559` | Sidebar active state, primary buttons, dark metric card |
| `--primary-light` | `#3B4B9E` | Hover states |
| `--accent-blue` | `#4C8DFF` | "Settled" status, secondary chart series, links |
| `--background` | `#F7F8FC` | App background |
| `--surface` | `#FFFFFF` | Cards, panels, sidebar |
| `--border` | `#E7E9F3` | Card borders, dividers |
| `--muted-foreground` | `#6B7280` | Secondary text, labels |
| `--foreground` | `#111827` | Primary text |
| `--success` | `#16A34A` | "Attested" status, Positive badges |
| `--success-bg` | `#DCFCE7` | Success badge background |
| `--muted-status` | `#9CA3AF` | "Self-reported" (grey) status |

*Map these into `tailwind.config` / shadcn's CSS variables so every component inherits them automatically.*

### Typography & Shape
- **Font**: Single sans-serif family (Inter or Geist) — matches the reference exactly. Never use emojis; strictly use `lucide-react` icons.
- **Radius**: `rounded-2xl` on cards and panels, `rounded-full` on badges/avatars, `rounded-lg` on buttons/inputs.
- **Shadow**: One soft shadow token uniformly on cards (`shadow-sm`, `0 1px 3px rgba(16,24,40,0.06)`).
- **Spacing**: Cards use `p-6`, grid gaps `gap-5` / `gap-6`.

---

## 2. Layout Structure

Five core pages, one shared layout, plus two operational screens.

```text
┌──────────┬─────────────────────────────────────────────┐
│          │  Topbar: Business Name · Role Switcher       │
│ Left Nav │          (Clinic / Pharmacy / Owner / Bank)  │
│ (fixed,  ├─────────────────────────────────────────────┤
│  240px)  │  Page header: title + subtitle    [period ▾] │
│          │                                                │
│ Logo     │  ┌─────┐┌─────┐┌─────┐┌─────┐┌───────────┐  │
│ 5 Core   │  │metric││metric││metric││metric││dark metric│  │
│ Pages    │  └─────┘└─────┘└─────┘└─────┘└───────────┘  │
│          │                                                │
│          │  ┌───────────────────────┐  ┌───────────────┐ │
│          │  │  Coverage Stack Bar   │  │ Plain Text    │ │
│          │  │                       │  │ Health Summary│ │
│          │  └───────────────────────┘  └───────────────┘ │
└──────────┴─────────────────────────────────────────────┘
```

- **Role Switcher**: The header contains a dropdown to switch roles. The active role changes what data/screens are visible (essential for the demo).
- **Operational Screens**: Accessible via the Role Switcher (e.g., Prescriber screen to create prescriptions/get code; Pharmacist screen to enter code/dispense).

---

## 3. Page-by-Page UI Mapping

### 1. Dashboard / Business Health
- **Metrics**: Revenue, expenses, profit, cash position as cards.
- **Coverage Bar**: A stacked horizontal bar showing the proportion of activity that is:
  - **Recorded** (Grey)
  - **Settled** (Blue)
  - **Attested** (Green)
- **Health Explanation**: Plain sentences explaining the business health, with a "View evidence" link.

### 2. Transactions
- **Table**: Date, description, amount, type.
- **Attestation Badge**: Each row has a strict badge system:
  - Grey = Self-reported
  - Blue = Settled
  - Green = Attested
- **Action**: Click a row → Slide-over panel (Sheet) with details and the **evidence chain** (if attested).

### 3. Inventory
- **Table**: Products, stock, cost, price, value. Low-stock highlighted.
- **Action**: Click a product → Slide-over panel showing stock movements.

### 4. Verified Activity (The Pitch Page)
- **The Feed**: A visually striking list of activity cards.
- **Activity Card**: Shows the flow (e.g., *Clinic A → Pharmacy B*).
- **Progress Trail**: A 5-step horizontal stepper inside the card:
  `Prescribed → Verified → Dispensed → Stock Reduced → Settled`
- *Note: This is the core pitch of the app. Make it the best-looking page.*

### 5. Financial Passport
- **Header**: Business identity and coverage numbers large.
- **Metrics**: Readiness score, flags, and metric cards.
- **Interactivity**: Every metric is clickable, leading to an evidence drill-down.

### Operational Screens (Hidden from main nav)
- **Prescriber**: Create prescription, get code.
- **Pharmacist**: Enter code, verify, dispense.

---

## 4. Component Inventory (shadcn mapping)

| UI pattern seen | shadcn/ui component(s) | Notes |
| --- | --- | --- |
| **Sidebar navigation** | `Sidebar` (or `NavigationMenu`) | 5 core links |
| **Role Switcher** | `DropdownMenu` | Switch between Clinic/Pharmacy/Bank |
| **Metric card** | `Card` + `CardHeader` | Icon in tinted circle, big number, label |
| **Dark hero metric card**| `Card` | `bg-primary` text-primary-foreground override |
| **Coverage Bar** | `Progress` (Customized) | Stacked variants for recorded/settled/attested |
| **Progress Trail** | Custom Stepper / Flex row | 5-step horizontal nodes with connecting lines |
| **Status badge** | `Badge` | Core variants: grey/blue/green |
| **Transaction Details** | `Sheet` (side="right") | Tabs for Details / Evidence / Activity Log |
| **Data tables** | `Table` | Zebra-free, hairline row dividers only |

*Reusing these core components (MetricCard, StatusBadge, DetailSheet, ActivityListRow) across all 5 pages is what will make the MVP feel like one coherent product.*
