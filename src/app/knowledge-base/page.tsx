"use client";

import { useState, useRef, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnswerCard } from "@/components/answer-card";
import type { AiResponse } from "@/lib/mock-ai";

// ── Example queries (customer-safe) ──────────────────────────────────────────

const EXAMPLE_QUERIES = [
  "optical networking",
  "copper interface",
  "precision timing",
  "redundancy architecture",
  "SWaP-C optimization",
  "crypto capabilities",
  "QSFP networking",
];

// ── Skeleton loader ───────────────────────────────────────────────────────────

function AnswerCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-accent/20 bg-accent/5 overflow-hidden">
      <div className="h-0.5 w-full bg-accent/30" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between gap-3">
          <div className="h-4 w-2/5 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="h-3 w-1/4 rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface SearchState {
  status: "idle" | "loading" | "done" | "error";
  results: AiResponse[];
  query: string;
  provider: string;
  errorMsg: string;
}

const INITIAL_STATE: SearchState = {
  status: "idle",
  results: [],
  query: "",
  provider: "",
  errorMsg: "",
};

export default function KnowledgeBasePage() {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState<SearchState>(INITIAL_STATE);
  const inputRef = useRef<HTMLInputElement>(null);

  async function runSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;

    setInputValue(trimmed);
    setSearch({ ...INITIAL_STATE, status: "loading", query: trimmed });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSearch((s) => ({
          ...s,
          status: "error",
          errorMsg: data.error ?? "Request failed",
        }));
        return;
      }

      setSearch({
        status: "done",
        results: data.results ?? [],
        query: data.query ?? trimmed,
        provider: data.provider ?? "",
        errorMsg: "",
      });
    } catch {
      setSearch((s) => ({
        ...s,
        status: "error",
        errorMsg: "Network error — could not reach the API.",
      }));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(inputValue);
  }

  function handleExample(q: string) {
    setInputValue(q);
    runSearch(q);
    inputRef.current?.focus();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Knowledge Base
          </h1>
          <Badge
            variant="outline"
            className="shrink-0 text-xs bg-accent/10 text-accent border-accent/30"
          >
            {process.env.NEXT_PUBLIC_AI_PROVIDER === "internal" ? "Live" : "Demo"} mode
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Ask questions about SNP capabilities, interfaces, networking options, and design rationale.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. optical networking, redundancy, SWaP-C…"
          className="flex-1"
          disabled={search.status === "loading"}
          aria-label="Search query"
        />
        <Button
          type="submit"
          disabled={search.status === "loading" || !inputValue.trim()}
        >
          {search.status === "loading" ? "Searching…" : "Search"}
        </Button>
      </form>

      {/* Example query chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-muted-foreground self-center uppercase tracking-widest">
          Try:
        </span>
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleExample(q)}
            className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground hover:border-accent/50 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Results area */}
      {search.status === "loading" && (
        <div className="space-y-4">
          <AnswerCardSkeleton />
          <AnswerCardSkeleton />
        </div>
      )}

      {search.status === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {search.errorMsg}
        </div>
      )}

      {search.status === "done" && search.results.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="font-heading text-base font-semibold text-foreground mb-1">
            No results found
          </p>
          <p className="text-sm text-muted-foreground">
            No documentation matched{" "}
            <span className="font-mono text-foreground">
              &quot;{search.query}&quot;
            </span>
            . Try a different term like &quot;optical&quot;, &quot;timing&quot;, or &quot;redundancy&quot;.
          </p>
        </div>
      )}

      {search.status === "done" && search.results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {search.results.length}
              </span>{" "}
              result{search.results.length !== 1 ? "s" : ""} for{" "}
              <span className="font-mono text-foreground">
                &quot;{search.query}&quot;
              </span>
            </p>
            {search.provider && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground border-muted"
              >
                via {search.provider}
              </Badge>
            )}
          </div>

          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-4">
              {search.results.map((result, i) => (
                <AnswerCard key={`${result.title}-${i}`} response={result} />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </main>
  );
}
