"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConfig } from "@/lib/config-context";
import {
  MODULES,
  SLOT_CONSTRAINTS,
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
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
            Print / PDF
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

      {/* Actions */}
      <div className="flex gap-3 justify-center no-print">
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
