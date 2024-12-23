import { z } from "zod";
import {
  CreateTaskParams,
  TaskResponse,
  TaskResponseSchema,
} from "./motion.types";
import { safeParse } from "../../utils/zod";
import { MotionApiError } from "./motion.errors";

export class MotionClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.usemotion.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>({
    endpoint,
    method = "GET",
    body,
    schema,
  }: {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    schema: z.ZodType<T>;
  }): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();

      throw new MotionApiError(response.status, error.error, error.message);
    }

    const data = await response.json();
    return safeParse(schema, data);
  }

  async createTask(params: CreateTaskParams): Promise<TaskResponse> {
    return this.request({
      endpoint: "/tasks",
      method: "POST",
      body: params,
      schema: TaskResponseSchema,
    });
  }

  async getTask(taskId: string): Promise<TaskResponse> {
    return this.request({
      endpoint: `/tasks/${taskId}`,
      schema: TaskResponseSchema,
    });
  }
}
