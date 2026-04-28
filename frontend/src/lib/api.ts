const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();

    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(text) as {
          message?: string;
          error?: string;
          error_message?: string;
        };
        const message =
          parsed.message ||
          parsed.error_message ||
          parsed.error ||
          "Något gick fel.";

        throw new Error(message);
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Något gick fel. Försök igen.");
      }
    }

    throw new Error(text || "Request failed");
  }

  return response.json() as Promise<T>;
}
