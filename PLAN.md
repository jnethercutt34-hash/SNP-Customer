# SNP-Customer — Build Plan
_Reviewed: 2026-03-14 · Mode: SCOPE EXPANSION_

---

## 1. What This App Is

A **customer-facing** interactive product configuration and reference tool for the SNP (Secure Network Processor). Prospective customers can explore the product at a high level, configure their own box via a guided wizard + interactive chassis, see real-time SWaP-C impact, and ask questions via an AI knowledge base — all without seeing other customer configurations or proprietary part numbers.

- **Framework:** Next.js 16, App Router, TypeScript, Tailwind CSS v4, shadcn/ui
- **Source of truth:** Forked UI patterns and data model from `C:\AI-Tools\SNP-Onboard`
- **Local path:** `C:\AI-Tools\SNP-Customer`

---

## 2. Core User Flow

```
Customer opens tool
        │
        ▼
┌──────────────┐
│   Overview   │  High-level product intro (sanitized, no part numbers)
│     /        │  "Configure Your SNP →" CTA
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│   Mission Wizard (/configure)                                │
│   Step 1: Orbit & Environment (LEO / pLEO)                   │
│   Step 2: Data Rate & Networking Needs                       │
│   Step 3: Timing & Crypto Requirements                       │
│   ──────────────────────────────────                         │
│   → Auto-recommends a starting configuration                 │
│   → "Skip Wizard" link for repeat visitors                   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│   Interactive Configurator (/configure, below wizard)        │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐    │
│   │  Interactive Chassis SVG (7-slot SpaceVPX)          │    │
│   │  Click any slot → slide-out panel with options      │    │
│   └─────────────────────────────────────────────────────┘    │
│                                                              │
│   ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│   │ SWaP-C Gauges│ │  Interface   │ │ [Reset to Baseline]│  │
│   │ Power: XX W  │ │  Summary     │ │ [View Summary →]   │  │
│   │ Weight: XX g │ │  Connectors  │ │                    │  │
│   │ Margin: XX%  │ │  Speeds      │ │                    │  │
│   └──────────────┘ └──────────────┘ └────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│   Configuration Summary (/configure/summary)                 │
│   Full slot-by-slot breakdown, SWaP-C totals, interfaces     │
│   Exportable / printable                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Pages & Routes

| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Overview — high-level product intro, architecture cards, mezzanine options, CTA |
| `/configure` | `src/app/configure/page.tsx` | Mission wizard + interactive chassis configurator (CSR) |
| `/configure/summary` | `src/app/configure/summary/page.tsx` | Configuration summary — exportable/printable |
| `/modules/[id]` | `src/app/modules/[id]/page.tsx` | Sanitized module detail — specs, no BOM/part numbers |
| `/knowledge-base` | `src/app/knowledge-base/page.tsx` | AI Q&A against sanitized customer documents |
| `/api/chat` | `src/app/api/chat/route.ts` | AI backend handler (forked from SNP-Onboard) |

---

## 4. Architecture

### State Management
- **React Context + useReducer** with localStorage persistence
- Context wraps `/configure` route via layout
- `useReducer` handles slot mutations (SET_SLOT_MODULE, RESET, SET_MISSION_PROFILE)
- `useEffect` syncs state to localStorage (wrapped in try/catch for Safari private browsing / quota)
- On hydration: validate loaded config against current schema, fall back to baseline on mismatch

### Data Layer (sanitized — no part numbers, no customer names)
- `product-catalog.ts` — Module options, slot constraints, power/weight data
- `module-specs.ts` — Sanitized specs per module (capability descriptions, interfaces, connectors)
- `config-context.tsx` — React Context + useReducer + localStorage sync

### Slot Constraints
```
Slot 1: PSU Red (fixed — not configurable)
Slot 2: Spare → Expansion Module options or empty
Slot 3: Spare → Expansion Module options or empty
Slot 4: GPP Red (fixed) + Mezzanine selector (Optical / Copper / QSFP / QSFP Passive)
Slot 5: Crypto Module (fixed — not configurable)
Slot 6: GPP Black (fixed) + Mezzanine selector
Slot 7: PSU Black (fixed — not configurable)
```

Configurable decisions for the customer:
1. **Slot 4 mezzanine** — which networking mezzanine on GPP Red
2. **Slot 6 mezzanine** — which networking mezzanine on GPP Black
3. **Slot 2** — empty or expansion module (e.g., Timing/Atomic Clock)
4. **Slot 3** — empty or expansion module

### UI Interaction: Click-to-Open Slot Panels
- Click a configurable slot in the chassis SVG
- Slide-out panel shows compatible modules as cards with key specs
- Select a module → state updates → chassis SVG updates → SWaP-C gauges update
- Panel shows: module name, description, power, weight, key interfaces

### Mission Wizard (primary entry point)
- 3-step flow: Orbit → Networking → Timing/Crypto
- Auto-recommends a configuration based on answers
- "Skip Wizard" link drops to baseline config + interactive chassis
- Wizard state is component-local (not persisted — only the final config is persisted)

---

## 5. File Structure

```
src/
  app/
    layout.tsx                        Global layout + navbar + ConfigProvider
    page.tsx                          Overview (sanitized, high-level)
    configure/
      page.tsx                        Mission wizard + interactive configurator
      summary/page.tsx                Exportable configuration summary
    modules/
      [id]/page.tsx                   Sanitized module detail pages
    knowledge-base/page.tsx           AI Q&A (forked from SNP-Onboard)
    api/chat/route.ts                 AI backend (forked)
  components/
    navbar.tsx                        Simplified nav (Overview · Configure · Knowledge Base)
    interactive-chassis.tsx           Click-to-configure chassis SVG
    mission-wizard.tsx                3-step guided wizard
    swap-gauges.tsx                   Power/weight gauges + margin indicators
    interface-summary.tsx             Connectors/speeds/protocols readout
    slot-panel.tsx                    Slide-out module selection panel
    config-export.tsx                 Print/export functionality
    answer-card.tsx                   Knowledge base result card (forked)
    ui/                               shadcn/ui primitives (forked from SNP-Onboard)
  lib/
    product-catalog.ts                Sanitized module catalog + slot constraints
    module-specs.ts                   Sanitized module specs (no P/Ns)
    config-context.tsx                React Context + useReducer + localStorage
    document-store.ts                 Server-side doc ingestion (forked)
    mock-ai.ts                        Mock AI responses (forked, sanitized)
    utils.ts                          cn() utility
public/
  documents/                          Customer-sanitized docs (ICD, IDD, etc.)
```

---

## 6. What's Forked from SNP-Onboard

| Source file | Target | Changes |
|---|---|---|
| `globals.css` | `globals.css` | Identical — same dark aerospace theme |
| `components/ui/*` | `components/ui/*` | Identical — all shadcn/ui primitives |
| `layout.tsx` | `layout.tsx` | Simplified title, add ConfigProvider wrapper |
| `components/navbar.tsx` | `components/navbar.tsx` | Reduced to 3-4 links |
| `chassis-diagram.tsx` | `interactive-chassis.tsx` | Make slots clickable, add hover states, onClick handlers |
| `swap/page.tsx` | `swap-gauges.tsx` | Extract gauge logic into component, drive from config context |
| `mock-hardware.ts` types | `product-catalog.ts` | Keep types, sanitize data (no P/Ns), add slot constraints |
| `mock-components.ts` | `module-specs.ts` | Sanitize (remove BOM, datasheets with P/Ns) |
| `knowledge-base/page.tsx` | `knowledge-base/page.tsx` | Fork with minor wording changes |
| `api/chat/route.ts` | `api/chat/route.ts` | Fork with sanitized system prompt |
| `document-store.ts` | `document-store.ts` | Identical |
| `answer-card.tsx` | `answer-card.tsx` | Identical |
| `mock-ai.ts` | `mock-ai.ts` | Fork with sanitized responses |
| `utils.ts` | `utils.ts` | Identical |

---

## 7. What's NOT in Scope

| Item | Rationale |
|---|---|
| Customer login / auth | No multi-tenant need yet. Phase 2. |
| Database persistence | localStorage sufficient for demo tool. Phase 2. |
| Quote generation / pricing | Requires pricing data. Phase 2-3. |
| CRM integration | Requires CRM API. Phase 3. |
| 3D chassis visualization | High effort, low incremental value over interactive SVG. |
| Parts/BOM pages | Internal engineering concern, not customer-facing. |
| Firmware/Changes/Verification/Integration | Internal engineering pages. |
| Other customer build visibility | Core requirement: customers cannot see other customers. |
| Exact part numbers | Core requirement: high-level capability descriptions only. |

---

## 8. Sanitization Rules

### What Customers See
- Module names: "10G Optical Mezzanine" ✅
- Capability descriptions: "Quad-channel 10 Gbps fiber-optic" ✅
- Interface types: "4× 10GBase-T via shielded connector" ✅
- Power/weight numbers: "6 W, 40 g" ✅
- Connector types: "Fiber Optic", "Copper RJ-45", "QSFP+" ✅

### What Customers Do NOT See
- Part numbers: "VSC8504" ❌ → "1G Quad PHY"
- Manufacturer names: "Microchip", "Virtium" ❌ → omitted
- Other customer names: "ABE", "J2", "JL" ❌ → not present
- Other customer configurations ❌ → not present
- Internal change log (ECO/ECN/DCN) ❌
- Trade studies ❌
- BOM / parts catalog ❌

---

## 9. Implementation Order

1. Scaffold Next.js project + copy config files (tsconfig, postcss, next.config, components.json)
2. Fork shadcn/ui components from SNP-Onboard
3. Fork globals.css + utils.ts
4. Build sanitized data layer (`product-catalog.ts`, `module-specs.ts`)
5. Build config context + reducer (`config-context.tsx`)
6. Build layout + navbar
7. Build overview page (sanitized from SNP-Onboard)
8. Build mission wizard component
9. Build interactive chassis + slot panels
10. Build SWaP-C gauges + interface summary
11. Build configurator page (assembles wizard + chassis + gauges + summary)
12. Build configuration summary page
13. Fork knowledge base (page + API + document store)
14. Build sanitized module detail pages
15. Write TODOS.md + SESSION-CONTEXT.md
16. Test suite

---

## 10. Key Decisions Made (Plan Review)

| Decision | Choice | Rationale |
|---|---|---|
| State management | Context + useReducer + localStorage | Simplest correct approach, no extra deps |
| Chassis interaction | Click-to-open slot panels | Most intuitive, high visual impact |
| Wizard flow | Primary entry point | Guides new customers, "Skip" for repeat visitors |
| Scope mode | EXPANSION | Greenfield customer-facing tool, should impress |
| Reset to Baseline | Build in initial release | ~10 min, essential UX |
| Error boundary | Build in initial release | Prevents white-screen crashes |

---

## 11. Error Handling

| Failure | Mitigation |
|---|---|
| localStorage quota exceeded | try/catch → in-memory only, console.warn |
| localStorage corrupted JSON | Schema validation → reset to baseline |
| Safari private browsing | try/catch → in-memory only |
| AI endpoint down | 502 error message to user |
| AI returns empty response | "No response" fallback text |
| Network error (knowledge base) | "Network error" message |
| Invalid slot/module combination | Slot constraints filter invalid options at data level |
