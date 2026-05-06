"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  ChevronLeft,
  Layers
} from "lucide-react";

const FRAMEWORK_DOCS = [
  {
    id: "aram",
    name: "Aram",
    tamilName: "அறம்",
    englishName: "Ethics & Righteousness",
    description:
      "The foundational pillar addressing social justice, equality, anti-corruption measures, caste abolition, minority protections, and ethical governance. Aram ensures that the state acts as a moral institution rooted in Tamil values of fairness.",
    pdfPath: "/manifesto/tvk_aram.pdf",
    color: "blue",
    commitmentCount: 0, // Will be calculated
  },
  {
    id: "porul",
    name: "Porul",
    tamilName: "பொருள்",
    englishName: "Wealth & Prosperity",
    description:
      "The economic pillar covering fiscal devolution, GST reform, industrial policy, agricultural modernization, infrastructure development, and financial independence for Tamil Nadu. Porul defines the state's path to self-reliant economic growth.",
    pdfPath: "/manifesto/tvk_porul.pdf",
    color: "cyan",
    commitmentCount: 0,
  },
  {
    id: "inbam",
    name: "Inbam",
    tamilName: "இன்பம்",
    englishName: "Joy & Well-being",
    description:
      "The well-being pillar encompassing healthcare, education, housing, cultural preservation, sports, arts, and environmental sustainability. Inbam envisions a Tamil Nadu where every citizen lives with dignity and fulfilment.",
    pdfPath: "/manifesto/tvk_inbam.pdf",
    color: "purple",
    commitmentCount: 0,
  },
] as const;

// Color helpers
const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  blue: {
    bg: "bg-blue-500/5",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/5",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
  },
  purple: {
    bg: "bg-purple-500/5",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/10",
  },
};

export default function ManifestoPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Governance Dashboard</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card to-muted/20 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Original Manifesto Documents
            </h1>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            The TVK manifesto is structured around the ancient Tamil ethical
            framework of <strong>Aram, Porul, and Inbam</strong> (Ethics,
            Wealth, Joy). Below are the original source documents as published
            on April 16, 2026. Every commitment tracked on this platform is
            mapped directly to these three pillars.
          </p>
        </div>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {FRAMEWORK_DOCS.map((fw) => {
          const colors = colorMap[fw.color];
          return (
            <div
              key={fw.id}
              className={`p-6 rounded-2xl border ${colors.border} ${colors.bg} flex flex-col justify-between gap-5 shadow-sm transition-all hover:shadow-md`}
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${colors.iconBg} ${colors.text}`}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      className={`text-lg font-black tracking-tight ${colors.text}`}
                    >
                      {fw.name}{" "}
                      <span className="text-muted-foreground font-medium text-sm">
                        ({fw.tamilName})
                      </span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {fw.englishName}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fw.description}
                </p>
              </div>

              {/* Meta */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Original PDF · Published April 16, 2026</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={fw.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </a>
                  <a
                    href={fw.pdfPath}
                    download
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-foreground bg-muted hover:bg-muted/80 border border-border rounded-xl transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl border border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Source Integrity Notice:</strong>{" "}
          These PDF documents are the original manifesto files as published by
          Tamilaga Vettri Kazhagam. NammaArasu does not modify, edit, or
          annotate these source documents. Each commitment tracked on the
          platform is directly extracted from these pillars. If you notice any
          discrepancy between a tracked commitment and its source text, please
          report it through the platform&apos;s feedback system.
        </p>
      </div>
    </div>
  );
}
