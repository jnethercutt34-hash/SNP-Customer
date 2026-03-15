"use client";

import { useState, useEffect, useRef } from "react";
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
} from "@/lib/product-catalog";

// ─── Animated counter hook ──────────────────────────────────────────────────

function useAnimatedValue(target: number, duration = 400): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return display;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SwapGauges() {
  const { state } = useConfig();
  const totalPower = calcTotalPower(state.slots);
  const totalWeight = calcTotalWeight(state.slots);
  const powerPct = Math.round((totalPower / MAX_POWER_BUDGET) * 100);
  const weightPct = Math.round((totalWeight / MAX_WEIGHT_BUDGET) * 100);
  const powerMargin = MAX_POWER_BUDGET - totalPower;
  const weightMargin = MAX_WEIGHT_BUDGET - totalWeight;
  const occupiedSlots = state.slots.filter((s) => s.moduleId !== null).length;
  const componentCount = state.slots.filter((s) => s.moduleId).length +
    state.slots.filter((s) => s.mezzanineId).length;

  // Animated values
  const animPower = useAnimatedValue(totalPower);
  const animWeight = useAnimatedValue(totalWeight);
  const animPowerPct = useAnimatedValue(powerPct);
  const animWeightPct = useAnimatedValue(weightPct);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Power */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Power</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums">
            {animPower} W
            <span className={`ml-2 text-sm font-normal transition-colors duration-300 ${
              powerPct >= POWER_WARNING_PCT ? "text-red-400" : "text-green-400"
            }`}>
              ({powerMargin} W margin)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={animPowerPct}
            className={`h-2 mb-1 transition-all duration-500 ${
              powerPct >= POWER_WARNING_PCT
                ? "[&>[data-slot=progress-indicator]]:bg-red-500"
                : ""
            }`}
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {animPowerPct}% of {MAX_POWER_BUDGET} W bus limit
          </p>
        </CardContent>
      </Card>

      {/* Weight */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Weight</CardDescription>
          <CardTitle className="font-heading text-2xl tabular-nums">
            {(animWeight / 1000).toFixed(2)} kg
            <span className={`ml-2 text-sm font-normal transition-colors duration-300 ${
              weightPct >= WEIGHT_WARNING_PCT ? "text-red-400" : "text-green-400"
            }`}>
              ({(weightMargin / 1000).toFixed(2)} kg margin)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={animWeightPct}
            className={`h-2 mb-1 transition-all duration-500 ${
              weightPct >= WEIGHT_WARNING_PCT
                ? "[&>[data-slot=progress-indicator]]:bg-red-500"
                : ""
            }`}
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {animWeightPct}% of {(MAX_WEIGHT_BUDGET / 1000).toFixed(1)} kg allocation
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
          <CardTitle className="font-heading text-2xl">{componentCount}</CardTitle>
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
