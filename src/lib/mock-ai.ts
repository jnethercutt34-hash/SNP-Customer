// ─── Interfaces ──────────────────────────────────────────────────────────────
// Sanitized for customer use — no internal fault codes, no customer names.

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface AiResponse {
  title: string;
  summary: string;
  source?: string;
  confidence?: ConfidenceLevel;
  relatedKeys?: string[];
}

// ─── Mock Response Dictionary ─────────────────────────────────────────────────
// Generic, customer-safe responses about SNP capabilities.

export const AI_RESPONSES: Record<string, AiResponse> = {
  "SpaceVPX-backplane": {
    title: "SpaceVPX Backplane Interface",
    source: "Product Documentation",
    summary:
      "The SNP uses a 3U SpaceVPX backplane with VITA 78 compliance. Power rails: +3.3 V, +5 V, +12 V. Control plane via PCIe Gen 3 x4. Data plane via dual 10 Gbps SerDes lanes per slot. Seven slots total with two configurable spare slots for mission-specific expansion.",
    confidence: "High",
    relatedKeys: ["networking", "chassis"],
  },
  "optical-interface": {
    title: "10 Gbps Optical Networking",
    source: "Product Documentation",
    summary:
      "The 10G Optical Mezzanine provides quad-channel fiber-optic networking via SFP+ connectors at 1310 nm. Maximum fiber run: 10 km. 50 Gbps aggregate bandwidth. Standard for baseline configurations. Includes onboard quad 1G PHY for management traffic, 1.2 TB NVMe storage, and 64 GB eMMC.",
    confidence: "High",
    relatedKeys: ["copper-interface", "networking"],
  },
  "copper-interface": {
    title: "10 Gbps Copper Networking",
    source: "Product Documentation",
    summary:
      "The 10G Copper Mezzanine provides quad-channel 10GBase-T Ethernet via shielded RJ-45. Reduced SWaP-C profile — 3 W less power and 15 g lighter than the optical variant. Ideal for proliferated LEO constellation missions where fiber management overhead is undesirable.",
    confidence: "High",
    relatedKeys: ["optical-interface", "swap-optimization"],
  },
  "precision-timing": {
    title: "CSAC Precision Timing Module",
    source: "Product Documentation",
    summary:
      "The Chip-Scale Atomic Clock (CSAC) expansion module provides nanosecond-class time synchronization independent of GPS. 1 PPS output with < 50 ns accuracy, 10 MHz reference, and IEEE 1588v2 PTP grandmaster capability. Occupies one spare VPX slot. Optional Red/Black domain signal filtering.",
    confidence: "High",
    relatedKeys: ["expansion", "timing"],
  },
  "redundancy-architecture": {
    title: "Dual-GPP Redundancy Architecture",
    source: "Product Documentation",
    summary:
      "The SNP features two General Purpose Processors (Red and Black) operating in hot-standby. Switchover latency is under 200 ms via the SpaceVPX control plane. Both GPPs share identical hardware: quad-core ARM Cortex-A78AE, 16 GB DDR4 ECC, 1.5M gate FPGA. Black can be demoted to co-processing mode for double compute throughput.",
    confidence: "High",
    relatedKeys: ["gpp", "processing"],
  },
  "swap-optimization": {
    title: "SWaP-C Optimization Strategies",
    source: "Product Documentation",
    summary:
      "Key SWaP-C trade-offs: switching from Optical to Copper mezzanines saves 3 W per GPP slot and 15 g per mezzanine. Leaving spare slots empty reduces total system power by up to 13 W (timing module). The baseline configuration consumes approximately 96 W total. Copper-optimized configurations can achieve ~84 W with both spare slots empty.",
    confidence: "Medium",
    relatedKeys: ["copper-interface", "optical-interface"],
  },
  "crypto-capabilities": {
    title: "Cryptographic Processing Unit",
    source: "Product Documentation",
    summary:
      "The dedicated crypto module provides FIPS 140-2 Level 3 certified hardware security. Supports AES-256-GCM at 40 Gbps line rate, ECC P-384 and RSA-4096 key exchange, SHA-3 hashing, and hardware TRNG. Active tamper-zeroization in under 1 µs. USB-C management interface for key loading.",
    confidence: "High",
    relatedKeys: ["security", "encryption"],
  },
  "qsfp-networking": {
    title: "High-Density QSFP+ Networking",
    source: "Product Documentation",
    summary:
      "The 3× QSFP+ Mezzanine provides 120 Gbps aggregate bandwidth through three independent QSFP+ cages. Each cage supports 4×10G or 1×40G configurations with SR4/LR4 breakout options. The passive QSFP variant supports Direct Attach Copper (≤5 m) or Active Optical Cable (≤100 m) for simplified cable management at lower power.",
    confidence: "High",
    relatedKeys: ["networking", "optical-interface"],
  },
};

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Returns matching responses for a free-text query by checking key and title. */
export function searchAiResponses(query: string): AiResponse[] {
  const q = query.toLowerCase();
  return Object.entries(AI_RESPONSES)
    .filter(
      ([key, resp]) =>
        key.toLowerCase().includes(q) ||
        resp.title.toLowerCase().includes(q) ||
        resp.summary.toLowerCase().includes(q)
    )
    .map(([, resp]) => resp);
}
