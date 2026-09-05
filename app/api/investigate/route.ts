import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type EvidenceRecord = {
  id: string;
  title: string;
  year?: number;
  authors: string[];
  source: "Crossref" | "OpenAlex";
  sourceId: string;
  uri: string;
  doi?: string;
  retrievedAt: string;
  evidence: string;
};

const stopWords = new Set([
  "about", "after", "among", "based", "between", "from", "into", "over", "study", "that", "their", "these", "this", "through", "using", "with",
]);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 40);
  const limit = Math.max(6, Math.min(50, Number.isFinite(requestedLimit) ? requestedLimit : 40));
  if (!query || query.length < 3) {
    return NextResponse.json({ error: "Enter at least three characters." }, { status: 400 });
  }

  const retrievedAt = new Date().toISOString();
  const [crossref, openAlex] = await Promise.allSettled([
    searchCrossref(query, retrievedAt, limit),
    searchOpenAlex(query, retrievedAt, limit),
  ]);
  const records = [
    ...(crossref.status === "fulfilled" ? crossref.value : []),
    ...(openAlex.status === "fulfilled" ? openAlex.value : []),
  ];
  const liveSources = [
    ...(crossref.status === "fulfilled" ? ["Crossref"] : []),
    ...(openAlex.status === "fulfilled" ? ["OpenAlex"] : []),
  ];

  if (records.length === 0) {
    return NextResponse.json(
      { error: "The connected sources returned no records.", liveSources },
      { status: 502 },
    );
  }

  return NextResponse.json({
    query,
    retrievedAt,
    liveSources,
    records,
    pattern: recurringTerms(records),
  });
}

async function searchCrossref(query: string, retrievedAt: string, limit: number): Promise<EvidenceRecord[]> {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query", query);
  url.searchParams.set("rows", String(limit));
  url.searchParams.set("select", "DOI,title,author,published,URL,abstract");
  const response = await fetch(url, {
    headers: { "User-Agent": "Noema/0.1 (mailto:research@noema.tools)" },
  });
  if (!response.ok) throw new Error(`Crossref returned ${response.status}`);
  const data = (await response.json()) as { message?: { items?: Array<Record<string, unknown>> } };
  return (data.message?.items ?? []).map((item, index) => {
    const doi = String(item.DOI ?? "");
    const titles = item.title as string[] | undefined;
    const authors = (item.author as Array<{ given?: string; family?: string }> | undefined) ?? [];
    const published = item.published as { "date-parts"?: number[][] } | undefined;
    const title = cleanText(titles?.[0] ?? "Untitled record");
    return {
      id: `crossref-${doi || index}`,
      title,
      year: published?.["date-parts"]?.[0]?.[0],
      authors: authors.slice(0, 5).map(({ given, family }) => [given, family].filter(Boolean).join(" ")),
      source: "Crossref",
      sourceId: doi || `result-${index}`,
      uri: doi ? `https://doi.org/${doi}` : String(item.URL ?? "https://www.crossref.org"),
      doi: doi || undefined,
      retrievedAt,
      evidence: cleanText(String(item.abstract ?? title)).slice(0, 420),
    };
  });
}

async function searchOpenAlex(query: string, retrievedAt: string, limit: number): Promise<EvidenceRecord[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("per-page", String(limit));
  url.searchParams.set("mailto", "research@noema.tools");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`OpenAlex returned ${response.status}`);
  const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
  return (data.results ?? []).map((item, index) => {
    const authorships = (item.authorships as Array<{ author?: { display_name?: string } }> | undefined) ?? [];
    const doi = typeof item.doi === "string" ? item.doi.replace("https://doi.org/", "") : undefined;
    const sourceId = String(item.id ?? `result-${index}`).replace("https://openalex.org/", "");
    const title = cleanText(String(item.display_name ?? item.title ?? "Untitled record"));
    return {
      id: `openalex-${sourceId}`,
      title,
      year: typeof item.publication_year === "number" ? item.publication_year : undefined,
      authors: authorships.slice(0, 5).map(({ author }) => author?.display_name ?? "Unknown author"),
      source: "OpenAlex",
      sourceId,
      uri: doi ? `https://doi.org/${doi}` : String(item.id ?? "https://openalex.org"),
      doi,
      retrievedAt,
      evidence: title,
    };
  });
}

function recurringTerms(records: EvidenceRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const unique = new Set(record.title.toLowerCase().match(/[a-z][a-z-]{4,}/g) ?? []);
    for (const term of unique) {
      if (!stopWords.has(term)) counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([term]) => term);
}

function cleanText(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
