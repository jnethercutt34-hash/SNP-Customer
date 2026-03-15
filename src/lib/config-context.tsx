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

// ─── Context ────────────────────────────────────────────────────────────────

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(configReducer, { slots: [...BASELINE_CONFIG] });

  // Hydrate from localStorage on mount
  useEffect(() => {
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
