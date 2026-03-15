"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfig } from "@/lib/config-context";
import { MODULES } from "@/lib/product-catalog";

export function InterfaceSummary() {
  const { state } = useConfig();

  // Collect interfaces from all populated modules and mezzanines
  const interfaces: { source: string; ifaces: string[] }[] = [];
  for (const slot of state.slots) {
    if (slot.moduleId) {
      const mod = MODULES[slot.moduleId];
      if (mod?.interfaces?.length) {
        interfaces.push({ source: mod.name, ifaces: mod.interfaces });
      }
    }
    if (slot.mezzanineId) {
      const mez = MODULES[slot.mezzanineId];
      if (mez?.interfaces?.length) {
        interfaces.push({ source: mez.name, ifaces: mez.interfaces });
      }
    }
  }

  // Deduplicate for summary
  const allIfaces = interfaces.flatMap((i) => i.ifaces);
  const unique = [...new Set(allIfaces)];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Interface Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {unique.length === 0 ? (
          <p className="text-sm text-muted-foreground">No interfaces configured.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unique.map((iface) => (
              <span
                key={iface}
                className="inline-block rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary/80 font-mono"
              >
                {iface}
              </span>
            ))}
          </div>
        )}

        {/* Detailed per-source breakdown */}
        {interfaces.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            {interfaces.map(({ source, ifaces: ifList }) => (
              <div key={source}>
                <p className="text-xs font-semibold text-foreground mb-1">{source}</p>
                <div className="flex flex-wrap gap-1">
                  {ifList.map((iface) => (
                    <span
                      key={iface}
                      className="inline-block rounded border border-border bg-secondary/30 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {iface}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
