import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODULE_SPECS } from "@/lib/module-specs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const spec = MODULE_SPECS[id];

  if (!spec) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Overview</Link>
        <span>/</span>
        <span className="text-foreground">{spec.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-xs">{spec.category}</Badge>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {spec.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{spec.tagline}</p>
      </div>

      {/* Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{spec.overview}</p>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {spec.specs.map(({ label, value }) => (
              <div key={label} className="rounded-md bg-secondary/30 px-3 py-2.5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {spec.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                {feat}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Interfaces */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Interfaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {spec.interfaces.map((iface) => (
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
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/">← Overview</Link>
        </Button>
        <Button asChild>
          <Link href="/configure">Configure Your SNP →</Link>
        </Button>
      </div>
    </main>
  );
}
