// ─── SNP Customer Product Catalog ────────────────────────────────────────────
// Sanitized: No part numbers, no vendor names, no customer names.
// This is the single source of truth for modules, slot constraints, and SWaP-C data.

// ─── Types ──────────────────────────────────────────────────────────────────

export type ModuleType =
  | "GPP_Base"
  | "Networking_Mezzanine"
  | "Crypto_Module"
  | "Expansion_Module"
  | "Power_Converter";

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  powerWatts: number;
  weightGrams: number;
  description: string;
  interfaces?: string[];
  keySpecs?: { label: string; value: string }[];
}

export type SlotRole =
  | "psu-red"
  | "spare"
  | "gpp-red"
  | "crypto"
  | "gpp-black"
  | "psu-black";

export interface SlotConstraint {
  slotNumber: number;
  role: SlotRole;
  label: string;
  fixed: boolean;               // true = not customer-configurable
  fixedModuleId?: string;       // which module is always there (if fixed)
  allowedModuleIds?: string[];  // selectable options (if not fixed)
  hasMezzanine?: boolean;       // GPP slots have mezzanine selector
  allowedMezzanineIds?: string[]; // which mezzanines can attach
}

export interface SlotConfig {
  slotNumber: number;
  moduleId: string | null;      // null = empty
  mezzanineId?: string | null;  // only for GPP slots
}

// ─── Module Catalog ─────────────────────────────────────────────────────────

export const MODULES: Record<string, Module> = {
  // Power Supply Units (fixed)
  "psu-red": {
    id: "psu-red",
    name: "Power Converter (Red)",
    type: "Power_Converter",
    powerWatts: 5,
    weightGrams: 140,
    description: "28V primary input power converter for the Red security domain. Distributes regulated power to the Red GPP and peripherals.",
    interfaces: ["+3.3V AUX", "+3.3V Logic", "+5V Peripheral"],
    keySpecs: [
      { label: "Input", value: "28 VDC" },
      { label: "Power", value: "5 W" },
      { label: "Weight", value: "140 g" },
    ],
  },
  "psu-black": {
    id: "psu-black",
    name: "Power Converter (Black)",
    type: "Power_Converter",
    powerWatts: 6,
    weightGrams: 155,
    description: "28V primary input power converter for the Black security domain. Supplies the Black GPP and provides the +12V high-power rail to the backplane.",
    interfaces: ["+3.3V AUX", "+3.3V Logic", "+5V Peripheral", "+12V High-Power"],
    keySpecs: [
      { label: "Input", value: "28 VDC" },
      { label: "Power", value: "6 W" },
      { label: "Weight", value: "155 g" },
    ],
  },

  // GPP Base Cards (fixed — mezzanines are configurable)
  "gpp-red": {
    id: "gpp-red",
    name: "General Purpose Processor (Red)",
    type: "GPP_Base",
    powerWatts: 32,
    weightGrams: 280,
    description: "Primary processor — quad-core ARM Cortex-A78AE with radiation-hardened 3U SpaceVPX design. Hosts 16 GB ECC memory, 2 Gb non-volatile storage, and a 1.5M gate FPGA for signal processing. Accepts one networking mezzanine.",
    interfaces: ["PCIe Gen 3 ×4", "10 Gbps SerDes (×2)", "XMC Mezzanine Site"],
    keySpecs: [
      { label: "Processor", value: "ARM Cortex-A78AE" },
      { label: "Memory", value: "16 GB DDR4 ECC" },
      { label: "FPGA", value: "1.5M SLC" },
      { label: "Power", value: "32 W" },
    ],
  },
  "gpp-black": {
    id: "gpp-black",
    name: "General Purpose Processor (Black)",
    type: "GPP_Base",
    powerWatts: 31,
    weightGrams: 280,
    description: "Hot-standby processor — mirrors Red with <200ms switchover. Identical memory, storage, and FPGA. Can be demoted to co-processing mode for double compute throughput. Accepts one networking mezzanine.",
    interfaces: ["PCIe Gen 3 ×4", "10 Gbps SerDes (×2)", "XMC Mezzanine Site"],
    keySpecs: [
      { label: "Processor", value: "ARM Cortex-A78AE" },
      { label: "Memory", value: "16 GB DDR4 ECC" },
      { label: "FPGA", value: "1.5M SLC" },
      { label: "Power", value: "31 W" },
    ],
  },

  // Crypto Module (fixed)
  "crypto-unit": {
    id: "crypto-unit",
    name: "Cryptographic Processing Unit",
    type: "Crypto_Module",
    powerWatts: 10,
    weightGrams: 130,
    description: "FIPS 140-2 Level 3 hardware security module. AES-256-GCM at 40 Gbps line rate, ECC P-384 key exchange, and active tamper-zeroization. Offloads crypto from both GPPs.",
    interfaces: ["USB-C Management", "SpaceVPX Backplane"],
    keySpecs: [
      { label: "Certification", value: "FIPS 140-2 L3" },
      { label: "AES Throughput", value: "40 Gbps" },
      { label: "Power", value: "10 W" },
      { label: "Weight", value: "130 g" },
    ],
  },

  // ─── Networking Mezzanines (customer-selectable) ────────────────────────

  "mez-optical-10g": {
    id: "mez-optical-10g",
    name: "10G Optical Mezzanine",
    type: "Networking_Mezzanine",
    powerWatts: 6,
    weightGrams: 40,
    description: "Quad-channel 10 Gbps fiber-optic mezzanine (SFP+ · 1310 nm). Standard for baseline configurations. Includes quad 1G PHY for management and onboard storage.",
    interfaces: ["4× 10G Fiber Optic (SFP+)", "4× 1GbE Management", "1.2 TB NVMe Storage", "64 GB eMMC"],
    keySpecs: [
      { label: "Bandwidth", value: "50 Gbps agg." },
      { label: "Reach", value: "10 km" },
      { label: "Power", value: "6 W" },
      { label: "Weight", value: "40 g" },
    ],
  },
  "mez-copper-10g": {
    id: "mez-copper-10g",
    name: "10G Copper Mezzanine",
    type: "Networking_Mezzanine",
    powerWatts: 3,
    weightGrams: 25,
    description: "Quad-channel 10GBase-T copper Ethernet mezzanine. Reduced SWaP-C profile for LEO missions — 3 W less power and 15 g lighter than optical.",
    interfaces: ["4× 10GBase-T (RJ-45)", "4× 1GbE Management"],
    keySpecs: [
      { label: "Bandwidth", value: "40 Gbps agg." },
      { label: "Reach", value: "30 m" },
      { label: "Power", value: "3 W" },
      { label: "Weight", value: "25 g" },
    ],
  },
  "mez-qsfp-3x": {
    id: "mez-qsfp-3x",
    name: "3× QSFP+ Mezzanine",
    type: "Networking_Mezzanine",
    powerWatts: 8,
    weightGrams: 55,
    description: "Triple-port QSFP+ mezzanine for high-density interconnect. Each cage supports 4×10G or 1×40G. 120 Gbps aggregate bandwidth.",
    interfaces: ["3× QSFP+ Cages", "SR4 / LR4 / 4×10G Breakout"],
    keySpecs: [
      { label: "Bandwidth", value: "120 Gbps agg." },
      { label: "Ports", value: "3× QSFP+" },
      { label: "Power", value: "8 W" },
      { label: "Weight", value: "55 g" },
    ],
  },
  "mez-qsfp-passive": {
    id: "mez-qsfp-passive",
    name: "10G QSFP Passive Mezzanine",
    type: "Networking_Mezzanine",
    powerWatts: 5,
    weightGrams: 48,
    description: "Triple QSFP+ passive cages for Direct Attach Copper or Active Optical Cable. No active transceivers — simplified cable management, lower power.",
    interfaces: ["3× QSFP+ Passive Cages", "DAC ≤5 m / AOC ≤100 m"],
    keySpecs: [
      { label: "Bandwidth", value: "120 Gbps agg." },
      { label: "Cable", value: "DAC / AOC" },
      { label: "Power", value: "5 W" },
      { label: "Weight", value: "48 g" },
    ],
  },

  // ─── Expansion Modules (spare slot options) ─────────────────────────────

  "timing-csac": {
    id: "timing-csac",
    name: "CSAC Precision Timing Module",
    type: "Expansion_Module",
    powerWatts: 13,
    weightGrams: 275,
    description: "Chip-scale atomic clock expansion module. Provides nanosecond-class time synchronization independent of GPS. 1 PPS and 10 MHz reference outputs with optional Red/Black domain filtering.",
    interfaces: ["1 PPS Output", "10 MHz Reference", "IEEE 1588v2 PTP", "Red/Black Filter Select"],
    keySpecs: [
      { label: "PTP Accuracy", value: "< 50 ns" },
      { label: "1PPS Jitter", value: "< 1 ns" },
      { label: "Power", value: "13 W" },
      { label: "Weight", value: "275 g" },
    ],
  },
};

// ─── Slot Constraints ───────────────────────────────────────────────────────
// Chassis: 7 slots, left to right (1-indexed)
// Slot 1: PSU Red (fixed)
// Slot 2: Spare (configurable — empty or expansion)
// Slot 3: Spare (configurable — empty or expansion)
// Slot 4: GPP Red (fixed base) + mezzanine selector
// Slot 5: Crypto Unit (fixed)
// Slot 6: GPP Black (fixed base) + mezzanine selector
// Slot 7: PSU Black (fixed)

export const SLOT_CONSTRAINTS: SlotConstraint[] = [
  {
    slotNumber: 1,
    role: "psu-red",
    label: "PSU Red",
    fixed: true,
    fixedModuleId: "psu-red",
  },
  {
    slotNumber: 2,
    role: "spare",
    label: "Spare Slot",
    fixed: false,
    allowedModuleIds: ["timing-csac"], // extensible
  },
  {
    slotNumber: 3,
    role: "spare",
    label: "Spare Slot",
    fixed: false,
    allowedModuleIds: ["timing-csac"],
  },
  {
    slotNumber: 4,
    role: "gpp-red",
    label: "GPP Red",
    fixed: true,
    fixedModuleId: "gpp-red",
    hasMezzanine: true,
    allowedMezzanineIds: ["mez-optical-10g", "mez-copper-10g", "mez-qsfp-3x", "mez-qsfp-passive"],
  },
  {
    slotNumber: 5,
    role: "crypto",
    label: "Crypto Unit",
    fixed: true,
    fixedModuleId: "crypto-unit",
  },
  {
    slotNumber: 6,
    role: "gpp-black",
    label: "GPP Black",
    fixed: true,
    fixedModuleId: "gpp-black",
    hasMezzanine: true,
    allowedMezzanineIds: ["mez-optical-10g", "mez-copper-10g", "mez-qsfp-3x", "mez-qsfp-passive"],
  },
  {
    slotNumber: 7,
    role: "psu-black",
    label: "PSU Black",
    fixed: true,
    fixedModuleId: "psu-black",
  },
];

// ─── Baseline Configuration ─────────────────────────────────────────────────

export const BASELINE_CONFIG: SlotConfig[] = [
  { slotNumber: 1, moduleId: "psu-red" },
  { slotNumber: 2, moduleId: null },
  { slotNumber: 3, moduleId: null },
  { slotNumber: 4, moduleId: "gpp-red", mezzanineId: "mez-optical-10g" },
  { slotNumber: 5, moduleId: "crypto-unit" },
  { slotNumber: 6, moduleId: "gpp-black", mezzanineId: "mez-optical-10g" },
  { slotNumber: 7, moduleId: "psu-black" },
];

// ─── SWaP-C Budget Constants ────────────────────────────────────────────────

export const MAX_POWER_BUDGET = 150;  // Watts — bus limit
export const MAX_WEIGHT_BUDGET = 4500; // grams — allocation
export const POWER_WARNING_PCT = 80;
export const WEIGHT_WARNING_PCT = 85;

// ─── Utility Functions ──────────────────────────────────────────────────────

export function getModule(id: string): Module | undefined {
  return MODULES[id];
}

export function getSlotConstraint(slotNumber: number): SlotConstraint | undefined {
  return SLOT_CONSTRAINTS.find((s) => s.slotNumber === slotNumber);
}

export function isSlotConfigurable(slotNumber: number): boolean {
  const c = getSlotConstraint(slotNumber);
  if (!c) return false;
  return !c.fixed || !!c.hasMezzanine;
}

/** Calculate total power for a configuration */
export function calcTotalPower(config: SlotConfig[]): number {
  return config.reduce((sum, slot) => {
    const mod = slot.moduleId ? MODULES[slot.moduleId] : null;
    const mez = slot.mezzanineId ? MODULES[slot.mezzanineId] : null;
    return sum + (mod?.powerWatts ?? 0) + (mez?.powerWatts ?? 0);
  }, 0);
}

/** Calculate total weight for a configuration */
export function calcTotalWeight(config: SlotConfig[]): number {
  return config.reduce((sum, slot) => {
    const mod = slot.moduleId ? MODULES[slot.moduleId] : null;
    const mez = slot.mezzanineId ? MODULES[slot.mezzanineId] : null;
    return sum + (mod?.weightGrams ?? 0) + (mez?.weightGrams ?? 0);
  }, 0);
}

/** Get all interfaces for a configuration */
export function getConfigInterfaces(config: SlotConfig[]): string[] {
  const ifaces: string[] = [];
  for (const slot of config) {
    const mod = slot.moduleId ? MODULES[slot.moduleId] : null;
    const mez = slot.mezzanineId ? MODULES[slot.mezzanineId] : null;
    if (mod?.interfaces) ifaces.push(...mod.interfaces);
    if (mez?.interfaces) ifaces.push(...mez.interfaces);
  }
  return ifaces;
}
