// ─── Sanitized Module Specs ──────────────────────────────────────────────────
// Customer-facing — no vendor names, no part numbers.
// Only capability descriptions, interfaces, and specifications.

export interface ModuleSpec {
  id: string;
  name: string;
  category: string;
  tagline: string;
  overview: string;
  specs: { label: string; value: string }[];
  features: string[];
  interfaces: string[];
}

export const MODULE_SPECS: Record<string, ModuleSpec> = {
  "gpp-red": {
    id: "gpp-red",
    name: "General Purpose Processor (Red)",
    category: "Processor",
    tagline: "Primary compute engine — quad-core ARM with FPGA co-processing",
    overview:
      "The Red GPP is the primary processor in the SNP system. It features a quad-core ARM Cortex-A78AE application processor paired with a 1.5M gate FPGA fabric for hardware-accelerated signal processing and FEC. 16 GB DDR4 with ECC provides radiation-tolerant memory, and 2 Gb of non-volatile storage retains firmware and configuration through power cycles. The carrier board accepts one networking mezzanine via an XMC site.",
    specs: [
      { label: "Processor", value: "Quad-core ARM Cortex-A78AE" },
      { label: "FPGA", value: "1.5M SLC — pipelined FFT + RS FEC" },
      { label: "Memory", value: "16 GB DDR4 SDRAM with ECC" },
      { label: "NV Storage", value: "2 Gb non-volatile (radiation-immune)" },
      { label: "Power Draw", value: "32 W" },
      { label: "Weight", value: "280 g" },
      { label: "Redundancy", value: "Primary — Black in hot-standby" },
    ],
    features: [
      "Partial FPGA reconfiguration for in-orbit algorithm updates",
      "Hardware ECC correction on all memory",
      "Dedicated board-management microcontroller",
      "XMC mezzanine site for networking",
    ],
    interfaces: ["PCIe Gen 3 ×4 (control plane)", "Dual 10 Gbps SerDes (data plane)", "XMC Mezzanine Connector"],
  },
  "gpp-black": {
    id: "gpp-black",
    name: "General Purpose Processor (Black)",
    category: "Processor",
    tagline: "Hot-standby processor — mirrors Red with <200ms switchover",
    overview:
      "The Black GPP mirrors the Red GPP in hot-standby mode. In the event of a Red-side fault, switchover occurs in under 200 ms via the SpaceVPX control plane. Black can alternatively be demoted to co-processing mode, doubling available compute throughput. Identical hardware to Red — same processor, memory, FPGA, and mezzanine site.",
    specs: [
      { label: "Processor", value: "Quad-core ARM Cortex-A78AE" },
      { label: "FPGA", value: "1.5M SLC — pipelined FFT + RS FEC" },
      { label: "Memory", value: "16 GB DDR4 SDRAM with ECC" },
      { label: "NV Storage", value: "2 Gb non-volatile (radiation-immune)" },
      { label: "Power Draw", value: "31 W" },
      { label: "Weight", value: "280 g" },
      { label: "Switchover", value: "< 200 ms" },
    ],
    features: [
      "Hot-standby or co-processing mode",
      "Automatic failover via SpaceVPX control plane",
      "Identical hardware for full redundancy",
    ],
    interfaces: ["PCIe Gen 3 ×4 (control plane)", "Dual 10 Gbps SerDes (data plane)", "XMC Mezzanine Connector"],
  },
  "crypto-unit": {
    id: "crypto-unit",
    name: "Cryptographic Processing Unit",
    category: "Security",
    tagline: "FIPS 140-2 Level 3 hardware security module",
    overview:
      "Dedicated hardware cryptographic module that offloads encryption/decryption from both GPPs. Provides AES-256-GCM at 40 Gbps line rate, ECC P-384 key exchange, RSA-4096, SHA-3, and hardware TRNG. Active tamper-zeroization in under 1 µs ensures key material is destroyed on physical intrusion.",
    specs: [
      { label: "Certification", value: "FIPS 140-2 Level 3" },
      { label: "AES Throughput", value: "40 Gbps line rate" },
      { label: "Key Exchange", value: "ECC P-384, RSA-4096" },
      { label: "Hashing", value: "SHA-3" },
      { label: "Tamper Response", value: "< 1 µs zeroization" },
      { label: "Power Draw", value: "10 W" },
      { label: "Weight", value: "130 g" },
    ],
    features: [
      "Hardware True Random Number Generator (TRNG)",
      "Active tamper-evident enclosure",
      "USB-C management interface for key loading",
      "Offloads crypto from both Red and Black GPPs",
    ],
    interfaces: ["USB-C Management", "SpaceVPX Backplane"],
  },
  "mez-optical-10g": {
    id: "mez-optical-10g",
    name: "10G Optical XMC Mezzanine",
    category: "Networking",
    tagline: "50 Gbps aggregate fiber-optic — baseline standard",
    overview:
      "Quad-channel 10 Gbps fiber-optic mezzanine using SFP+ connectors at 1310 nm wavelength. Standard networking option for baseline configurations with 10 km reach. Includes an onboard quad 1G PHY for management traffic, 1.2 TB NVMe SSD for mission data storage, and 64 GB eMMC for firmware.",
    specs: [
      { label: "Data Channels", value: "4× 10 Gbps fiber (SFP+)" },
      { label: "Wavelength", value: "1310 nm" },
      { label: "Reach", value: "10 km" },
      { label: "Aggregate BW", value: "50 Gbps" },
      { label: "Management", value: "4× 1GbE (Quad PHY)" },
      { label: "Storage", value: "1.2 TB NVMe + 64 GB eMMC" },
      { label: "Power Draw", value: "6 W" },
      { label: "Weight", value: "40 g" },
    ],
    features: [
      "Radiation-hardened sealed optical path",
      "Onboard storage for mission data",
      "Quad 1G management PHY",
    ],
    interfaces: ["4× 10G Fiber Optic (SFP+)", "4× 1GbE Management", "1.2 TB NVMe Storage", "64 GB eMMC"],
  },
  "mez-copper-10g": {
    id: "mez-copper-10g",
    name: "10G Copper XMC Mezzanine",
    category: "Networking",
    tagline: "Reduced SWaP-C for proliferated LEO",
    overview:
      "Quad-channel 10GBase-T copper Ethernet mezzanine with shielded RJ-45 connectors. Designed for missions where fiber management overhead is undesirable. 3 W less power and 15 g lighter than the optical variant — ideal for proliferated LEO constellations.",
    specs: [
      { label: "Data Channels", value: "4× 10GBase-T (RJ-45)" },
      { label: "Reach", value: "30 m" },
      { label: "Aggregate BW", value: "40 Gbps" },
      { label: "Management", value: "4× 1GbE (Quad PHY)" },
      { label: "Power Draw", value: "3 W" },
      { label: "Weight", value: "25 g" },
      { label: "SWaP-C Savings", value: "−3 W, −15 g vs Optical" },
    ],
    features: [
      "No fiber management overhead",
      "Shielded RJ-45 for EMI protection",
      "Optimized for LEO radiation environment",
    ],
    interfaces: ["4× 10GBase-T (RJ-45)", "4× 1GbE Management"],
  },
  "mez-qsfp-3x": {
    id: "mez-qsfp-3x",
    name: "3× QSFP+ XMC Mezzanine",
    category: "Networking",
    tagline: "120 Gbps high-density interconnect",
    overview:
      "Triple-port QSFP+ mezzanine providing 120 Gbps aggregate bandwidth. Each QSFP+ cage supports 4×10G lanes or 1×40G operation. Flexible breakout cabling for high-density payload and rack interconnect scenarios.",
    specs: [
      { label: "Ports", value: "3× QSFP+" },
      { label: "Per-Port BW", value: "40 Gbps (4×10G)" },
      { label: "Aggregate BW", value: "120 Gbps" },
      { label: "Breakout", value: "SR4 / LR4 / 4×10G" },
      { label: "Power Draw", value: "8 W" },
      { label: "Weight", value: "55 g" },
    ],
    features: [
      "Flexible breakout cabling options",
      "High-density payload interconnect",
      "Hot-pluggable QSFP+ modules",
    ],
    interfaces: ["3× QSFP+ Cages", "SR4 / LR4 / 4×10G Breakout"],
  },
  "mez-qsfp-passive": {
    id: "mez-qsfp-passive",
    name: "10G QSFP Passive XMC Mezzanine",
    category: "Networking",
    tagline: "DAC / AOC — simplified cable management",
    overview:
      "Triple QSFP+ passive cages for Direct Attach Copper (≤5 m) or Active Optical Cable (≤100 m) interconnects. No active transceiver modules required — lower power and simplified cable management compared to active QSFP+.",
    specs: [
      { label: "Ports", value: "3× QSFP+ Passive" },
      { label: "DAC Reach", value: "≤ 5 m" },
      { label: "AOC Reach", value: "≤ 100 m" },
      { label: "Aggregate BW", value: "120 Gbps" },
      { label: "Power Draw", value: "5 W" },
      { label: "Weight", value: "48 g" },
    ],
    features: [
      "No active transceivers required",
      "Lower power than active QSFP+",
      "DAC or AOC cable options",
    ],
    interfaces: ["3× QSFP+ Passive Cages", "DAC ≤5 m / AOC ≤100 m"],
  },
  "timing-csac": {
    id: "timing-csac",
    name: "CSAC Precision Timing Module",
    category: "Expansion",
    tagline: "Nanosecond-class atomic clock — GPS-independent",
    overview:
      "A dedicated VPX expansion module housing a Chip-Scale Atomic Clock (CSAC). Provides GPS-independent nanosecond-class time synchronization with 1 PPS and 10 MHz reference outputs. IEEE 1588v2 PTP grandmaster capability. Optional signal filtering isolates timing outputs to either the Red or Black security domain.",
    specs: [
      { label: "PTP Accuracy", value: "< 50 ns" },
      { label: "1PPS Jitter", value: "< 1 ns" },
      { label: "10 MHz Stability", value: "±5×10⁻¹¹" },
      { label: "Allan Deviation", value: "< 3×10⁻¹⁰ at 1 s" },
      { label: "Power Draw", value: "13 W" },
      { label: "Weight", value: "275 g" },
      { label: "Domain Filter", value: "Red / Black selectable" },
    ],
    features: [
      "GPS-independent operation",
      "IEEE 1588v2 PTP Grandmaster",
      "Red/Black domain signal filtering",
      "Occupies one spare VPX slot",
    ],
    interfaces: ["1 PPS Output", "10 MHz Reference", "IEEE 1588v2 PTP", "Red/Black Filter Select"],
  },
  "psu-red": {
    id: "psu-red",
    name: "Power Converter (Red)",
    category: "Power",
    tagline: "28V primary input — Red security domain",
    overview:
      "28V DC primary input power converter for the Red side. Regulates and distributes power to the Red GPP and associated peripherals via +3.3V, +3.3V AUX, and +5V rails.",
    specs: [
      { label: "Input", value: "28 VDC" },
      { label: "Output Rails", value: "+3.3V AUX, +3.3V, +5V" },
      { label: "Power Draw", value: "5 W" },
      { label: "Weight", value: "140 g" },
    ],
    features: ["Dedicated Red-side power isolation", "Over-current protection", "Regulated multi-rail output"],
    interfaces: ["+3.3V AUX", "+3.3V Logic", "+5V Peripheral"],
  },
  "psu-black": {
    id: "psu-black",
    name: "Power Converter (Black)",
    category: "Power",
    tagline: "28V primary input — Black security domain + 12V rail",
    overview:
      "28V DC primary input power converter for the Black side. Supplies the Black GPP and provides the +12V high-power rail used by the backplane. The +12V rail is exclusive to the Black-side PSU.",
    specs: [
      { label: "Input", value: "28 VDC" },
      { label: "Output Rails", value: "+3.3V AUX, +3.3V, +5V, +12V" },
      { label: "Power Draw", value: "6 W" },
      { label: "Weight", value: "155 g" },
    ],
    features: ["Black-side power isolation", "+12V high-power rail (Black only)", "Over-current protection"],
    interfaces: ["+3.3V AUX", "+3.3V Logic", "+5V Peripheral", "+12V High-Power"],
  },
};

export function getModuleSpec(id: string): ModuleSpec | undefined {
  return MODULE_SPECS[id];
}
