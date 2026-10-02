/**
 * HENU MAIL - Event Automation & Visual Workflow Engine
 * HENU OS PRIVATE LIMITED
 *
 * Visual node workflow architecture:
 * Trigger -> Wait -> Send -> Condition -> Action
 *
 * Handles:
 * - contact_added
 * - tag_added
 * - campaign_completed
 * - reply_received
 * - link_clicked
 */

export type WorkflowNodeType = "trigger" | "wait" | "send" | "condition" | "action";

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  description: string;
  config: Record<string, unknown>;
  nextSuccessNodeId?: string;
  nextFailureNodeId?: string; // For branching conditions
}

export interface WorkflowExecutionResult {
  workflowId: string;
  contactId: string;
  status: "completed" | "waiting" | "stopped" | "failed";
  executionPath: string[]; // List of executed node IDs
  evaluatedConditions: Array<{ nodeId: string; passed: boolean; reason: string }>;
  executedActions: Array<{ nodeId: string; actionType: string; result: string }>;
  waitingUntil?: string;
  error?: string;
}

export class AutomationEngine {
  /**
   * Executes or resumes a workflow node sequence for a given contact context.
   */
  public static executeWorkflow(
    workflow: { id: string; name: string; nodes: WorkflowNode[] },
    context: {
      contact: {
        id: string;
        email: string;
        tags: string[];
        customFields?: Record<string, unknown>;
      };
      event: {
        type: "contact_added" | "tag_added" | "campaign_completed" | "reply_received" | "link_clicked";
        payload?: Record<string, unknown>;
      };
    },
    startNodeId?: string
  ): WorkflowExecutionResult {
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
    const executionPath: string[] = [];
    const evaluatedConditions: WorkflowExecutionResult["evaluatedConditions"] = [];
    const executedActions: WorkflowExecutionResult["executedActions"] = [];

    let currentNodeId: string | undefined = startNodeId || workflow.nodes[0]?.id;

    while (currentNodeId) {
      const node: WorkflowNode | undefined = nodeMap.get(currentNodeId);
      if (!node) break;

      executionPath.push(node.id);

      switch (node.type) {
        case "trigger": {
          const triggerType = node.config.triggerType as string;
          if (triggerType && triggerType !== context.event.type) {
            return {
              workflowId: workflow.id,
              contactId: context.contact.id,
              status: "stopped",
              executionPath,
              evaluatedConditions,
              executedActions,
              error: `Trigger mismatch: expected '${triggerType}', received '${context.event.type}'`,
            };
          }
          currentNodeId = node.nextSuccessNodeId;
          break;
        }

        case "wait": {
          const waitDays = (node.config.waitDays as number) || 0;
          const waitHours = (node.config.waitHours as number) || 0;
          const waitMs = (waitDays * 24 + waitHours) * 3600 * 1000;
          const resumeAt = new Date(Date.now() + waitMs).toISOString();

          return {
            workflowId: workflow.id,
            contactId: context.contact.id,
            status: "waiting",
            executionPath,
            evaluatedConditions,
            executedActions,
            waitingUntil: resumeAt,
          };
        }

        case "condition": {
          const conditionType = (node.config.conditionType as string) || "tag_present";
          let passed = false;
          let reason = "";

          if (conditionType === "tag_present") {
            const requiredTag = node.config.tag as string;
            passed = context.contact.tags.includes(requiredTag);
            reason = passed ? `Contact has tag '${requiredTag}'` : `Contact lacks tag '${requiredTag}'`;
          } else if (conditionType === "reply_sentiment") {
            const expectedSentiment = node.config.sentiment as string;
            const actualSentiment = (context.event.payload?.sentiment as string) || "neutral";
            passed = expectedSentiment === actualSentiment;
            reason = `Reply sentiment '${actualSentiment}' matches expected '${expectedSentiment}'`;
          } else if (conditionType === "link_clicked") {
            passed = context.event.type === "link_clicked";
            reason = passed ? "Link click confirmed" : "No link click detected";
          } else {
            passed = true;
            reason = "Default condition evaluated true";
          }

          evaluatedConditions.push({ nodeId: node.id, passed, reason });
          currentNodeId = passed ? node.nextSuccessNodeId : node.nextFailureNodeId;
          break;
        }

        case "action": {
          const actionType = (node.config.actionType as string) || "add_tag";
          let resultDesc = "";

          if (actionType === "add_tag") {
            const tagToAdd = (node.config.tag as string) || "Auto-Tagged";
            if (!context.contact.tags.includes(tagToAdd)) {
              context.contact.tags.push(tagToAdd);
            }
            resultDesc = `Appended tag '${tagToAdd}' to contact`;
          } else if (actionType === "add_to_suppression") {
            resultDesc = `Added ${context.contact.email} to suppression register`;
          } else if (actionType === "send_template_email") {
            const templateId = (node.config.templateId as string) || "tpl-auto";
            resultDesc = `Dispatched automation template '${templateId}' to ${context.contact.email}`;
          } else {
            resultDesc = `Executed action '${actionType}'`;
          }

          executedActions.push({ nodeId: node.id, actionType, result: resultDesc });
          currentNodeId = node.nextSuccessNodeId;
          break;
        }

        case "send": {
          executedActions.push({
            nodeId: node.id,
            actionType: "send_email",
            result: `Dispatched email template to ${context.contact.email}`,
          });
          currentNodeId = node.nextSuccessNodeId;
          break;
        }

        default:
          currentNodeId = undefined;
          break;
      }
    }

    return {
      workflowId: workflow.id,
      contactId: context.contact.id,
      status: "completed",
      executionPath,
      evaluatedConditions,
      executedActions,
    };
  }
}
