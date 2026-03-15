import { NextRequest, NextResponse } from "next/server";
import { searchAiResponses } from "@/lib/mock-ai";

export async function POST(request: NextRequest) {
  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const provider = process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock";

  // ── Mock provider ────────────────────────────────────────────────────────
  if (provider === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const results = searchAiResponses(query);
    return NextResponse.json({ results, provider, query });
  }

  // ── Internal / Company AI ────────────────────────────────────────────────
  if (provider === "internal") {
    const endpoint = process.env.AI_ENDPOINT;
    const token    = process.env.AI_AUTH_TOKEN;
    const model    = process.env.AI_MODEL ?? "gpt-4";

    if (!endpoint || !token) {
      return NextResponse.json(
        { error: "AI_ENDPOINT and AI_AUTH_TOKEN must be set in environment variables." },
        { status: 503 }
      );
    }

    const { loadAllDocuments, buildContext } = await import("@/lib/document-store");
    const docs    = await loadAllDocuments();
    const context = buildContext(docs);

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    let aiText: string;
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a technical documentation assistant for the SNP (Secure Network Processor) " +
              "product line. Answer questions accurately and concisely based only on the following " +
              "product documentation. Do not reference internal part numbers, vendor names, or other " +
              "customer configurations. If the answer cannot be found in the documents, say so clearly.\n\n" +
              context,
          },
          {
            role: "user",
            content: query,
          },
        ],
      });
      aiText = completion.choices[0]?.message?.content ?? "No response returned by the AI.";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `AI request failed: ${message}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      results: [
        {
          title: query,
          summary: aiText,
          source: `${docs.length} document(s) loaded`,
        },
      ],
      provider: "internal",
      query,
    });
  }

  return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 500 });
}
