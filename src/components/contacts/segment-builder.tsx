"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SegmentFilterCriteria,
  SegmentRule,
  SegmentOperator,
  evaluateSegment,
} from "@/lib/importer/segment-compiler";
import { Plus, Trash2, PieChart, Users, Save, Check } from "lucide-react";

interface SegmentBuilderProps {
  contactsSample?: Record<string, unknown>[];
  onSaveSegment: (name: string, description: string, criteria: SegmentFilterCriteria) => void;
  onCancel: () => void;
}

export function SegmentBuilder({
  contactsSample = [
    { id: "1", industry: "AI Automation", city: "Bangalore", status: "active", engagement_score: 92, tags: ["AI", "CTO"] },
    { id: "2", industry: "Software Solutions", city: "Mumbai", status: "active", engagement_score: 75, tags: ["Founder"] },
    { id: "3", industry: "AI Automation", city: "Ahmedabad", status: "active", engagement_score: 85, tags: ["AI"] },
    { id: "4", industry: "Real Estate", city: "Ahmedabad", status: "active", engagement_score: 60, tags: ["Enterprise"] },
    { id: "5", industry: "Legal Services", city: "Delhi", status: "unsubscribed", engagement_score: 20, tags: [] },
  ],
  onSaveSegment,
  onCancel,
}: SegmentBuilderProps) {
  const [segmentName, setSegmentName] = React.useState("High-Intent AI Leaders (Ahmedabad & Bangalore)");
  const [segmentDesc, setSegmentDesc] = React.useState("Targeted outreach segment for AI Workflow automation");
  const [criteria, setCriteria] = React.useState<SegmentFilterCriteria>({
    logic: "AND",
    groups: [
      {
        id: "g1",
        logic: "AND",
        rules: [
          { id: "r1", field: "industry", operator: "equals", value: "AI Automation" },
          { id: "r2", field: "status", operator: "equals", value: "active" },
          { id: "r3", field: "engagement_score", operator: "greater_than", value: 70 },
        ],
      },
    ],
  });

  const matchingContactsCount = React.useMemo(() => {
    return contactsSample.filter((c) => evaluateSegment(c, criteria)).length;
  }, [contactsSample, criteria]);

  const addRule = (groupId: string) => {
    setCriteria((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: [
              ...g.rules,
              { id: "r-" + Date.now(), field: "city", operator: "equals", value: "" },
            ],
          };
        }
        return g;
      }),
    }));
  };

  const removeRule = (groupId: string, ruleId: string) => {
    setCriteria((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: g.rules.filter((r) => r.id !== ruleId),
          };
        }
        return g;
      }),
    }));
  };

  const updateRule = (
    groupId: string,
    ruleId: string,
    updates: Partial<SegmentRule>
  ) => {
    setCriteria((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: g.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
          };
        }
        return g;
      }),
    }));
  };

  const handleSave = () => {
    if (!segmentName.trim()) return;
    onSaveSegment(segmentName, segmentDesc, criteria);
  };

  return (
    <Card className="space-y-6 font-mono text-xs">
      <CardHeader className="pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-henu-400" />
          <CardTitle>DYNAMIC SEGMENT RULE BUILDER</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm" className="gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>ESTIMATED MATCH: {matchingContactsCount} CONTACTS</span>
          </Badge>
        </div>
      </CardHeader>

      {/* Segment Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">SEGMENT NAME</label>
          <input
            type="text"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            className="w-full bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-henu-500"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">DESCRIPTION</label>
          <input
            type="text"
            value={segmentDesc}
            onChange={(e) => setSegmentDesc(e.target.value)}
            className="w-full bg-surface-100 border border-border-default rounded px-3 py-1.5 text-xs text-foreground font-sans focus:outline-none focus:border-henu-500"
          />
        </div>
      </div>

      {/* Rule Groups Container */}
      <div className="space-y-4">
        {criteria.groups.map((group, groupIndex) => (
          <div
            key={group.id}
            className="p-4 rounded bg-surface-50 border border-border-subtle space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span>RULE GROUP #{groupIndex + 1}</span>
                <span className="text-slate-600">&bull;</span>
                <select
                  value={group.logic}
                  onChange={(e) => {
                    const newLogic = e.target.value as "AND" | "OR" | "NOT";
                    setCriteria((prev) => ({
                      ...prev,
                      groups: prev.groups.map((g) =>
                        g.id === group.id ? { ...g, logic: newLogic } : g
                      ),
                    }));
                  }}
                  className="bg-surface-200 border border-border-default rounded px-2 py-0.5 text-[11px] text-henu-400 font-bold"
                >
                  <option value="AND">MATCH ALL (AND)</option>
                  <option value="OR">MATCH ANY (OR)</option>
                  <option value="NOT">EXCLUDE ALL (NOT)</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={() => addRule(group.id)}
                className="gap-1 text-[10px]"
              >
                <Plus className="w-3 h-3" />
                <span>ADD CONDITION</span>
              </Button>
            </div>

            {/* Rules List */}
            <div className="space-y-2">
              {group.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-col sm:flex-row items-center gap-2 bg-surface-100 p-2.5 rounded border border-border-default"
                >
                  {/* Field Selector */}
                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(group.id, rule.id, { field: e.target.value })}
                    className="w-full sm:w-1/3 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-henu-500"
                  >
                    <option value="industry">Industry</option>
                    <option value="city">City</option>
                    <option value="state">State</option>
                    <option value="country">Country</option>
                    <option value="company_name">Company Name</option>
                    <option value="status">Status</option>
                    <option value="engagement_score">Engagement Score</option>
                    <option value="tags">Tags</option>
                  </select>

                  {/* Operator Selector */}
                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(group.id, rule.id, { operator: e.target.value as SegmentOperator })
                    }
                    className="w-full sm:w-1/3 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-henu-500"
                  >
                    <option value="equals">Equals (=)</option>
                    <option value="not_equals">Does not equal (!=)</option>
                    <option value="contains">Contains</option>
                    <option value="not_contains">Does not contain</option>
                    <option value="starts_with">Starts with</option>
                    <option value="greater_than">Greater than (&gt;)</option>
                    <option value="less_than">Less than (&lt;)</option>
                    <option value="is_empty">Is Empty</option>
                    <option value="is_not_empty">Is Not Empty</option>
                  </select>

                  {/* Value Input */}
                  <input
                    type="text"
                    placeholder="Value (e.g., Real Estate, Ahmedabad, 75)"
                    value={String(rule.value)}
                    onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                    className="w-full sm:w-1/3 bg-surface-50 border border-border-default rounded px-2.5 py-1 text-xs text-foreground placeholder:text-slate-500 font-sans focus:outline-none focus:border-henu-500"
                  />

                  {/* Delete Rule */}
                  <button
                    onClick={() => removeRule(group.id, rule.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Remove condition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="primary" size="sm" onClick={handleSave} className="gap-2">
          <Save className="w-3.5 h-3.5" />
          <span>SAVE DYNAMIC SEGMENT</span>
        </Button>
      </div>
    </Card>
  );
}
