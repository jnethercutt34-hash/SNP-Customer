# SNP-Customer — TODOS
_Created: 2026-03-14 (Plan Review)_

---

## P1 — Must Have

### TODO-1: PDF/Print Export for Configuration Summary
- **What:** Add "Download PDF" / "Print" button on /configure/summary
- **Why:** Customers need to share configs with their team / procurement
- **Approach:** Start with print-optimized CSS (`@media print`). Consider `@react-pdf/renderer` for branded PDFs in Phase 2.
- **Effort:** M (2-3 hours for print CSS, 4-5 hours for @react-pdf)
- **Depends on:** Configurator + summary page must exist first
- **Status:** Deferred to after core build

### TODO-2: SESSION-CONTEXT.md
- **What:** Write comprehensive session context document (like SNP-Onboard has)
- **Why:** Enables future agent sessions and human engineers to onboard quickly
- **Effort:** S (30 min at end of first build session)
- **Depends on:** Core build must be complete first
- **Status:** Deferred to end of first build session

---

## P2 — Should Have

### TODO-3: Config URL Sharing
- **What:** Encode configuration in URL hash (base64 JSON) for shareable links
- **Why:** Sales engineer configures with customer, sends link. Customer opens on own machine.
- **Approach:** Base64-encoded JSON of slot config (~200 chars). Decode on page load, merge into context.
- **Effort:** S (1-2 hours)
- **Depends on:** Config context must be stable
- **Status:** Deferred

---

## P3 — Delight / Vision

### TODO-4: Animated SWaP-C Gauges
- **What:** CSS transitions on power/weight gauge bars when config changes. Number count-up animation.
- **Why:** Makes config changes feel impactful — "I can feel the tradeoff"
- **Effort:** S (~30 min — CSS transitions + useEffect counter)
- **Status:** Deferred

### TODO-5: "What Changes?" Diff Tooltip
- **What:** Hover over a module option in slot panel → tooltip shows delta vs current selection (+3W, +15g, adds 4× 10GBase-T)
- **Why:** Instant tradeoff visibility without select-and-compare mental math
- **Effort:** S (~30 min)
- **Status:** Deferred

### TODO-6: Dark/Light Mode Toggle
- **What:** Navbar toggle for light theme. Define light CSS variables.
- **Why:** Useful for projector presentations and printing
- **Effort:** M (~1-2 hours)
- **Status:** Deferred

### TODO-7: Configuration Comparison vs Baseline
- **What:** "Compare with Baseline" button on summary page. Side-by-side diff: changes, power/weight delta, interfaces gained/lost.
- **Why:** Reuses proven diff pattern from SNP-Onboard. Helps customer understand what their choices mean.
- **Effort:** S (~30 min — reuse getBuildDifferences pattern)
- **Status:** Deferred
