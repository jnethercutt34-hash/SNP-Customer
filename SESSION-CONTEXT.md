# SNP-Customer — Session Context
_Last updated: 2026-03-15_

---

## 1. What This Is

**SNP-Customer** is a customer-facing interactive product configuration and reference tool for the SNP (Secure Network Processor). It allows prospective customers to explore the product, configure their own box via a guided wizard + interactive chassis, see real-time SWaP-C impact, and ask questions via an AI knowledge base — all without seeing other customer configurations or proprietary part numbers.

**Repo:** https://github.com/jnethercutt34-hash/SNP-Customer

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (new-york style) |
| State | React Context + useReducer + localStorage |
| AI Backend | Mock (default) or OpenAI-compatible API |
| Theme | Dark aerospace (always-dark, CSS variables) |

---

## 3. Project Structure

```
src/
  app/
    layout.tsx                        Global layout + navbar + ConfigProvider
    page.tsx                          Overview — sanitized product intro
    globals.css                       Tailwind + dark theme + print CSS
    configure/
      page.tsx                        Mission wizard + interactive configurator
      summary/page.tsx                Exportable configuration summary
    modules/
      [id]/page.tsx                   Sanitized module detail pages
    knowledge-base/page.tsx           AI Q&A
    api/chat/route.ts                 AI backend handler
  components/
    navbar.tsx                        3-link nav (Overview · Configure · KB)
    interactive-chassis.tsx           Click-to-configure chassis SVG
    mission-wizard.tsx                3-step guided wizard
    swap-gauges.tsx                   Power/weight gauges
    interface-summary.tsx             Connectors/speeds readout
    slot-panel.tsx                    Slide-out module selection panel
    answer-card.tsx                   Knowledge base result card
    ui/                               shadcn/ui primitives
  lib/
    product-catalog.ts                Module catalog + slot constraints + SWaP-C
    module-specs.ts                   Sanitized module specs (10 modules)
    config-context.tsx                React Context + useReducer + localStorage
    document-store.ts                 Server-side doc ingestion
    mock-ai.ts                        8 customer-safe mock AI responses
    utils.ts                          cn() utility
```

---

## 4. Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Context + useReducer + localStorage | Simplest correct approach, no extra deps |
| Chassis interaction | Click-to-open slide-out panels | Intuitive, high visual impact |
| Wizard flow | Primary entry point, "Skip" for repeats | Guides new customers |
| Faceplate rendering | Type-based mapping (not ID-based) | Prevents silent failures |
| ConfigProvider scope | Root layout.tsx | Simplest, most flexible |
| Slot constraints | Data-driven in product-catalog.ts | DRY — one source of truth |
| Mock AI responses | Fresh generic responses | No internal fault codes — sanitization risk |

---

## 5. Sanitization Rules

### Customers See:
- Module names: "10G Optical Mezzanine" ✅
- Capability descriptions: "Quad-channel 10 Gbps fiber-optic" ✅
- Interface types: "4× 10GBase-T via shielded connector" ✅
- Power/weight numbers: "6 W, 40 g" ✅
- Architecture: "ARM Cortex-A78AE", "1.5M SLC FPGA" ✅

### Customers Do NOT See:
- Part numbers (VSC8504, VM1502, etc.) ❌
- Manufacturer names (Microchip, Virtium, etc.) ❌
- Other customer names or configurations ❌
- Internal change log, trade studies, BOM ❌

---

## 6. Slot Layout

```
Slot 1: PSU Red (fixed)
Slot 2: Spare → Empty or Expansion Module (e.g., CSAC Timing)
Slot 3: Spare → Empty or Expansion Module
Slot 4: GPP Red (fixed) + Mezzanine selector (Optical / Copper / QSFP / QSFP Passive)
Slot 5: Crypto Module (fixed)
Slot 6: GPP Black (fixed) + Mezzanine selector
Slot 7: PSU Black (fixed)
```

Configurable decisions:
1. **Slot 4 mezzanine** — networking on GPP Red
2. **Slot 6 mezzanine** — networking on GPP Black
3. **Slot 2** — empty or expansion module
4. **Slot 3** — empty or expansion module

---

## 7. Data Flow

```
Mission Wizard → generates recommended SlotConfig[] → dispatch(SET_FULL_CONFIG)
                                                          ↓
Interactive Chassis ← reads from ConfigContext ← useReducer(configReducer)
     ↓ click slot                                         ↓
Slot Panel → dispatch(SET_SLOT_MODULE / SET_SLOT_MEZZANINE)
                                                          ↓
SWaP-C Gauges ← calcTotalPower/Weight(state.slots) ← ConfigContext
Interface Summary ← getConfigInterfaces(state.slots)
                                                          ↓
localStorage ← useEffect syncs state on every change (try/catch for Safari)
```

---

## 8. Forked from SNP-Onboard

| Source | Target | Changes |
|--------|--------|---------|
| `globals.css` | `globals.css` | Added print CSS |
| `components/ui/*` | `components/ui/*` | Identical (7 components) |
| `layout.tsx` | `layout.tsx` | Simplified title, ConfigProvider wrapper |
| `navbar.tsx` | `navbar.tsx` | Reduced to 3 links |
| `chassis-diagram.tsx` | `interactive-chassis.tsx` | Clickable slots, type-based rendering |
| `swap/page.tsx` | `swap-gauges.tsx` | Extracted to component, drives from config context |
| `mock-hardware.ts` types | `product-catalog.ts` | Sanitized, added slot constraints |
| `mock-components.ts` | `module-specs.ts` | Sanitized (no P/Ns, no datasheets) |
| `knowledge-base/page.tsx` | `knowledge-base/page.tsx` | Sanitized example queries |
| `api/chat/route.ts` | `api/chat/route.ts` | Sanitized system prompt |
| `document-store.ts` | `document-store.ts` | Identical |
| `answer-card.tsx` | `answer-card.tsx` | Removed manual-type badge |
| `mock-ai.ts` | `mock-ai.ts` | Fresh customer-safe responses |
| `utils.ts` | `utils.ts` | Identical |

---

## 9. Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Product overview, architecture, mezzanine cards, CTA |
| `/configure` | `src/app/configure/page.tsx` | Mission wizard + chassis configurator |
| `/configure/summary` | `src/app/configure/summary/page.tsx` | Printable slot-by-slot summary |
| `/modules/[id]` | `src/app/modules/[id]/page.tsx` | Sanitized module detail (10 modules) |
| `/knowledge-base` | `src/app/knowledge-base/page.tsx` | AI Q&A |
| `/api/chat` | `src/app/api/chat/route.ts` | AI backend (mock or live) |

---

## 10. Running Locally

```bash
cd c:\AI-Tools\SNP-Customer
npm install
npm run dev        # http://localhost:3000
```

Or double-click `launch.bat`.

For live AI mode, create `.env.local`:
```
NEXT_PUBLIC_AI_PROVIDER=internal
AI_ENDPOINT=https://your-endpoint
AI_AUTH_TOKEN=your-token
AI_MODEL=gpt-4
```

---

## 11. Error Handling

| Failure | Mitigation |
|---------|------------|
| localStorage quota | try/catch → in-memory only |
| Corrupted localStorage | Schema validation → reset to baseline |
| AI endpoint down | 502 error message to user |
| Invalid slot/module | Constraints filter at data level |

---

## 12. What's NOT in Scope (Phase 2+)

- Customer login / auth
- Database persistence
- Quote generation / pricing
- CRM integration
- 3D chassis visualization
- Parts/BOM pages
- Other customer visibility
