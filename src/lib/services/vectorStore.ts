import fs from "fs";
import path from "path";

export interface ServerVectorDoc {
  searchable_text: string;
  embedding: number[];
  ranking_metadata: {
    priority: string;
    measurable: boolean;
  };
  normalization_tokens: string[];
}

export interface ServerVectorStore {
  metadata: {
    embeddingModelVersion: string;
    indexVersion: string;
    generatedAt: string;
    totalDocuments: number;
  };
  vectors: {
    [docId: string]: ServerVectorDoc;
  };
}

// Global Memory Cache Singleton
declare global {
  // eslint-disable-next-line no-var
  var manifestoVectorStore: ServerVectorStore | undefined;
}

export function getVectorStore(): ServerVectorStore {
  if (!globalThis.manifestoVectorStore) {
    const indexPath = path.resolve(process.cwd(), "src/data/tvk_vectors.json");
    if (fs.existsSync(indexPath)) {
      const data = fs.readFileSync(indexPath, "utf8");
      globalThis.manifestoVectorStore = JSON.parse(data) as ServerVectorStore;
      console.log(
        `[SINGLETON] Vector store successfully loaded in-memory with ${globalThis.manifestoVectorStore.metadata.totalDocuments} documents.`
      );
    } else {
      throw new Error(
        `CRITICAL ERROR: Server vector index not found at ${indexPath}. Build the search index first.`
      );
    }
  }
  return globalThis.manifestoVectorStore;
}
