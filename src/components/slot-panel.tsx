"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfig } from "@/lib/config-context";
import {
  MODULES,
  SLOT_CONSTRAINTS,
  type SlotConstraint,
  type Module,
} from "@/lib/product-catalog";

// ─── Component ──────────────────────────────────────────────────────────────

interface SlotPanelProps {
  slotNumber: number;
  onClose: () => void;
}

export function SlotPanel({ slotNumber, onClose }: SlotPanelProps) {
  const { state, dispatch } = useConfig();
  const constraint = SLOT_CONSTRAINTS.find((c) => c.slotNumber === slotNumber);
  const slotConfig = state.slots.find((s) => s.slotNumber === slotNumber);

  if (!constraint || !slotConfig) return null;

  const isSpareSlot = constraint.role === "spare";
  const hasOptions = isSpareSlot || constraint.hasMezzanine;

  if (!hasOptions) {
    // Fixed slot — show info only
    const mod = slotConfig.moduleId ? MODULES[slotConfig.moduleId] : null;
    return (
      <FixedSlotInfo
        constraint={constraint}
        module={mod}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Slot {slotNumber}
          </p>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {constraint.label}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>

      <div className="p-5 space-y-6">
        {/* Spare slot — module selection */}
        {isSpareSlot && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Module</h4>

            {/* Empty option */}
            <ModuleCard
              label="Empty"
              description="Leave this slot unoccupied for reduced SWaP-C."
              isSelected={slotConfig.moduleId === null}
              onSelect={() =>
                dispatch({ type: "SET_SLOT_MODULE", slotNumber, moduleId: null })
              }
            />

            {/* Module options */}
            {constraint.allowedModuleIds?.map((modId) => {
              const mod = MODULES[modId];
              if (!mod) return null;
              return (
                <ModuleCard
                  key={modId}
                  label={mod.name}
                  description={mod.description}
                  power={mod.powerWatts}
                  weight={mod.weightGrams}
                  interfaces={mod.interfaces}
                  isSelected={slotConfig.moduleId === modId}
                  onSelect={() =>
                    dispatch({ type: "SET_SLOT_MODULE", slotNumber, moduleId: modId })
                  }
                />
              );
            })}
          </div>
        )}

        {/* GPP slot — mezzanine selection */}
        {constraint.hasMezzanine && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Networking Mezzanine</h4>

            {constraint.allowedMezzanineIds?.map((mezId) => {
              const mez = MODULES[mezId];
              if (!mez) return null;
              return (
                <ModuleCard
                  key={mezId}
                  label={mez.name}
                  description={mez.description}
                  power={mez.powerWatts}
                  weight={mez.weightGrams}
                  interfaces={mez.interfaces}
                  specs={mez.keySpecs}
                  isSelected={slotConfig.mezzanineId === mezId}
                  onSelect={() =>
                    dispatch({ type: "SET_SLOT_MEZZANINE", slotNumber, mezzanineId: mezId })
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ModuleCard({
  label,
  description,
  power,
  weight,
  interfaces,
  specs,
  isSelected,
  onSelect,
}: {
  label: string;
  description: string;
  power?: number;
  weight?: number;
  interfaces?: string[];
  specs?: { label: string; value: string }[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg border p-4 mb-3 transition-all ${
        isSelected
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : "border-border hover:border-primary/30 hover:bg-secondary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-medium text-sm text-foreground">{label}</p>
        {isSelected && (
          <Badge className="shrink-0 bg-primary/20 text-primary border-primary/30 text-xs">
            Selected
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{description}</p>

      {(power !== undefined || weight !== undefined) && (
        <div className="flex gap-4 mb-2">
          {power !== undefined && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Power</span>
              <p className="text-xs font-semibold text-primary font-mono">{power} W</p>
            </div>
          )}
          {weight !== undefined && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Weight</span>
              <p className="text-xs font-semibold text-accent font-mono">{weight} g</p>
            </div>
          )}
        </div>
      )}

      {specs && specs.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {specs.map(({ label: l, value: v }) => (
            <div key={l} className="rounded bg-secondary/30 px-2 py-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{l}</p>
              <p className="text-xs font-mono text-foreground">{v}</p>
            </div>
          ))}
        </div>
      )}

      {interfaces && interfaces.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {interfaces.map((iface) => (
            <span
              key={iface}
              className="inline-block rounded border border-border bg-secondary/30 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {iface}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

function FixedSlotInfo({
  constraint,
  module: mod,
  onClose,
}: {
  constraint: SlotConstraint;
  module: Module | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto">
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Slot {constraint.slotNumber}
          </p>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {constraint.label}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>
      <div className="p-5">
        <Badge variant="secondary" className="mb-3 text-xs">Fixed — Not Configurable</Badge>
        {mod && (
          <>
            <h4 className="font-medium text-foreground mb-2">{mod.name}</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{mod.description}</p>
            {mod.keySpecs && (
              <div className="grid grid-cols-2 gap-2">
                {mod.keySpecs.map(({ label, value }) => (
                  <div key={label} className="rounded-md bg-secondary/30 px-3 py-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-mono text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
