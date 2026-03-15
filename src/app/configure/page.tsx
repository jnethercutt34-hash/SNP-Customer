"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/lib/config-context";
import { MissionWizard } from "@/components/mission-wizard";
import { InteractiveChassis } from "@/components/interactive-chassis";
import { SlotPanel } from "@/components/slot-panel";
import { SwapGauges } from "@/components/swap-gauges";
import { InterfaceSummary } from "@/components/interface-summary";

export default function ConfigurePage() {
  const { dispatch } = useConfig();
  const [showWizard, setShowWizard] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Configure Your SNP
        </h1>
        <p className="mt-2 text-muted-foreground">
          Use the mission wizard or click any slot in the chassis to customise your configuration.
        </p>
      </div>

      {/* Mission Wizard */}
      {showWizard && (
        <MissionWizard onComplete={() => setShowWizard(false)} />
      )}

      {/* SWaP-C Gauges */}
      <div className="mb-6">
        <SwapGauges />
      </div>

      {/* Interactive Chassis */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Chassis Configuration
          </h2>
          <div className="flex gap-2">
            {!showWizard && (
              <Button variant="outline" size="sm" onClick={() => setShowWizard(true)}>
                Rerun Wizard
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "RESET" })}
            >
              Reset to Baseline
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          <span className="hidden md:inline">Click any slot to view details or change modules.</span>
          <span className="md:hidden">Tap any slot to view details or change modules.</span>
          {" "}Blue indicators mark configurable slots.
        </p>
        <InteractiveChassis onSlotClick={setSelectedSlot} />
      </div>

      {/* Interface Summary */}
      <div className="mb-6">
        <InterfaceSummary />
      </div>

      {/* Summary link */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/configure/summary">View Configuration Summary →</Link>
        </Button>
      </div>

      {/* Slot Panel (slide-out) */}
      {selectedSlot !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSelectedSlot(null)}
          />
          <SlotPanel
            slotNumber={selectedSlot}
            onClose={() => setSelectedSlot(null)}
          />
        </>
      )}
    </main>
  );
}
