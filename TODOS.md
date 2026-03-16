# SNP-Customer — TODOS
_Created: 2026-03-14 (Plan Review) · Updated: 2026-03-15_

> **Phase 1 Status: ✅ COMPLETE** — All 9 TODOs done, test suite passing (51 tests), pushed to GitHub.

---

## P1 — Must Have

### TODO-1: PDF/Print Export for Configuration Summary ✅
- **What:** Add "Download PDF" / "Print" button on /configure/summary
- **Why:** Customers need to share configs with their team / procurement
- **Approach:** Print-optimized CSS (`@media print`) with white background, readable colors, page breaks, branded print header with date/stats.
- **Status:** ✅ Complete — full print CSS with A4 layout, branded header, `no-print` class system

### TODO-2: SESSION-CONTEXT.md ✅
- **What:** Write comprehensive session context document
- **Why:** Enables future agent sessions and human engineers to onboard quickly
- **Status:** ✅ Complete — 12-section document covering architecture, data flow, sanitization rules, routes

---

## P2 — Should Have

### TODO-3: Config URL Sharing ✅
- **What:** Encode configuration in URL query param (base64 JSON) for shareable links
- **Why:** Sales engineer configures with customer, sends link. Customer opens on own machine.
- **Approach:** Compact representation (only configurable choices: s2, s3, m4, m6). Base64-encoded. Decoded on page load with validation. URL cleaned after hydration.
- **Status:** ✅ Complete — `encodeConfigToUrl()`, URL hydration in ConfigProvider, "Share Configuration Link" button on summary page

---

## P3 — Delight / Vision

### TODO-4: Animated SWaP-C Gauges ✅
- **What:** CSS transitions on power/weight gauge bars when config changes. Number count-up animation.
- **Why:** Makes config changes feel impactful — "I can feel the tradeoff"
- **Approach:** Custom `useAnimatedValue` hook with ease-out cubic easing. 400ms duration. `tabular-nums` for stable layout during animation.
- **Status:** ✅ Complete

### TODO-5: "What Changes?" Diff Tooltip ✅
- **What:** Module option cards in slot panel show delta vs current selection (+3W, +15g)
- **Why:** Instant tradeoff visibility without select-and-compare mental math
- **Approach:** Compute powerDelta/weightDelta in SlotPanel, pass to ModuleCard. Green for savings, amber for increases.
- **Status:** ✅ Complete — shows delta on every non-selected option card

### TODO-6: Dark/Light Mode Toggle ✅
- **What:** Navbar toggle for light theme. Define light CSS variables.
- **Why:** Useful for projector presentations and printing
- **Approach:** `.light` CSS class with full variable override. Toggle in navbar with localStorage persistence. Sun/moon icons.
- **Status:** ✅ Complete

### TODO-7: Configuration Comparison vs Baseline ✅
- **What:** "Compare with Baseline" section on summary page. Diff: changes, power/weight delta, interfaces gained/lost.
- **Why:** Helps customer understand what their choices mean vs the reference build.
- **Approach:** BaselineComparison component compares current slots against BASELINE_CONFIG. Shows power/weight deltas and slot-level change list with from→to.
- **Status:** ✅ Complete — auto-shows on summary, expandable details

---

## P2 — Added by Eng Review

### TODO-8: Sanitization Audit Checklist / Script ✅
- **What:** Pre-demo script that checks all source files for leaked internal details.
- **Why:** Prevents accidental vendor P/N or customer name leaks.
- **Approach:** `scripts/sanitization-check.sh` (bash) and `scripts/sanitization-check.bat` (Windows). Checks: vendor P/Ns, customer build IDs, internal doc numbers, fault codes, GDMS references.
- **Status:** ✅ Complete — passes clean on current codebase

### TODO-9: Mobile/Tablet Responsiveness for Chassis Configurator ✅
- **What:** Make slot panels work on tablet/mobile. Touch-friendly.
- **Why:** Sales engineers demo on tablets during in-person meetings.
- **Approach:** Slot panel → bottom sheet on screens < 768px (md breakpoint). Drag handle indicator. Rounded top corners. 85vh max height. SVG viewBox scales naturally. Touch-specific instruction text.
- **Status:** ✅ Complete

---

## Phase 2 — Enhanced Demo Tool (~2-3 dev-weeks)

### TODO-10: Error Boundary
- **What:** React error boundary wrapping `/configure` route — catches render crashes, shows "reset config" recovery UI
- **Why:** Prevents white-screen crashes during demos
- **Priority:** P1

### TODO-11: PDF Export
- **What:** Generate branded PDF from configuration summary (`@react-pdf/renderer` or `html2canvas` + `jsPDF`)
- **Why:** Customers need downloadable docs for procurement. Print CSS works but dedicated PDF is more polished.
- **Priority:** P1

### TODO-12: Comparison Mode
- **What:** Side-by-side comparison of 2-3 saved configurations with delta columns for power, weight, interfaces
- **Why:** Customers evaluating trade-offs across mission profiles
- **Priority:** P2

### TODO-13: Module Image Assets
- **What:** Replace solid-color SVG faceplates with actual module photos or detailed technical illustrations
- **Why:** Visual fidelity for trade shows and customer demos
- **Depends on:** Asset pipeline from engineering
- **Priority:** P2

### TODO-14: Accessibility Audit
- **What:** Full WCAG 2.1 AA pass — keyboard nav for chassis slots, ARIA labels, focus management, screen reader testing
- **Why:** Compliance and usability for all customers
- **Priority:** P2

### TODO-15: E2E Tests
- **What:** Playwright tests for critical flows: wizard → configure → summary → share URL roundtrip
- **Why:** Catch regressions in user-facing flows
- **Priority:** P3

---

## Phase 3 — Customer Portal (~4-6 dev-weeks)

### TODO-16: Customer Authentication
- **What:** OAuth 2.0 / SSO login (Azure AD or Auth0). Per-customer config isolation. JWT sessions.
- **Depends on:** Auth provider selection
- **Priority:** P1

### TODO-17: Database Persistence
- **What:** Replace localStorage with server-side storage (PostgreSQL / Supabase). Configs per customer with timestamps + version history.
- **Depends on:** Hosting/DB decision
- **Priority:** P1

### TODO-18: Configuration History
- **What:** List of saved configs per customer — names, dates, restore, diff between versions
- **Depends on:** TODO-16, TODO-17
- **Priority:** P2

### TODO-19: Admin Dashboard
- **What:** Internal-only view for sales engineers to see all customer configs. Filter by customer, date, config type.
- **Depends on:** TODO-16, TODO-17 + role-based access
- **Priority:** P2

### TODO-20: Real-Time AI Knowledge Base
- **What:** Replace mock AI with RAG pipeline — vector embeddings (Pinecone/pgvector) + OpenAI streaming against sanitized docs
- **Depends on:** Document ingestion pipeline, embedding model selection
- **Priority:** P2

---

## Phase 4 — Sales Pipeline Integration (~6-8 dev-weeks)

### TODO-21: Quote Generation
- **What:** Auto-generate pricing estimates from configuration. PDF quote with terms & conditions.
- **Depends on:** Pricing data from finance/contracts
- **Priority:** P1

### TODO-22: CRM Integration
- **What:** Push configs + contact info to Salesforce/HubSpot as leads. Bidirectional sync.
- **Depends on:** CRM API access + credentials
- **Priority:** P1

### TODO-23: RFQ Workflow
- **What:** Customer submits Request for Quote from summary page. Routes to sales engineer with full config context. Status tracking.
- **Depends on:** TODO-16, TODO-21
- **Priority:** P2

### TODO-24: Multi-Chassis Configurations
- **What:** Configure multiple SNP units for larger deployments. Shared networking topology view.
- **Priority:** P3

### TODO-25: 3D Visualization
- **What:** Interactive 3D chassis model (Three.js / React Three Fiber). Rotate, zoom, click slots.
- **Why:** Higher visual impact for trade shows
- **Priority:** P3
