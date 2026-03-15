"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useConfig } from "@/lib/config-context";
import {
  calcTotalPower,
  calcTotalWeight,
  MAX_POWER_BUDGET,
  MAX_WEIGHT_BUDGET,
  POWER_WARNING_PCT,
  WEIGHT_WARNING_PCT,
  MODULES,
} from "@/lib/product-catalog";

export function SwapGauges() {
  const { state } = useConfig();
  const totalPower = calcTotalPower(state.slots);
  const totalWeight = calcTotalWeight(state.slots);
  const powerPct = Math.round((totalPower / MAX_POWER_BUDGET) * 100);
  const weightPct = Math.round((totalWeight / MAX_WEIGHT_BUDGET) * 100);
  const powerMargin = MAX_POWER_BUDGET - totalPower;
  const weightMargin = MAX_WEIGHT_BUDGET - totalWeight;
  const occupiedSlots = state.slots.filter((s) => s.moduleId !== null).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Power */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Power</CardDescription>
          <CardTitle className="font-heading text-2xl">
            {totalPower} W
            <span className={`ml-2 text-sm font-normal ${
              powerPct >= POWER_WARNING_PCT ? "text-red-400" : "text-green-400"
            }`}>
              ({powerMargin} W margin)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={powerPct}
            className={`h-2 mb-1 ${powerPct >= POWER_WARNING_PCT ? "[&>[data-slot=progress-indicator]]:bg-red-500" : ""}`}
          />
          <p className="text-xs text-muted-foreground">
            {powerPct}% of {MAX_POWER_BUDGET} W bus limit
          </p>
        </CardContent>
      </Card>

      {/* Weight */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Weight</CardDescription>
          <CardTitle className="font-heading text-2xl">
            {(totalWeight / 1000).toFixed(2)} kg
            <span className={`ml-2 text-sm font-normal ${
              weightPct >= WEIGHT_WARNING_PCT ? "text-red-400" : "text-green-400"
            }`}>
              ({(weightMargin / 1000).toFixed(2)} kg margin)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={weightPct}
            className={`h-2 mb-1 ${weightPct >= WEIGHT_WARNING_PCT ? "[&>[data-slot=progress-indicator]]:bg-red-500" : ""}`}
          />
          <p className="text-xs text-muted-foreground">
            {weightPct}% of {(MAX_WEIGHT_BUDGET / 1000).toFixed(1)} kg allocation
          </p>
        </CardContent>
      </Card>

      {/* Populated Slots */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Populated Slots</CardDescription>
          <CardTitle className="font-heading text-2xl">
            {occupiedSlots}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ 7</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {7 - occupiedSlots} spare slot{7 - occupiedSlots !== 1 ? "s" : ""} available
          </p>
        </CardContent>
      </Card>

      {/* Component Count */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Components</CardDescription>
          <CardTitle className="font-heading text-2xl">
            {state.slots.filter((s) => s.moduleId).length +
              state.slots.filter((s) => s.mezzanineId).length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            base cards + mezzanines
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
