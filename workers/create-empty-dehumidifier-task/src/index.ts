import { ScheduledEvent } from "@cloudflare/workers-types";
import {
  AirthingsClient,
  Env,
  isMotionApiError,
  MotionClient,
  TaskResponse,
} from "@personal-workers/shared";
import { parseISO, subHours, isAfter, addHours } from "date-fns";

const EMPTY_DEHUMIDIFIER_TASK_ID_KEY = "empty-dehumidifier-task-id";
const HUMIDITY_THRESHOLD = 50;

export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const airthings = new AirthingsClient(
      env.AIRTHINGS_CLIENT_ID,
      env.AIRTHINGS_CLIENT_SECRET,
      env.PERSONAL_WORKERS_KV
    );

    const samples = await airthings.getLatestSamples(
      env.AIRTHINGS_DEVICE_SERIAL_NUMBER
    );

    const humidity = samples.data.humidity;

    console.log("Current humidity", humidity);

    if (samples.data.humidity > HUMIDITY_THRESHOLD) {
      const motion = new MotionClient(env.MOTION_API_KEY);

      const existingTaskId = await env.PERSONAL_WORKERS_KV.get(
        EMPTY_DEHUMIDIFIER_TASK_ID_KEY
      );

      console.log("Existing task id", existingTaskId);

      if (existingTaskId) {
        let task: TaskResponse | undefined;

        try {
          task = await motion.getTask(existingTaskId);
        } catch (error) {
          if (isMotionApiError(error) && error.statusCode === 404) {
            await env.PERSONAL_WORKERS_KV.delete(
              EMPTY_DEHUMIDIFIER_TASK_ID_KEY
            );
          }
        }

        // If the task is completed and was created more than 16 hours ago, delete it
        // This isn't perfect, because Motion's API doesn't return when a task is completed.
        // The overarching goal is to not create duplicate tasks for example, when the
        // dehumidifer has been cleared but the humidity is still elevated.
        if (
          task?.status.name === "Completed" &&
          isAfter(subHours(new Date(), 16), parseISO(task.createdTime))
        ) {
          await env.PERSONAL_WORKERS_KV.delete(EMPTY_DEHUMIDIFIER_TASK_ID_KEY);
        } else {
          // If we reach this case we have already created a task and it's still active
          // We will return early and do nothing.
          return;
        }
      }

      const task = await motion.createTask({
        name: "Empty dehumidifier",
        workspaceId: env.MOTION_DEFAULT_WORKSPACE_ID,
        priority: "HIGH",
        dueDate: addHours(new Date(), 10).toISOString(),
        duration: 10,
        autoScheduled: {
          startDate: new Date().toISOString(),
          deadlineType: "HARD",
          schedule: "Personal hours",
        },
      });

      await env.PERSONAL_WORKERS_KV.put(
        EMPTY_DEHUMIDIFIER_TASK_ID_KEY,
        task.id
      );
    }

    return;
  },
};
