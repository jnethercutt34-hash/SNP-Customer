"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConfig } from "@/lib/config-context";
import type { SlotConfig } from "@/lib/product-catalog";

// ─── Wizard Steps ───────────────────────────────────────────────────────────

interface WizardAnswers {
  orbit: "LEO" | "pLEO" | null;
  dataRate: "standard" | "high-density" | "low-power" | null;
  timing: "none" | "precision" | null;
}

const ORBIT_OPTIONS = [
  { value: "LEO" as const, label: "LEO", desc: "Standard Low Earth Orbit — baseline radiation requirements" },
  { value: "pLEO" as const, label: "Proliferated LEO", desc: "Constellation — optimised SWaP-C, copper networking" },
];

const DATA_RATE_OPTIONS = [
  { value: "standard" as const, label: "Standard (10G Optical)", desc: "50 Gbps aggregate fiber-optic — baseline" },
  { value: "high-density" as const, label: "High-Density (QSFP+)", desc: "120 Gbps aggregate — payload interconnect" },
  { value: "low-power" as const, label: "Low-Power (10G Copper)", desc: "40 Gbps aggregate — reduced SWaP-C" },
];

const TIMING_OPTIONS = [
  { value: "none" as const, label: "Standard Timing", desc: "GPS-disciplined — no additional hardware" },
  { value: "precision" as const, label: "Precision Timing (CSAC)", desc: "Nanosecond-class atomic clock — GPS-independent" },
];

// ─── Recommendation Engine ──────────────────────────────────────────────────

function generateConfig(answers: WizardAnswers): SlotConfig[] {
  let mez = "mez-optical-10g";
  if (answers.dataRate === "high-density") mez = "mez-qsfp-3x";
  else if (answers.dataRate === "low-power" || answers.orbit === "pLEO") mez = "mez-copper-10g";

  const config: SlotConfig[] = [
    { slotNumber: 1, moduleId: "psu-red" },
    { slotNumber: 2, moduleId: answers.timing === "precision" ? "timing-csac" : null },
    { slotNumber: 3, moduleId: null },
    { slotNumber: 4, moduleId: "gpp-red", mezzanineId: mez },
    { slotNumber: 5, moduleId: "crypto-unit" },
    { slotNumber: 6, moduleId: "gpp-black", mezzanineId: mez },
    { slotNumber: 7, moduleId: "psu-black" },
  ];

  return config;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface MissionWizardProps {
  onComplete: () => void;
}

export function MissionWizard({ onComplete }: MissionWizardProps) {
  const { dispatch } = useConfig();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({
    orbit: null,
    dataRate: null,
    timing: null,
  });

  const steps = [
    {
      title: "Orbit & Environment",
      subtitle: "Where will the SNP operate?",
      options: ORBIT_OPTIONS,
      key: "orbit" as const,
      value: answers.orbit,
    },
    {
      title: "Data Rate & Networking",
      subtitle: "What are your networking requirements?",
      options: DATA_RATE_OPTIONS,
      key: "dataRate" as const,
      value: answers.dataRate,
    },
    {
      title: "Timing & Synchronization",
      subtitle: "Do you need precision timing?",
      options: TIMING_OPTIONS,
      key: "timing" as const,
      value: answers.timing,
    },
  ];

  const currentStep = steps[step];
  const canProceed = currentStep?.value !== null;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [currentStep.key]: value }));
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Generate and apply config
      const config = generateConfig(answers);
      dispatch({ type: "SET_FULL_CONFIG", config });
      onComplete();
    }
  }

  function handleSkip() {
    dispatch({ type: "RESET" });
    onComplete();
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="font-heading text-xl">Mission Wizard</CardTitle>
              <Badge variant="outline" className="text-xs">
                Step {step + 1} of {steps.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Answer a few questions to get a recommended starting configuration.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            Skip Wizard →
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
            {currentStep.title}
          </h3>
          <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {currentStep.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`text-left rounded-lg border p-4 transition-all ${
                currentStep.value === opt.value
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30"
              }`}
            >
              <p className="font-medium text-foreground text-sm mb-1">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            ← Back
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {step === steps.length - 1 ? "Apply Configuration" : "Next →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
