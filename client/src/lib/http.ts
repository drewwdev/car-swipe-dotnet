import type { AxiosError } from "axios";

export function isAxiosError<T = unknown>(e: unknown): e is AxiosError<T> {
  return (
    typeof e === "object" &&
    e !== null &&
    "isAxiosError" in (e as Record<string, unknown>)
  );
}
