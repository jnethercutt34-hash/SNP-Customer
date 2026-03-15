import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mb-14">
        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
          3U SpaceVPX · VITA 78
        </Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Secure Network Processor
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          A ruggedized 3U SpaceVPX computing platform for space-borne signal processing,
          network switching, and cryptographic operations. Configure your own SNP to match
          your mission profile.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/configure">Configure Your SNP →</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/knowledge-base">AI Knowledge Base</Link>
          </Button>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-semibold mb-1 text-foreground">
          System Architecture
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Core subsystems of the SNP platform.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">3U VPX Form Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                VITA 78 SpaceVPX compliant chassis with 7 slots. PCIe Gen 3 ×4 control plane,
                dual 10 Gbps SerDes data lanes per slot. Radiation-tolerant construction for
                orbital environments. Operating range −21 °C to +50 °C deck temperature.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Dual-GPP Redundancy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Two General Purpose Processors run in hot-standby with {"<"}200 ms switchover.
                Each GPP is a two-CCA assembly: a fixed carrier board and a mission-configurable
                networking mezzanine. Black side can be demoted to co-processing mode for double throughput.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Processing Power</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each GPP features a quad-core ARM Cortex-A78AE processor with a 1.5M gate FPGA
                for signal processing and FEC. 16 GB DDR4 ECC memory and 2 Gb non-volatile storage
                provide radiation-tolerant compute and storage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Hardware Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedicated FIPS 140-2 Level 3 cryptographic module offloads encryption from both GPPs.
                AES-256-GCM at 40 Gbps line rate with active tamper-zeroization. ECC P-384 and RSA-4096
                key exchange.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Flexible Networking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each GPP accepts one networking mezzanine — choose from 10G Optical, 10G Copper,
                3× QSFP+, or QSFP Passive depending on your mission. All options include 1G quad PHY
                for management traffic.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Expansion Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Two spare VPX slots accommodate mission-specific expansion modules. Add a CSAC
                Precision Timing Module for nanosecond-class synchronization, or keep slots empty
                for reduced SWaP-C.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Mezzanine Options ────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="font-heading text-2xl font-semibold mb-1 text-foreground">
          Mezzanine Options
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Select a networking mezzanine for each GPP — the key configurable decision per mission.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "10G Optical",
              tag: "Baseline",
              tagColor: "bg-primary/20 text-primary border-primary/30",
              specs: [
                { label: "Bandwidth", value: "50 Gbps" },
                { label: "Power", value: "6 W" },
                { label: "Weight", value: "40 g" },
              ],
              desc: "Quad 10G fiber-optic channels. SFP+ · 1310 nm · 10 km reach. Standard for baseline builds.",
            },
            {
              name: "10G Copper",
              tag: "pLEO",
              tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
              specs: [
                { label: "Bandwidth", value: "40 Gbps" },
                { label: "Power", value: "3 W" },
                { label: "Weight", value: "25 g" },
              ],
              desc: "Quad 10GBase-T copper. Reduced SWaP-C for proliferated LEO constellations. −3 W vs optical.",
            },
            {
              name: "3× QSFP+",
              tag: "High-Density",
              tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
              specs: [
                { label: "Bandwidth", value: "120 Gbps" },
                { label: "Power", value: "8 W" },
                { label: "Weight", value: "55 g" },
              ],
              desc: "Triple QSFP+ cages. 40 Gbps per port with SR4/LR4 breakout options.",
            },
            {
              name: "QSFP Passive",
              tag: "DAC / AOC",
              tagColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
              specs: [
                { label: "Bandwidth", value: "120 Gbps" },
                { label: "Power", value: "5 W" },
                { label: "Weight", value: "48 g" },
              ],
              desc: "Triple QSFP+ passive for Direct Attach Copper or Active Optical Cable. No transceivers needed.",
            },
          ].map((mez) => (
            <Card key={mez.name} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-heading text-base leading-snug">
                    {mez.name}
                  </CardTitle>
                  <Badge className={`shrink-0 text-xs ${mez.tagColor}`}>
                    {mez.tag}
                  </Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed">
                  {mez.desc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {mez.specs.map(({ label, value }) => (
                    <div key={label} className="rounded-md bg-secondary/30 px-2 py-1.5">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-1">{label}</p>
                      <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="text-center py-12 rounded-xl border border-border bg-card/50">
        <h2 className="font-heading text-2xl font-semibold text-foreground mb-3">
          Ready to Configure?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Use our guided wizard to build your optimal SNP configuration, or jump straight
          to the interactive chassis configurator.
        </p>
        <Button size="lg" asChild>
          <Link href="/configure">Configure Your SNP →</Link>
        </Button>
      </section>
    </main>
  );
}
