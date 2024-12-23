import { KVNamespace } from "@cloudflare/workers-types";

export interface Env {
  AIRTHINGS_CLIENT_ID: string;
  AIRTHINGS_CLIENT_SECRET: string;
  AIRTHINGS_DEVICE_SERIAL_NUMBER: string;
  MOTION_API_KEY: string;
  MOTION_DEFAULT_WORKSPACE_ID: string;
  PERSONAL_WORKERS_KV: KVNamespace;
}
