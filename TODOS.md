# SNP-Customer — TODOS
_Created: 2026-03-14 (Plan Review) · Updated: 2026-03-15_

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
