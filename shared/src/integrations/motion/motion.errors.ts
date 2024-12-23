export interface MotionApiError extends Error {
  statusCode: number;
  error: string;
  message: string;
}

export class MotionApiError extends Error {
  statusCode: number;
  error: string;
  message: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
  }
}

export function isMotionApiError(error: unknown): error is MotionApiError {
  return (
    error instanceof Error &&
    typeof (error as any).statusCode === "number" &&
    typeof (error as any).error === "string"
  );
}
