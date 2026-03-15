import { Badge } from "@/components/ui/badge";
import type { AiResponse, ConfidenceLevel } from "@/lib/mock-ai";

function confidenceBadgeClass(confidence: ConfidenceLevel): string {
  const map: Record<ConfidenceLevel, string> = {
    High: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return map[confidence];
}

interface AnswerCardProps {
  response: AiResponse;
}

export function AnswerCard({ response }: AnswerCardProps) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 overflow-hidden">
      <div className="h-0.5 w-full bg-accent" />

      <div className="p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-accent leading-snug">
            {response.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {response.confidence && (
              <Badge
                variant="outline"
                className={`text-xs ${confidenceBadgeClass(response.confidence)}`}
              >
                {response.confidence} confidence
              </Badge>
            )}
          </div>
        </div>

        {response.source && (
          <p className="text-xs text-muted-foreground font-mono">
            {response.source}
          </p>
        )}

        <p className="text-sm text-foreground leading-relaxed">
          {response.summary}
        </p>

        {response.relatedKeys && response.relatedKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-accent/20">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Related:
            </span>
            {response.relatedKeys.map((key) => (
              <Badge
                key={key}
                variant="outline"
                className="text-xs text-muted-foreground border-muted font-mono"
              >
                {key}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
