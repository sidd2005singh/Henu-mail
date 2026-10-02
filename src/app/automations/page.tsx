"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sliders,
  Plus,
  Zap,
  Clock,
  Send,
  GitBranch,
  CheckCircle2,
  Play,
  Trash2,
  ArrowDown,
  ShieldCheck,
  Tag,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { WorkflowNode, WorkflowNodeType, AutomationEngine } from "@/lib/automations/automation-engine";

export default function AutomationsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<string>("wf-101");
  const [isTestDrawerOpen, setIsTestDrawerOpen] = React.useState(false);
  const [testResult, setTestResult] = React.useState<any>(null);

  // Active Workflow Nodes
  const [nodes, setNodes] = React.useState<WorkflowNode[]>([
    {
      id: "node-1",
      type: "trigger",
      title: "TRIGGER: Reply Received",
      description: "Fires whenever an inbound reply is synchronized from a campaign",
      config: { triggerType: "reply_received" },
      nextSuccessNodeId: "node-2",
    },
    {
      id: "node-2",
      type: "condition",
      title: "CONDITION: Sentiment = Positive",
      description: "Evaluates whether prospect expressed interest or asked for meeting",
      config: { conditionType: "reply_sentiment", sentiment: "positive" },
      nextSuccessNodeId: "node-3",
      nextFailureNodeId: "node-5",
    },
    {
      id: "node-3",
      type: "action",
      title: "ACTION: Add Tag 'Hot Lead'",
      description: "Labels prospect in CRM and elevates lead score to 95",
      config: { actionType: "add_tag", tag: "Hot Lead" },
      nextSuccessNodeId: "node-4",
    },
    {
      id: "node-4",
      type: "send",
      title: "SEND: Instant VIP Calendar Link",
      description: "Dispatches automated meeting scheduling link via assigned account",
      config: { templateId: "tpl-vip-calendar" },
    },
    {
      id: "node-5",
      type: "action",
      title: "ACTION: Flag for Manual Review",
      description: "Routes ambiguous or neutral replies to unified inbox queue",
      config: { actionType: "assign_owner", owner: "Support Desk" },
    },
  ]);

  // Test Run Simulation
  const handleRunSimulation = () => {
    const mockContext = {
      contact: {
        id: "cnt-sim-1",
        email: "alex.lead@techcorp.in",
        tags: ["Inbound"],
      },
      event: {
        type: "reply_received" as const,
        payload: { sentiment: "positive", replySnippet: "Yes, let's schedule a call!" },
      },
    };

    const res = AutomationEngine.executeWorkflow(
      { id: "wf-sim", name: "Simulation Workflow", nodes },
      mockContext
    );

    setTestResult(res);
    setIsTestDrawerOpen(true);
  };

  const getNodeIcon = (type: WorkflowNodeType) => {
    switch (type) {
      case "trigger":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "wait":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "send":
        return <Send className="w-4 h-4 text-henu-400" />;
      case "condition":
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case "action":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <AppShell userRole="admin">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-henu-400" />
            <span>EVENT AUTOMATION WORKFLOW BUILDER</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Visual triggers, conditional branches, automated tagging, and CRM synchronizers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleRunSimulation} className="gap-1.5 font-mono text-xs">
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>TEST SIMULATION</span>
          </Button>

          <Button size="sm" variant="primary" className="gap-1.5 font-mono text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>SAVE WORKFLOW</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Workflow List */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">ACTIVE AUTOMATIONS</div>

          <div
            onClick={() => setSelectedWorkflow("wf-101")}
            className={`p-3.5 rounded-lg border cursor-pointer font-mono text-xs transition-all space-y-1.5 ${
              selectedWorkflow === "wf-101"
                ? "bg-henu-500/10 border-henu-500 text-foreground"
                : "bg-surface-100/60 border-border-subtle hover:border-border-default text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-foreground">Auto-Tag Interested Replies</strong>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">Trigger: Reply received &rarr; Positive check</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-border-subtle">42 runs this week</div>
          </div>

          <div
            onClick={() => setSelectedWorkflow("wf-102")}
            className={`p-3.5 rounded-lg border cursor-pointer font-mono text-xs transition-all space-y-1.5 ${
              selectedWorkflow === "wf-102"
                ? "bg-henu-500/10 border-henu-500 text-foreground"
                : "bg-surface-100/60 border-border-subtle hover:border-border-default text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-foreground">Global Bounce Suppression</strong>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">Trigger: Delivery bounced &rarr; Auto-suppress</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-border-subtle">2 runs this week</div>
          </div>

          <div
            onClick={() => setSelectedWorkflow("wf-103")}
            className={`p-3.5 rounded-lg border cursor-pointer font-mono text-xs transition-all space-y-1.5 ${
              selectedWorkflow === "wf-103"
                ? "bg-henu-500/10 border-henu-500 text-foreground"
                : "bg-surface-100/60 border-border-subtle hover:border-border-default text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-foreground">New Founder Ingestion</strong>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">Trigger: Contact added &rarr; Wait 1h &rarr; Send</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-border-subtle">89 runs this week</div>
          </div>
        </div>

        {/* Center & Right Visual Workflow Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 bg-surface-100/40 border border-border-default rounded-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-henu-400" />
                  <span>WORKFLOW CANVAS: Auto-Tag Interested Replies & CRM Sync</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Node sequence executes sequentially on triggered webhook events
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs font-mono gap-1">
                  <Plus className="w-3 h-3" />
                  <span>ADD NODE</span>
                </Button>
              </div>
            </div>

            {/* Visual Node Sequence */}
            <div className="max-w-xl mx-auto space-y-4 py-2">
              {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <Card className="p-4 space-y-2 border-border-default hover:border-henu-500/50 transition-all bg-surface-50 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                        {getNodeIcon(node.type)}
                        <span>{node.title}</span>
                      </div>
                      <Badge variant="outline" size="sm" className="font-mono text-[9px] uppercase">
                        {node.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">{node.description}</p>
                  </Card>

                  {/* Connector Arrow */}
                  {index < nodes.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <div className="w-6 h-6 rounded-full bg-surface-200 border border-border-default flex items-center justify-center text-slate-400">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Result Modal */}
      {isTestDrawerOpen && testResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-50 border border-border-default rounded-xl w-full max-w-lg p-6 space-y-5 font-mono shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>WORKFLOW SIMULATION EXECUTION TRACE</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">Simulated on prospect: {testResult.contactId}</div>
              </div>
              <button onClick={() => setIsTestDrawerOpen(false)} className="text-slate-400 hover:text-foreground text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-surface-100 p-4 rounded border border-border-subtle">
              <div className="flex justify-between">
                <span className="text-slate-400">STATUS:</span>
                <Badge variant="success" size="sm">{testResult.status.toUpperCase()}</Badge>
              </div>

              <div>
                <div className="text-slate-400 mb-1">EXECUTION PATH ({testResult.executionPath.length} Nodes):</div>
                <div className="text-emerald-400 font-mono text-[11px]">
                  {testResult.executionPath.join(" → ")}
                </div>
              </div>

              {testResult.evaluatedConditions?.length > 0 && (
                <div>
                  <div className="text-slate-400 mb-1">EVALUATED CONDITIONS:</div>
                  {testResult.evaluatedConditions.map((c: any, i: number) => (
                    <div key={i} className="text-[11px] text-slate-300">
                      • {c.nodeId}: {c.reason} ({c.passed ? "PASS" : "FAIL"})
                    </div>
                  ))}
                </div>
              )}

              {testResult.executedActions?.length > 0 && (
                <div>
                  <div className="text-slate-400 mb-1">EXECUTED ACTIONS:</div>
                  {testResult.executedActions.map((a: any, i: number) => (
                    <div key={i} className="text-[11px] text-emerald-300">
                      ✓ {a.actionType}: {a.result}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsTestDrawerOpen(false)}>
                Close Trace
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
