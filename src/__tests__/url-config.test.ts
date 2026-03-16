import { describe, it, expect, beforeEach } from "vitest";
import { BASELINE_CONFIG, MODULES, type SlotConfig } from "../lib/product-catalog";

// ─── Re-implement URL encoding/decoding (mirrors config-context.tsx) ────────
// These are standalone pure functions, tested here in isolation.

interface CompactConfig {
  s2: string | null;
  s3: string | null;
  m4: string | null;
  m6: string | null;
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

function encodeConfig(slots: SlotConfig[]): string {
  const compact = toCompact(slots);
  return btoa(JSON.stringify(compact));
}

function decodeConfig(encoded: string): SlotConfig[] | null {
  try {
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

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Compact Config — toCompact / fromCompact", () => {
  it("baseline compacts to default mezzanines, null spares", () => {
    const compact = toCompact(BASELINE_CONFIG);
    expect(compact.s2).toBeNull();
    expect(compact.s3).toBeNull();
    expect(compact.m4).toBe("mez-optical-10g");
    expect(compact.m6).toBe("mez-optical-10g");
  });

  it("roundtrip: fromCompact(toCompact(config)) preserves fixed slots", () => {
    const roundtrip = fromCompact(toCompact(BASELINE_CONFIG));
    expect(roundtrip.find((s) => s.slotNumber === 1)?.moduleId).toBe("psu-red");
    expect(roundtrip.find((s) => s.slotNumber === 5)?.moduleId).toBe("crypto-unit");
    expect(roundtrip.find((s) => s.slotNumber === 7)?.moduleId).toBe("psu-black");
  });

  it("preserves spare slot modules in roundtrip", () => {
    const custom = BASELINE_CONFIG.map((s) =>
      s.slotNumber === 2 ? { ...s, moduleId: "timing-csac" } : s
    );
    const roundtrip = fromCompact(toCompact(custom));
    expect(roundtrip.find((s) => s.slotNumber === 2)?.moduleId).toBe("timing-csac");
  });

  it("preserves mezzanine choices in roundtrip", () => {
    const custom = BASELINE_CONFIG.map((s) =>
      s.slotNumber === 4 ? { ...s, mezzanineId: "mez-qsfp-3x" } : s
    );
    const roundtrip = fromCompact(toCompact(custom));
    expect(roundtrip.find((s) => s.slotNumber === 4)?.mezzanineId).toBe("mez-qsfp-3x");
  });
});

describe("URL Encoding — encode / decode", () => {
  it("encoded string is valid base64", () => {
    const encoded = encodeConfig(BASELINE_CONFIG);
    // Should not throw
    expect(() => atob(encoded)).not.toThrow();
  });

  it("encoded baseline is reasonably short (<200 chars)", () => {
    const encoded = encodeConfig(BASELINE_CONFIG);
    expect(encoded.length).toBeLessThan(200);
  });

  it("roundtrip: decode(encode(config)) matches original configurable choices", () => {
    const encoded = encodeConfig(BASELINE_CONFIG);
    const decoded = decodeConfig(encoded)!;
    expect(decoded).not.toBeNull();

    // Check configurable slots match
    expect(decoded.find((s) => s.slotNumber === 2)?.moduleId).toBeNull();
    expect(decoded.find((s) => s.slotNumber === 3)?.moduleId).toBeNull();
    expect(decoded.find((s) => s.slotNumber === 4)?.mezzanineId).toBe("mez-optical-10g");
    expect(decoded.find((s) => s.slotNumber === 6)?.mezzanineId).toBe("mez-optical-10g");
  });

  it("roundtrip preserves custom configuration", () => {
    const custom: SlotConfig[] = [
      { slotNumber: 1, moduleId: "psu-red" },
      { slotNumber: 2, moduleId: "timing-csac" },
      { slotNumber: 3, moduleId: null },
      { slotNumber: 4, moduleId: "gpp-red", mezzanineId: "mez-copper-10g" },
      { slotNumber: 5, moduleId: "crypto-unit" },
      { slotNumber: 6, moduleId: "gpp-black", mezzanineId: "mez-qsfp-passive" },
      { slotNumber: 7, moduleId: "psu-black" },
    ];
    const decoded = decodeConfig(encodeConfig(custom))!;
    expect(decoded.find((s) => s.slotNumber === 2)?.moduleId).toBe("timing-csac");
    expect(decoded.find((s) => s.slotNumber === 4)?.mezzanineId).toBe("mez-copper-10g");
    expect(decoded.find((s) => s.slotNumber === 6)?.mezzanineId).toBe("mez-qsfp-passive");
  });

  it("returns null for invalid base64", () => {
    expect(decodeConfig("not-valid-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 but invalid JSON", () => {
    expect(decodeConfig(btoa("not json"))).toBeNull();
  });

  it("returns null for valid JSON but invalid module IDs", () => {
    const bad = btoa(JSON.stringify({ s2: "fake-module", s3: null, m4: null, m6: null }));
    expect(decodeConfig(bad)).toBeNull();
  });

  it("accepts all-null compact config (empty spares, no mezzanines)", () => {
    const minimal = btoa(JSON.stringify({ s2: null, s3: null, m4: null, m6: null }));
    const decoded = decodeConfig(minimal)!;
    expect(decoded).not.toBeNull();
    expect(decoded).toHaveLength(7);
    expect(decoded.find((s) => s.slotNumber === 2)?.moduleId).toBeNull();
  });
});
