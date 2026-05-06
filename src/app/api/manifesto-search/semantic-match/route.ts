import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/services/vectorStore";

export const runtime = "nodejs";

const TOKEN_WEIGHTS: Record<string, number> = {
  neet: 2.5,
  gst: 2.2,
  cauvery: 2.0,
  katchatheevu: 2.0,
  "two-language": 1.8,
  "caste survey": 1.8,
  "one nation": 1.8,
  delimit: 1.8,
  electricity: 1.4,
  water: 1.4,
  weaver: 1.3,
  farmer: 1.3,
  sports: 1.2,
  education: 1.0,
  government: 1.0,
  welfare: 1.0,
};

const SEMANTIC_CONFIDENCE_THRESHOLD = 0.35;

// Cosine similarity in-memory calculation
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA === 0 || normB === 0
    ? 0
    : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Query Normalization Pipeline
function normalizeQuery(rawQuery: string, dictionary: Record<string, string[]>): string[] {
  const lowercase = rawQuery.toLowerCase();
  const stripped = lowercase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\']/g, " ");
  const tokens = stripped
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const stopwords = new Set(["the", "and", "is", "for", "of", "with", "on", "to", "a", "an"]);
  const filtered = tokens.filter((t) => !stopwords.has(t));

  // Basic plural stemmer
  const stemmed = filtered.map((t) => {
    if (t.endsWith("es")) return t.substring(0, t.length - 2);
    if (t.endsWith("s") && !t.endsWith("ss")) return t.substring(0, t.length - 1);
    return t;
  });

  // Bidirectional Synonym Expansion
  const expanded = new Set<string>();
  stemmed.forEach((t) => {
    expanded.add(t);
    if (dictionary[t]) {
      dictionary[t].forEach((syn) => expanded.add(syn));
    }
  });

  return Array.from(expanded);
}

// Weighted Token Overlap
function getWeightedOverlap(queryTokens: string[], docKeywords: string[]): number {
  if (queryTokens.length === 0) return 0;

  const docSet = new Set(docKeywords.map((k) => k.toLowerCase()));
  let matchWeightSum = 0;
  let totalWeightSum = 0;

  queryTokens.forEach((t) => {
    const weight = TOKEN_WEIGHTS[t] || 1.0;
    totalWeightSum += weight;
    if (docSet.has(t)) {
      matchWeightSum += weight;
    }
  });

  return totalWeightSum === 0 ? 0 : matchWeightSum / totalWeightSum;
}

// Fetch Query Embedding from Gemini API
async function fetchQueryEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: {
        parts: [{ text }],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Embedding API failed: ${errText}`);
  }

  const data = (await response.json()) as any;
  const embedding = data?.embedding?.values;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Invalid response format from Embedding API.");
  }
  return embedding;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const cleanQuery = query.trim();

    // 1. Initialize Indexes & Dictionaries
    const dictionary = require("@/data/multilingual_dictionary.json");
    const clientDocs = require("@/data/tvk_manifesto_documents.json") as any[];
    const vectorStore = getVectorStore();

    // 2. Normalize Query
    const normalizedTokens = normalizeQuery(cleanQuery, dictionary);

    // 3. Fetch Query Embedding
    const queryVector = await fetchQueryEmbedding(cleanQuery);

    // 4. Compute Scores
    const scoredResults = clientDocs.map((doc) => {
      const serverItem = vectorStore.vectors[doc.id];
      if (!serverItem) {
        return { ...doc, hybridScore: 0 };
      }

      // Semantic Cosine Similarity
      const semanticSim = cosineSimilarity(queryVector, serverItem.embedding);

      // Weighted Token Overlap
      const keywordOverlap = getWeightedOverlap(normalizedTokens, doc.keywords);

      // Exact Match Bonus
      const isExactMatch =
        doc.promise.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        doc.section_name.toLowerCase().includes(cleanQuery.toLowerCase());
      const exactMatchBonus = isExactMatch ? 1.0 : 0.0;

      // Hybrid Scoring Formula
      const hybridScore =
        semanticSim * 0.7 + keywordOverlap * 0.2 + exactMatchBonus * 0.1;

      return {
        ...doc,
        semanticSimilarity: semanticSim,
        keywordOverlap,
        exactMatchBonus,
        hybridScore,
      };
    });

    // 5. Apply Ranking Diversity Protection
    // Sort by hybridScore first
    scoredResults.sort((a, b) => b.hybridScore - a.hybridScore);

    const diversifiedResults: any[] = [];
    const sectionCounts: Record<string, number> = {};

    scoredResults.forEach((item) => {
      const section = item.section_name;
      const count = sectionCounts[section] || 0;

      let finalScore = item.hybridScore;
      if (count >= 2) {
        // Apply diversity penalty (0.5) to keep top results varied
        finalScore = item.hybridScore * 0.5;
      }

      diversifiedResults.push({
        ...item,
        finalScore,
      });

      sectionCounts[section] = count + 1;
    });

    // Sort again by diversified finalScore
    diversifiedResults.sort((a, b) => b.finalScore - a.finalScore);

    console.log("\n=== 🔍 SEMANTIC MATCH DEBUG ===");
    console.log(`📝 Query: "${cleanQuery}"`);
    console.log("Top 3 computed hybrid scores before threshold filtering:");
    diversifiedResults.slice(0, 3).forEach((item, index) => {
      console.log(`[${index + 1}] Promise: "${item.promise.substring(0, 50)}..."`);
      console.log(`    └─ Hybrid Score:  ${item.hybridScore.toFixed(4)}`);
      console.log(`    └─ Semantic Sim:  ${item.semanticSimilarity.toFixed(4)}`);
      console.log(`    └─ Keyword Over:  ${item.keywordOverlap.toFixed(4)}`);
    });
    console.log("===============================\n");

    // Filter by Semantic Threshold and take top 5
    const topMatches = diversifiedResults
      .filter((item) => item.hybridScore >= SEMANTIC_CONFIDENCE_THRESHOLD)
      .slice(0, 5);

    const duration = Date.now() - startTime;

    // 6. Log Anonymous Telemetry
    const telemetryPayload = {
      query: cleanQuery,
      normalizedQuery: normalizedTokens.join(" "),
      matchedCount: topMatches.length,
      highestConfidence: topMatches[0]?.hybridScore || 0,
      fallbackTriggered: topMatches.length === 0,
      intent: "policy_lookup",
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };
    console.log("[TELEMETRY]", JSON.stringify(telemetryPayload));

    return NextResponse.json({
      query: cleanQuery,
      matches: topMatches,
      indexMetadata: vectorStore.metadata,
      telemetry: telemetryPayload,
    });
  } catch (error: any) {
    console.error("Semantic search exception:", error);
    return NextResponse.json(
      {
        error: "Failed to perform semantic search",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
