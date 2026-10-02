"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentBuilder } from "@/components/contacts/segment-builder";
import { SegmentFilterCriteria } from "@/lib/importer/segment-compiler";
import { PieChart, Plus, Filter, Users, ArrowUpRight } from "lucide-react";

export default function SegmentsPage() {
  const [showBuilder, setShowBuilder] = React.useState(false);
  const [segments, setSegments] = React.useState([
    {
      id: "seg-1",
      name: "High Engagement AI CTOs",
      description: "Contacts with job title CTO, tag 'AI Automation', and engagement score > 80",
      contactCount: 142,
      isDynamic: true,
      lastCalculated: "10 mins ago",
    },
    {
      id: "seg-2",
      name: "Funded Tech Founders (Series A+)",
      description: "Founders of tech startups with funding verified in custom fields",
      contactCount: 88,
      isDynamic: true,
      lastCalculated: "1 hour ago",
    },
    {
      id: "seg-3",
      name: "Dormant Leads (No Opens in 30 Days)",
      description: "Audience contacts needing deliverability re-activation sequence",
      contactCount: 215,
      isDynamic: true,
      lastCalculated: "Yesterday",
    },
  ]);

  const handleSaveSegment = (
    name: string,
    description: string,
    criteria: SegmentFilterCriteria
  ) => {
    const newSeg = {
      id: "seg-" + Date.now(),
      name,
      description,
      contactCount: 24,
      isDynamic: true,
      lastCalculated: "Just now",
    };
    setSegments([newSeg, ...segments]);
    setShowBuilder(false);
  };

  return (
    <AppShell userRole="admin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <PieChart className="w-5 h-5 text-henu-400" />
            <span>DYNAMIC SEGMENT ENGINE</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Build rule-based cohorts with AND / OR / NOT Boolean operators and real-time audience calculation
          </p>
        </div>

        {!showBuilder && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowBuilder(true)}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE DYNAMIC SEGMENT</span>
          </Button>
        )}
      </div>

      {showBuilder ? (
        <SegmentBuilder
          onSaveSegment={handleSaveSegment}
          onCancel={() => setShowBuilder(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <Card key={seg.id} className="space-y-3">
              <CardHeader className="pb-2 mb-2">
                <CardTitle className="text-sm">{seg.name}</CardTitle>
                <Badge variant="info" size="sm">
                  DYNAMIC
                </Badge>
              </CardHeader>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                {seg.description}
              </p>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1.5 text-foreground">
                  <Users className="w-3.5 h-3.5 text-henu-400" />
                  <span className="font-bold">{seg.contactCount}</span>
                  <span className="text-slate-400">contacts</span>
                </div>
                <span className="text-[10px] text-slate-500">{seg.lastCalculated}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
