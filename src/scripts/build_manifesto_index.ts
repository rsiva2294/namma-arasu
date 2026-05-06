import fs from "fs";
import path from "path";

// Load Environment Variables manually from .env.local to avoid dependency on dotenv
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is not set in .env.local.");
  process.exit(1);
}

// Interfaces
interface RawSection {
  section_name: string;
  keywords?: string[]; // may be optional
  key_promises: string[];
}

interface RawPillar {
  pillar_number: number;
  title: string;
  sections: RawSection[];
}

interface RawFramework {
  framework: string;
  description: string;
  pillars: RawPillar[];
}

interface ClientManifestoDocument {
  id: string;
  framework: string;
  pillar_title: string;
  section_name: string;
  promise: string;
  keywords: string[];
}

interface ServerVectorStore {
  metadata: {
    embeddingModelVersion: string;
    indexVersion: string;
    generatedAt: string;
    totalDocuments: number;
  };
  vectors: {
    [docId: string]: {
      searchable_text: string;
      embedding: number[];
      ranking_metadata: {
        priority: string;
        measurable: boolean;
      };
      normalization_tokens: string[];
    };
  };
}

// Load Bidirectional Dictionary
const dictPath = path.resolve(process.cwd(), "src/data/multilingual_dictionary.json");
let dictionary: Record<string, string[]> = {};
if (fs.existsSync(dictPath)) {
  dictionary = JSON.parse(fs.readFileSync(dictPath, "utf8"));
} else {
  console.warn("WARNING: Multilingual dictionary not found at", dictPath);
}

// Expand keywords/tokens using bidirectional dictionary
function expandTokens(tokens: string[]): string[] {
  const expanded = new Set<string>();
  tokens.forEach((t) => {
    const lower = t.toLowerCase().trim();
    if (!lower) return;
    expanded.add(lower);
    if (dictionary[lower]) {
      dictionary[lower].forEach((syn) => expanded.add(syn.toLowerCase().trim()));
    }
  });
  return Array.from(expanded);
}

// Basic Tokenization for keywords
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\']/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// Fetch Embedding from Google Gemini API
async function fetchEmbedding(text: string, attempt = 1): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
  try {
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
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as { embedding?: { values?: number[] } };
    const embedding = data?.embedding?.values;
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding structure returned by Gemini API.");
    }

    return embedding;
  } catch (error) {
    if (attempt <= 3) {
      console.warn(`Embedding failed (attempt ${attempt}/3). Retrying in 1s...`, error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchEmbedding(text, attempt + 1);
    }
    throw error;
  }
}

async function main() {
  console.log("Starting build-time manifesto indexing and validation pipeline...");

  const frameworkFiles = [
    "tvk_aram_framework.json",
    "tvk_porul_framework.json",
    "tvk_inbam_framework.json",
  ];

  const clientDocuments: ClientManifestoDocument[] = [];
  const serverVectors: ServerVectorStore["vectors"] = {};
  const seenIds = new Set<string>();

  for (const file of frameworkFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`CRITICAL ERROR: Framework file not found: ${file}`);
      process.exit(1);
    }

    let frameworkData: RawFramework;
    try {
      frameworkData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.error(`CRITICAL ERROR: Malformed JSON in ${file}:`, e);
      process.exit(1);
    }

    // Build-time Validation: Framework metadata
    if (!frameworkData.framework || !frameworkData.description || !Array.isArray(frameworkData.pillars)) {
      console.error(`CRITICAL ERROR: Invalid framework schema in ${file}`);
      process.exit(1);
    }

    const frameworkName = frameworkData.framework;

    frameworkData.pillars.forEach((pillar, pillarIdx) => {
      // Validation: Pillars
      if (typeof pillar.pillar_number !== "number" || !pillar.title || !Array.isArray(pillar.sections)) {
        console.error(`CRITICAL ERROR: Invalid pillar schema in ${file} at index ${pillarIdx}`);
        process.exit(1);
      }

      pillar.sections.forEach((section, sectionIdx) => {
        // Validation: Sections
        if (!section.section_name || !Array.isArray(section.key_promises)) {
          console.error(`CRITICAL ERROR: Invalid section schema in ${file}, pillar ${pillar.pillar_number}, section index ${sectionIdx}`);
          process.exit(1);
        }

        const keywordsFromText = extractWords(section.section_name);
        const sectionKeywords = section.keywords || keywordsFromText;

        section.key_promises.forEach((promiseText, promiseIdx) => {
          // Validation: Promises
          if (!promiseText || typeof promiseText !== "string" || promiseText.trim() === "") {
            console.error(`CRITICAL ERROR: Empty promise text in ${file}, pillar ${pillar.pillar_number}, section ${section.section_name}, index ${promiseIdx}`);
            process.exit(1);
          }

          const cleanPromise = promiseText.trim();
          const cleanFrameworkName = frameworkName.split(" ")[0].toLowerCase();
          const docId = `p-${cleanFrameworkName}-p${pillar.pillar_number}-s${sectionIdx}-i${promiseIdx}`;

          // Validation: Duplicate IDs
          if (seenIds.has(docId)) {
            console.error(`CRITICAL ERROR: Duplicate generated ID detected: ${docId}`);
            process.exit(1);
          }
          seenIds.add(docId);

          // Build keyword set & expand with bidirectional synonyms
          const rawKeywords = Array.from(new Set([
            ...sectionKeywords,
            ...extractWords(cleanPromise),
            ...extractWords(section.section_name)
          ]));
          const expandedKeywords = expandTokens(rawKeywords);

          // Generate Searchable Text Block
          const searchableText = `${frameworkName} ${pillar.title} ${section.section_name} ${expandedKeywords.join(" ")} ${cleanPromise}`;

          // Build Client Document
          clientDocuments.push({
            id: docId,
            framework: frameworkName,
            pillar_title: pillar.title,
            section_name: section.section_name,
            promise: cleanPromise,
            keywords: expandedKeywords,
          });

          // Store temporary server representation
          serverVectors[docId] = {
            searchable_text: searchableText,
            embedding: [], // To be populated
            ranking_metadata: {
              priority: "Medium",
              measurable: cleanPromise.includes("%") || /\b\d+\b/.test(cleanPromise),
            },
            normalization_tokens: expandedKeywords,
          };
        });
      });
    });
  }

  console.log(`Validated and flattened ${clientDocuments.length} promises.`);
  console.log("Generating vector embeddings via gemini-embedding-001...");

  const docIds = Object.keys(serverVectors);
  for (let i = 0; i < docIds.length; i++) {
    const docId = docIds[i];
    const item = serverVectors[docId];
    console.log(`Embedding document [${i + 1}/${docIds.length}]: ${docId}...`);

    try {
      const vector = await fetchEmbedding(item.searchable_text);

      // Validation: Dimension Check (gemini-embedding-001 must be 3072 dimensions)
      if (vector.length !== 3072) {
        console.error(`CRITICAL ERROR: Embedding size mismatch for ${docId}. Expected 3072, got ${vector.length}`);
        process.exit(1);
      }

      item.embedding = vector;
    } catch (e) {
      console.error(`CRITICAL ERROR: Failed to generate embedding for ${docId}:`, e);
      process.exit(1);
    }

    // Throttle requests (approx. 120ms delay) to stay strictly within Gemini standard API rate limits
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  // Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), "src/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write Client Search Index
  const clientIndexPath = path.join(outputDir, "tvk_manifesto_documents.json");
  fs.writeFileSync(clientIndexPath, JSON.stringify(clientDocuments, null, 2));
  console.log(`Client Search Index successfully written to: ${clientIndexPath}`);

  // Construct Server Vector Store Index
  const serverIndex: ServerVectorStore = {
    metadata: {
      embeddingModelVersion: "gemini-embedding-001",
      indexVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      totalDocuments: clientDocuments.length,
    },
    vectors: serverVectors,
  };

  // Write Server Search Index
  const serverIndexPath = path.join(outputDir, "tvk_vectors.json");
  fs.writeFileSync(serverIndexPath, JSON.stringify(serverIndex, null, 2));
  console.log(`Server Search Index successfully written to: ${serverIndexPath}`);

  console.log("PREPROCESSING AND INDEX BUILD COMPLETED SUCCESSFULY!");
}

main().catch((err) => {
  console.error("CRITICAL BUILD SCRIPT EXCEPTION:", err);
  process.exit(1);
});
