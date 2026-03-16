import { describe, it, expect } from "vitest";
import {
  BASELINE_CONFIG,
  SLOT_CONSTRAINTS,
  MODULES,
  type SlotConfig,
} from "../lib/product-catalog";

// ─── Validation Functions (mirrors config-context.tsx) ─────────────────────

function validateSlotModule(slotNumber: number, moduleId: string | null): boolean {
  const constraint = SLOT_CONSTRAINTS.find((c) => c.slotNumber === slotNumber);
  if (!constraint) return false;
  if (constraint.fixed) return moduleId === constraint.fixedModuleId;
  if (moduleId === null) return true;
  return constraint.allowedModuleIds?.includes(moduleId) ?? false;
}

function validateSlotMezzanine(slotNumber: number, mezzanineId: string | null): boolean {
  const constraint = SLOT_CONSTRAINTS.find((c) => c.slotNumber === slotNumber);
  if (!constraint || !constraint.hasMezzanine) return false;
  if (mezzanineId === null) return true;
  return constraint.allowedMezzanineIds?.includes(mezzanineId) ?? false;
}

type ConfigAction =
  | { type: "SET_SLOT_MODULE"; slotNumber: number; moduleId: string | null }
  | { type: "SET_SLOT_MEZZANINE"; slotNumber: number; mezzanineId: string | null }
  | { type: "SET_FULL_CONFIG"; config: SlotConfig[] }
  | { type: "RESET" };

interface ConfigState {
  slots: SlotConfig[];
}

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "SET_SLOT_MODULE": {
      if (!validateSlotModule(action.slotNumber, action.moduleId)) return state;
      return {
        ...state,
        slots: state.slots.map((slot) =>
          slot.slotNumber === action.slotNumber
            ? { ...slot, moduleId: action.moduleId }
            : slot
        ),
      };
    }
    case "SET_SLOT_MEZZANINE": {
      if (!validateSlotMezzanine(action.slotNumber, action.mezzanineId)) return state;
      return {
        ...state,
        slots: state.slots.map((slot) =>
          slot.slotNumber === action.slotNumber
            ? { ...slot, mezzanineId: action.mezzanineId }
            : slot
        ),
      };
    }
    case "SET_FULL_CONFIG": {
      return { ...state, slots: action.config };
    }
    case "RESET": {
      return { slots: [...BASELINE_CONFIG] };
    }
    default:
      return state;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Config Reducer — Slot Module Validation", () => {
  it("rejects changing a fixed slot's module", () => {
    // Slot 1 is fixed to psu-red
    expect(validateSlotModule(1, "timing-csac")).toBe(false);
    expect(validateSlotModule(5, "psu-red")).toBe(false);
  });

  it("accepts setting a fixed slot to its fixed module", () => {
    expect(validateSlotModule(1, "psu-red")).toBe(true);
    expect(validateSlotModule(5, "crypto-unit")).toBe(true);
  });

  it("accepts setting spare slot to null (empty)", () => {
    expect(validateSlotModule(2, null)).toBe(true);
    expect(validateSlotModule(3, null)).toBe(true);
  });

  it("accepts setting spare slot to an allowed module", () => {
    expect(validateSlotModule(2, "timing-csac")).toBe(true);
  });

  it("rejects setting spare slot to a non-allowed module", () => {
    expect(validateSlotModule(2, "psu-red")).toBe(false);
    expect(validateSlotModule(2, "mez-optical-10g")).toBe(false);
  });

  it("rejects invalid slot numbers", () => {
    expect(validateSlotModule(0, null)).toBe(false);
    expect(validateSlotModule(99, "psu-red")).toBe(false);
  });
});

describe("Config Reducer — Mezzanine Validation", () => {
  it("accepts valid mezzanine on GPP slot", () => {
    expect(validateSlotMezzanine(4, "mez-optical-10g")).toBe(true);
    expect(validateSlotMezzanine(4, "mez-copper-10g")).toBe(true);
    expect(validateSlotMezzanine(4, "mez-qsfp-3x")).toBe(true);
    expect(validateSlotMezzanine(6, "mez-qsfp-passive")).toBe(true);
  });

  it("accepts null mezzanine (remove mezzanine)", () => {
    expect(validateSlotMezzanine(4, null)).toBe(true);
    expect(validateSlotMezzanine(6, null)).toBe(true);
  });

  it("rejects mezzanine on non-mezzanine slots", () => {
    expect(validateSlotMezzanine(1, "mez-optical-10g")).toBe(false);
    expect(validateSlotMezzanine(2, "mez-optical-10g")).toBe(false);
    expect(validateSlotMezzanine(5, "mez-optical-10g")).toBe(false);
  });

  it("rejects non-mezzanine module as mezzanine", () => {
    expect(validateSlotMezzanine(4, "timing-csac")).toBe(false);
    expect(validateSlotMezzanine(4, "psu-red")).toBe(false);
  });
});

describe("Config Reducer — State Transitions", () => {
  const initial: ConfigState = { slots: [...BASELINE_CONFIG] };

  it("SET_SLOT_MODULE updates spare slot", () => {
    const next = configReducer(initial, {
      type: "SET_SLOT_MODULE",
      slotNumber: 2,
      moduleId: "timing-csac",
    });
    expect(next.slots.find((s) => s.slotNumber === 2)?.moduleId).toBe("timing-csac");
    // Other slots unchanged
    expect(next.slots.find((s) => s.slotNumber === 1)?.moduleId).toBe("psu-red");
  });

  it("SET_SLOT_MODULE with invalid module returns same state", () => {
    const next = configReducer(initial, {
      type: "SET_SLOT_MODULE",
      slotNumber: 1,
      moduleId: "timing-csac",
    });
    expect(next).toBe(initial); // exact same reference — no mutation
  });

  it("SET_SLOT_MEZZANINE updates GPP slot mezzanine", () => {
    const next = configReducer(initial, {
      type: "SET_SLOT_MEZZANINE",
      slotNumber: 4,
      mezzanineId: "mez-copper-10g",
    });
    expect(next.slots.find((s) => s.slotNumber === 4)?.mezzanineId).toBe("mez-copper-10g");
  });

  it("SET_SLOT_MEZZANINE on non-mezzanine slot returns same state", () => {
    const next = configReducer(initial, {
      type: "SET_SLOT_MEZZANINE",
      slotNumber: 2,
      mezzanineId: "mez-optical-10g",
    });
    expect(next).toBe(initial);
  });

  it("SET_FULL_CONFIG replaces entire config", () => {
    const custom: SlotConfig[] = [
      { slotNumber: 1, moduleId: "psu-red" },
      { slotNumber: 2, moduleId: "timing-csac" },
      { slotNumber: 3, moduleId: "timing-csac" },
      { slotNumber: 4, moduleId: "gpp-red", mezzanineId: "mez-copper-10g" },
      { slotNumber: 5, moduleId: "crypto-unit" },
      { slotNumber: 6, moduleId: "gpp-black", mezzanineId: "mez-qsfp-3x" },
      { slotNumber: 7, moduleId: "psu-black" },
    ];
    const next = configReducer(initial, { type: "SET_FULL_CONFIG", config: custom });
    expect(next.slots).toBe(custom);
  });

  it("RESET returns baseline config", () => {
    const modified = configReducer(initial, {
      type: "SET_SLOT_MODULE",
      slotNumber: 2,
      moduleId: "timing-csac",
    });
    const reset = configReducer(modified, { type: "RESET" });
    expect(reset.slots).toEqual(BASELINE_CONFIG);
  });
});
