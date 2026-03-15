"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import {
  BASELINE_CONFIG,
  SLOT_CONSTRAINTS,
  MODULES,
  type SlotConfig,
} from "./product-catalog";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ConfigAction =
  | { type: "SET_SLOT_MODULE"; slotNumber: number; moduleId: string | null }
  | { type: "SET_SLOT_MEZZANINE"; slotNumber: number; mezzanineId: string | null }
  | { type: "SET_FULL_CONFIG"; config: SlotConfig[] }
  | { type: "RESET" };

export interface ConfigState {
  slots: SlotConfig[];
}

interface ConfigContextValue {
  state: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function validateSlotModule(slotNumber: number, moduleId: string | null): boolean {
  const constraint = SLOT_CONSTRAINTS.find((c) => c.slotNumber === slotNumber);
  if (!constraint) return false;

  // Fixed slots can't change their module
  if (constraint.fixed) return moduleId === constraint.fixedModuleId;

  // Spare slots: null (empty) or one of the allowed modules
  if (moduleId === null) return true;
  return constraint.allowedModuleIds?.includes(moduleId) ?? false;
}

function validateSlotMezzanine(slotNumber: number, mezzanineId: string | null): boolean {
  const constraint = SLOT_CONSTRAINTS.find((c) => c.slotNumber === slotNumber);
  if (!constraint || !constraint.hasMezzanine) return false;

  if (mezzanineId === null) return true;
  return constraint.allowedMezzanineIds?.includes(mezzanineId) ?? false;
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

// ─── localStorage Persistence ───────────────────────────────────────────────

const STORAGE_KEY = "snp-customer-config";

function loadFromStorage(): ConfigState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Validate schema: must have slots array of 7 with correct structure
    if (
      !parsed.slots ||
      !Array.isArray(parsed.slots) ||
      parsed.slots.length !== 7
    ) {
      return null;
    }

    // Validate each slot has a valid moduleId
    for (const slot of parsed.slots) {
      if (typeof slot.slotNumber !== "number") return null;
      if (slot.moduleId !== null && !MODULES[slot.moduleId]) return null;
      if (slot.mezzanineId !== null && slot.mezzanineId !== undefined && !MODULES[slot.mezzanineId]) return null;
    }

    return parsed as ConfigState;
  } catch {
    return null;
  }
}

function saveToStorage(state: ConfigState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("[config-context] localStorage write failed — running in-memory only");
  }
}

// ─── URL Sharing ────────────────────────────────────────────────────────────

/** Compact representation for URL encoding — only stores configurable choices */
interface CompactConfig {
  s2: string | null;  // slot 2 module
  s3: string | null;  // slot 3 module
  m4: string | null;  // slot 4 mezzanine
  m6: string | null;  // slot 6 mezzanine
}

function toCompact(slots: SlotConfig[]): CompactConfig {
  const s2 = slots.find((s) => s.slotNumber === 2);
  const s3 = slots.find((s) => s.slotNumber === 3);
  const s4 = slots.find((s) => s.slotNumber === 4);
  const s6 = slots.find((s) => s.slotNumber === 6);
  return {
    s2: s2?.moduleId ?? null,
    s3: s3?.moduleId ?? null,
    m4: s4?.mezzanineId ?? null,
    m6: s6?.mezzanineId ?? null,
  };
}

function fromCompact(compact: CompactConfig): SlotConfig[] {
  return [
    { slotNumber: 1, moduleId: "psu-red" },
    { slotNumber: 2, moduleId: compact.s2 },
    { slotNumber: 3, moduleId: compact.s3 },
    { slotNumber: 4, moduleId: "gpp-red", mezzanineId: compact.m4 },
    { slotNumber: 5, moduleId: "crypto-unit" },
    { slotNumber: 6, moduleId: "gpp-black", mezzanineId: compact.m6 },
    { slotNumber: 7, moduleId: "psu-black" },
  ];
}

export function encodeConfigToUrl(slots: SlotConfig[]): string {
  const compact = toCompact(slots);
  const json = JSON.stringify(compact);
  const encoded = btoa(json);
  return `${window.location.origin}/configure?config=${encoded}`;
}

function decodeConfigFromUrl(): SlotConfig[] | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("config");
    if (!encoded) return null;

    const json = atob(encoded);
    const compact = JSON.parse(json) as CompactConfig;

    // Validate module IDs exist
    if (compact.s2 !== null && !MODULES[compact.s2]) return null;
    if (compact.s3 !== null && !MODULES[compact.s3]) return null;
    if (compact.m4 !== null && !MODULES[compact.m4]) return null;
    if (compact.m6 !== null && !MODULES[compact.m6]) return null;

    return fromCompact(compact);
  } catch {
    return null;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(configReducer, { slots: [...BASELINE_CONFIG] });

  // Hydrate: URL config takes priority, then localStorage
  useEffect(() => {
    const urlConfig = decodeConfigFromUrl();
    if (urlConfig) {
      dispatch({ type: "SET_FULL_CONFIG", config: urlConfig });
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    const stored = loadFromStorage();
    if (stored) {
      dispatch({ type: "SET_FULL_CONFIG", config: stored.slots });
    }
  }, []);

  // Persist on every state change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <ConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return ctx;
}
