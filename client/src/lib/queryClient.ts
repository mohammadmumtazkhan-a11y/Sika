import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
    },
  },
});

type On401Behavior = "returnNull" | "throw";

export function getQueryFn({ on401 }: { on401: On401Behavior }) {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const url = queryKey[0] as string;
    const res = await fetch(url, { credentials: "include" });

    if (res.status === 401) {
      if (on401 === "returnNull") return null;
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    return res.json();
  };
}

export async function apiRequest(
  method: string,
  url: string,
  body?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res;
}
