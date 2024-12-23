import { z } from "zod";

export const TaskResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.object({
    name: z.string(),
    isDefaultStatus: z.boolean(),
    isResolvedStatus: z.boolean(),
  }),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional(),
  workspace: z.object({
    id: z.string(),
    name: z.string(),
    teamId: z.string().nullable(),
    type: z.string(),
  }),
  creator: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  project: z.unknown().nullable(),
  dueDate: z.string().optional(),
  duration: z.number().optional(),
  createdTime: z.string(),
  labels: z.array(z.unknown()),
  scheduledStart: z.string().nullable(),
  scheduledEnd: z.string().nullable(),
  schedulingIssue: z.boolean(),
  assignees: z.array(z.unknown()),
  parentRecurringTaskId: z.string().nullable(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export interface CreateTaskParams {
  name: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  priority?: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  assigneeId?: string;
  dueDate?: string;
  status?:
    | "BACKLOG"
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE"
    | "CANCELED";
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  duration?: number;
  labels?: string[];
  customFields?: Record<string, unknown>;
  autoScheduled?: {
    startDate: string;
    deadlineType: "HARD" | "SOFT" | "NONE";
    schedule: string;
  } | null;
}
