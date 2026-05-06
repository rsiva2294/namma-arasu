import React from "react";
import PromiseDetailPageClient from "./PromiseDetailClient";
import { INITIAL_MOCK_PROMISES } from "@/lib/mockData";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Required for Next.js Static Export (output: "export") to statically pre-render dynamic routes
export async function generateStaticParams() {
  // Returns all possible promise IDs to pre-render at build time
  return INITIAL_MOCK_PROMISES.map((p) => ({
    id: p.id,
  }));
}

export default function Page({ params }: PageProps) {
  return <PromiseDetailPageClient params={params} />;
}
