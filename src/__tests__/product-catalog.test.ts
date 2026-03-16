import { describe, it, expect } from "vitest";
import {
  MODULES,
  SLOT_CONSTRAINTS,
  BASELINE_CONFIG,
  MAX_POWER_BUDGET,
  MAX_WEIGHT_BUDGET,
  getModule,
  getSlotConstraint,
  isSlotConfigurable,
  calcTotalPower,
  calcTotalWeight,
  getConfigInterfaces,
  type SlotConfig,
} from "../lib/product-catalog";

// ─── Module Catalog ──────────────────────────────────────────────────────────

describe("Module Catalog", () => {
  it("contains exactly 10 modules", () => {
    expect(Object.keys(MODULES)).toHaveLength(10);
  });

  it("every module has required fields", () => {
    for (const mod of Object.values(MODULES)) {
      expect(mod.id).toBeTruthy();
      expect(mod.name).toBeTruthy();
      expect(mod.type).toBeTruthy();
      expect(typeof mod.powerWatts).toBe("number");
      expect(typeof mod.weightGrams).toBe("number");
      expect(mod.powerWatts).toBeGreaterThan(0);
      expect(mod.weightGrams).toBeGreaterThan(0);
    }
  });

  it("module IDs match their keys in the record", () => {
    for (const [key, mod] of Object.entries(MODULES)) {
      expect(mod.id).toBe(key);
    }
  });

  it("getModule returns correct module or undefined", () => {
    expect(getModule("psu-red")?.name).toBe("Power Converter (Red)");
    expect(getModule("nonexistent")).toBeUndefined();
  });
});

// ─── Sanitization ────────────────────────────────────────────────────────────

describe("Sanitization", () => {
  const allText = Object.values(MODULES)
    .map((m) => `${m.name} ${m.description} ${JSON.stringify(m.keySpecs)} ${JSON.stringify(m.interfaces)}`)
    .join(" ");

  it("contains no vendor part numbers", () => {
    expect(allText).not.toMatch(/VSC8504|TPS65263|SA56004/i);
  });

  it("contains no vendor/manufacturer names", () => {
    expect(allText).not.toMatch(/Microchip|Virtium|Microsemi|Honeywell/i);
  });

  it("contains no customer names", () => {
    expect(allText).not.toMatch(/\bABE\b|\bFMS\b/);
  });
});

// ─── Slot Constraints ────────────────────────────────────────────────────────

describe("Slot Constraints", () => {
  it("defines exactly 7 slots", () => {
    expect(SLOT_CONSTRAINTS).toHaveLength(7);
  });

  it("slot numbers are 1-7 in order", () => {
    expect(SLOT_CONSTRAINTS.map((s) => s.slotNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("fixed slots reference valid modules", () => {
    for (const c of SLOT_CONSTRAINTS.filter((s) => s.fixed && s.fixedModuleId)) {
      expect(MODULES[c.fixedModuleId!]).toBeDefined();
    }
  });

  it("configurable slots list valid allowed module IDs", () => {
    for (const c of SLOT_CONSTRAINTS.filter((s) => !s.fixed)) {
      for (const id of c.allowedModuleIds ?? []) {
        expect(MODULES[id]).toBeDefined();
      }
    }
  });

  it("mezzanine slots list valid mezzanine IDs", () => {
    for (const c of SLOT_CONSTRAINTS.filter((s) => s.hasMezzanine)) {
      expect(c.allowedMezzanineIds!.length).toBeGreaterThan(0);
      for (const id of c.allowedMezzanineIds!) {
        expect(MODULES[id]).toBeDefined();
        expect(MODULES[id].type).toBe("Networking_Mezzanine");
      }
    }
  });

  it("getSlotConstraint returns correct constraint or undefined", () => {
    expect(getSlotConstraint(1)?.role).toBe("psu-red");
    expect(getSlotConstraint(99)).toBeUndefined();
  });

  it("isSlotConfigurable identifies correct slots", () => {
    // Fixed, no mezzanine
    expect(isSlotConfigurable(1)).toBe(false);
    expect(isSlotConfigurable(5)).toBe(false);
    expect(isSlotConfigurable(7)).toBe(false);
    // Spare (configurable)
    expect(isSlotConfigurable(2)).toBe(true);
    expect(isSlotConfigurable(3)).toBe(true);
    // Fixed base + mezzanine
    expect(isSlotConfigurable(4)).toBe(true);
    expect(isSlotConfigurable(6)).toBe(true);
  });
});

// ─── SWaP-C Calculations ────────────────────────────────────────────────────

describe("SWaP-C Calculations", () => {
  it("calcTotalPower sums module + mezzanine power for baseline", () => {
    const power = calcTotalPower(BASELINE_CONFIG);
    // PSU-Red(5) + GPP-Red(32) + mez-optical(6) + Crypto(10) + GPP-Black(31) + mez-optical(6) + PSU-Black(6)
    expect(power).toBe(5 + 32 + 6 + 10 + 31 + 6 + 6);
  });

  it("calcTotalWeight sums module + mezzanine weight for baseline", () => {
    const weight = calcTotalWeight(BASELINE_CONFIG);
    expect(weight).toBe(140 + 280 + 40 + 130 + 280 + 40 + 155);
  });

  it("baseline power is within budget", () => {
    expect(calcTotalPower(BASELINE_CONFIG)).toBeLessThanOrEqual(MAX_POWER_BUDGET);
  });

  it("baseline weight is within budget", () => {
    expect(calcTotalWeight(BASELINE_CONFIG)).toBeLessThanOrEqual(MAX_WEIGHT_BUDGET);
  });

  it("handles empty slots (null moduleId) gracefully", () => {
    const config: SlotConfig[] = [
      { slotNumber: 1, moduleId: null },
      { slotNumber: 2, moduleId: null },
    ];
    expect(calcTotalPower(config)).toBe(0);
    expect(calcTotalWeight(config)).toBe(0);
  });

  it("adding timing module to spare increases power and weight", () => {
    const withTiming = BASELINE_CONFIG.map((s) =>
      s.slotNumber === 2 ? { ...s, moduleId: "timing-csac" } : s
    );
    expect(calcTotalPower(withTiming)).toBe(calcTotalPower(BASELINE_CONFIG) + 13);
    expect(calcTotalWeight(withTiming)).toBe(calcTotalWeight(BASELINE_CONFIG) + 275);
  });
});

// ─── Interface Collection ────────────────────────────────────────────────────

describe("getConfigInterfaces", () => {
  it("collects interfaces from modules and mezzanines", () => {
    const ifaces = getConfigInterfaces(BASELINE_CONFIG);
    expect(ifaces.length).toBeGreaterThan(0);
    // Baseline has optical mezzanines — should include fiber interfaces
    expect(ifaces.some((i) => i.includes("Fiber Optic"))).toBe(true);
  });

  it("returns empty array for all-null config", () => {
    const empty: SlotConfig[] = [{ slotNumber: 1, moduleId: null }];
    expect(getConfigInterfaces(empty)).toEqual([]);
  });

  it("includes mezzanine interfaces when present", () => {
    const config: SlotConfig[] = [
      { slotNumber: 4, moduleId: "gpp-red", mezzanineId: "mez-copper-10g" },
    ];
    const ifaces = getConfigInterfaces(config);
    expect(ifaces.some((i) => i.includes("10GBase-T"))).toBe(true);
  });
});
