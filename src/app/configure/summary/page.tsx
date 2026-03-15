"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConfig, encodeConfigToUrl } from "@/lib/config-context";
import {
  MODULES,
  SLOT_CONSTRAINTS,
  BASELINE_CONFIG,
  calcTotalPower,
  calcTotalWeight,
  MAX_POWER_BUDGET,
  MAX_WEIGHT_BUDGET,
  getConfigInterfaces,
} from "@/lib/product-catalog";

export default function SummaryPage() {
  const { state } = useConfig();
  const totalPower = calcTotalPower(state.slots);
  const totalWeight = calcTotalWeight(state.slots);
  const powerPct = Math.round((totalPower / MAX_POWER_BUDGET) * 100);
  const weightPct = Math.round((totalWeight / MAX_WEIGHT_BUDGET) * 100);
  const interfaces = getConfigInterfaces(state.slots);
  const uniqueInterfaces = [...new Set(interfaces)];

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Print-only header (hidden on screen) */}
      <div className="hidden print-only mb-8" style={{ display: "none" }}>
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">SNP Configuration Summary</h1>
            <p className="text-sm text-gray-600">Secure Network Processor · 3U SpaceVPX · VITA 78</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Generated: {generatedDate}</p>
            <p>Power: {totalPower} W / {MAX_POWER_BUDGET} W</p>
            <p>Weight: {(totalWeight / 1000).toFixed(2)} kg / {(MAX_WEIGHT_BUDGET / 1000).toFixed(1)} kg</p>
          </div>
        </div>
      </div>

      {/* Screen header */}
      <div className="mb-8 flex items-center justify-between no-print">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Configuration Summary
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Full slot-by-slot breakdown of your SNP configuration.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            🖨️ Print / PDF
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/configure">← Edit Configuration</Link>
          </Button>
        </div>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Power</p>
            <p className="font-heading text-2xl font-bold text-primary">{totalPower} W</p>
            <p className="text-xs text-muted-foreground">{powerPct}% of {MAX_POWER_BUDGET} W</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Weight</p>
            <p className="font-heading text-2xl font-bold text-accent">{(totalWeight / 1000).toFixed(2)} kg</p>
            <p className="text-xs text-muted-foreground">{weightPct}% of {(MAX_WEIGHT_BUDGET / 1000).toFixed(1)} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Occupied Slots</p>
            <p className="font-heading text-2xl font-bold text-foreground">
              {state.slots.filter((s) => s.moduleId).length} / 7
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Power Margin</p>
            <p className="font-heading text-2xl font-bold text-green-400">{MAX_POWER_BUDGET - totalPower} W</p>
          </CardContent>
        </Card>
      </div>

      {/* Slot-by-slot breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Slot-by-Slot Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.slots.map((slotConfig) => {
              const constraint = SLOT_CONSTRAINTS.find((c) => c.slotNumber === slotConfig.slotNumber);
              const mod = slotConfig.moduleId ? MODULES[slotConfig.moduleId] : null;
              const mez = slotConfig.mezzanineId ? MODULES[slotConfig.mezzanineId] : null;
              const slotPower = (mod?.powerWatts ?? 0) + (mez?.powerWatts ?? 0);
              const slotWeight = (mod?.weightGrams ?? 0) + (mez?.weightGrams ?? 0);

              return (
                <div
                  key={slotConfig.slotNumber}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          Slot {slotConfig.slotNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">—</span>
                        <span className="text-sm font-medium text-foreground">
                          {constraint?.label}
                        </span>
                        {constraint?.fixed && !constraint.hasMezzanine && (
                          <Badge variant="secondary" className="text-xs">Fixed</Badge>
                        )}
                      </div>

                      {mod ? (
                        <div>
                          <p className="text-sm font-medium text-foreground">{mod.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Empty</p>
                      )}

                      {mez && (
                        <div className="mt-2 pl-3 border-l-2 border-primary/30">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Mezzanine</p>
                          <p className="text-sm font-medium text-primary">{mez.name}</p>
                          <p className="text-xs text-muted-foreground">{mez.description}</p>
                        </div>
                      )}
                    </div>

                    {mod && (
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono font-semibold text-primary">{slotPower} W</p>
                        <p className="text-xs font-mono text-muted-foreground">{slotWeight} g</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interfaces */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Available Interfaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueInterfaces.map((iface) => (
              <span
                key={iface}
                className="inline-block rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary/80 font-mono"
              >
                {iface}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison vs Baseline */}
      <BaselineComparison currentSlots={state.slots} />

      {/* Actions */}
      <ShareButton slots={state.slots} />

      <div className="flex gap-3 justify-center no-print mt-4">
        <Button variant="outline" asChild>
          <Link href="/configure">← Edit Configuration</Link>
        </Button>
        <Button onClick={() => window.print()}>
          Print / Download PDF
        </Button>
      </div>
    </main>
  );
}

// ─── Baseline Comparison Component ──────────────────────────────────────────

function BaselineComparison({ currentSlots }: { currentSlots: import("@/lib/product-catalog").SlotConfig[] }) {
  const [showComparison, setShowComparison] = useState(false);

  const baselinePower = calcTotalPower(BASELINE_CONFIG);
  const baselineWeight = calcTotalWeight(BASELINE_CONFIG);
  const currentPower = calcTotalPower(currentSlots);
  const currentWeight = calcTotalWeight(currentSlots);
  const powerDelta = currentPower - baselinePower;
  const weightDelta = currentWeight - baselineWeight;

  // Find slot-level differences
  const changes: { slot: number; label: string; from: string; to: string }[] = [];
  for (const slot of currentSlots) {
    const baseline = BASELINE_CONFIG.find((b) => b.slotNumber === slot.slotNumber);
    if (!baseline) continue;

    if (slot.moduleId !== baseline.moduleId) {
      const fromName = baseline.moduleId ? MODULES[baseline.moduleId]?.name ?? "Unknown" : "Empty";
      const toName = slot.moduleId ? MODULES[slot.moduleId]?.name ?? "Unknown" : "Empty";
      changes.push({ slot: slot.slotNumber, label: "Module", from: fromName, to: toName });
    }
    if (slot.mezzanineId !== baseline.mezzanineId) {
      const fromName = baseline.mezzanineId ? MODULES[baseline.mezzanineId]?.name ?? "Unknown" : "None";
      const toName = slot.mezzanineId ? MODULES[slot.mezzanineId]?.name ?? "Unknown" : "None";
      changes.push({ slot: slot.slotNumber, label: "Mezzanine", from: fromName, to: toName });
    }
  }

  const isBaseline = changes.length === 0;

  if (isBaseline) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6 text-center">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs mb-2">
            Baseline
          </Badge>
          <p className="text-sm text-muted-foreground">
            Your configuration matches the baseline reference build.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg">Comparison vs Baseline</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="no-print"
          >
            {showComparison ? "Hide" : "Show"} Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Delta summary */}
        <div className="flex gap-6 mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Power Delta</p>
            <p className={`text-lg font-heading font-bold font-mono ${
              powerDelta > 0 ? "text-amber-400" : powerDelta < 0 ? "text-emerald-400" : "text-foreground"
            }`}>
              {powerDelta > 0 ? "+" : ""}{powerDelta} W
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Weight Delta</p>
            <p className={`text-lg font-heading font-bold font-mono ${
              weightDelta > 0 ? "text-amber-400" : weightDelta < 0 ? "text-emerald-400" : "text-foreground"
            }`}>
              {weightDelta > 0 ? "+" : ""}{weightDelta} g
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Changes</p>
            <p className="text-lg font-heading font-bold text-foreground">{changes.length}</p>
          </div>
        </div>

        {/* Detailed changes */}
        {showComparison && (
          <div className="space-y-2 border-t border-border pt-3">
            {changes.map((change, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
                  Slot {change.slot}
                </span>
                <Badge variant="secondary" className="text-xs shrink-0">{change.label}</Badge>
                <span className="text-red-400 line-through text-xs">{change.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-emerald-400 text-xs font-medium">{change.to}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Share Button Component ─────────────────────────────────────────────────

function ShareButton({ slots }: { slots: import("@/lib/product-catalog").SlotConfig[] }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = encodeConfigToUrl(slots);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback: prompt with URL
      window.prompt("Copy this shareable link:", url);
    });
  }

  return (
    <div className="flex justify-center no-print">
      <Button variant="outline" size="sm" onClick={handleShare}>
        {copied ? "✓ Link Copied!" : "🔗 Share Configuration Link"}
      </Button>
    </div>
  );
}
