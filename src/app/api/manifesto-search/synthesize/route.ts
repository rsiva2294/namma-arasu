import { NextResponse } from "next/server";
import { quotaService } from "@/lib/services/quotaService";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `You are a highly grounded, production-grade manifesto retrieval and intelligence system for the TVK Tracker platform.
Your objective is to generate an objective, factual, and institutionally serious summary answering the user's query based ONLY on the provided retrieved manifesto context.

STRICT COMPLIANCE RULES:
1. NEVER hallucinate policies or make speculative statements.
2. NEVER infer unstated manifesto intentions. Only answer with what is explicitly written.
3. If the provided context does not contain enough information to answer the question, you MUST explicitly state: "The manifesto currently does not specify this information."
4. Generate a structured JSON response matching the provided schema.
5. In the "citations" list, map each citation to its corresponding promiseId, framework, pillar, section, and include a short verbatim "excerpt" from the original text used to ground that specific point.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, contextDocuments, fingerprint } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!Array.isArray(contextDocuments)) {
      return NextResponse.json(
        { error: "Context documents must be an array" },
        { status: 400 }
      );
    }

    const cleanFingerprint = fingerprint || "anonymous-server";

    // 1. Validate Quota before calling Gemini synthesis
    if (cleanFingerprint !== "anonymous-server") {
      const quotaCheck = await quotaService.checkAndIncrementQuota(cleanFingerprint);
      if (!quotaCheck.allowed) {
        return NextResponse.json(
          {
            error: "Quota Exceeded",
            message: "You have exceeded your limit of 10 AI synthesis requests today. Try again tomorrow or use Tier 1/2 searches.",
            remaining: 0,
            count: quotaCheck.count,
          },
          { status: 429 }
        );
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on server" },
        { status: 500 }
      );
    }

    // 2. Format Context Documents as a readable string
    const formattedContext = contextDocuments
      .map((doc, idx) => {
        return `[Document ID: ${doc.id}]
Framework: ${doc.framework}
Pillar: ${doc.pillar_title}
Section: ${doc.section_name}
Promise Text: ${doc.promise}
---`;
      })
      .join("\n\n");

    const userPrompt = `Query: ${query}

Retrieved Manifesto Context:
${
  formattedContext.trim() === ""
    ? "No relevant manifesto promises were retrieved."
    : formattedContext
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 3. Request Gemini with structured response schema
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              answer: { type: "STRING" },
              citations: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    promiseId: { type: "STRING" },
                    framework: { type: "STRING" },
                    pillar: { type: "STRING" },
                    section: { type: "STRING" },
                    excerpt: { type: "STRING" },
                  },
                  required: ["promiseId", "framework", "pillar", "section", "excerpt"],
                },
              },
              matchedPromises: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              confidence: { type: "STRING", enum: ["HIGH", "MEDIUM", "LOW"] },
            },
            required: ["answer", "citations", "matchedPromises", "confidence"],
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini synthesis API failed: ${errText}`);
    }

    interface GeminiResponse {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
      };
    }

    const resultData = (await response.json()) as GeminiResponse;
    const jsonText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      throw new Error("Empty response returned from Gemini synthesis.");
    }

    const synthesisResult = JSON.parse(jsonText);
    const usage = resultData.usageMetadata;

    if (usage) {
      console.log("\n=========================================");
      console.log("🚀 [GEMINI AI SYNTHESIS TOKEN CONSUMPTION]");
      console.log(`📝 Query:           "${query}"`);
      console.log(`📥 Prompt Tokens:     ${usage.promptTokenCount}`);
      console.log(`📤 Candidate Tokens:  ${usage.candidatesTokenCount}`);
      console.log(`🔄 Total Tokens:      ${usage.totalTokenCount}`);
      console.log("=========================================\n");
    } else {
      console.log("\n⚠️ [GEMINI AI SYNTHESIS]: Usage metadata not returned by Gemini API.\n");
    }

    const apiResponse = NextResponse.json({
      answer: synthesisResult.answer,
      citations: synthesisResult.citations,
      matchedPromises: synthesisResult.matchedPromises,
      confidence: synthesisResult.confidence,
      remainingQuota: quotaService.getRemainingQuota(cleanFingerprint),
      tokenUsage: usage || null,
    });
    apiResponse.headers.set("Access-Control-Allow-Origin", "*");
    apiResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    apiResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return apiResponse;
  } catch (error: any) {
    console.error("AI synthesis exception:", error);
    const errResponse = NextResponse.json(
      {
        error: "Failed to generate AI synthesis",
        message: error.message || "Unknown error",
        answer: "The AI synthesis service is temporarily unavailable. Please refer directly to the matched retrieved promises below.",
        citations: [],
        matchedPromises: [],
        confidence: "LOW",
      },
      { status: 500 }
    );
    errResponse.headers.set("Access-Control-Allow-Origin", "*");
    return errResponse;
  }
}

export async function OPTIONS() {
  const response = new Response(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
