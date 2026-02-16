import { useAuthModal, useAuthStore } from "@/utils/auth/store";

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createRequestId() {
  return `req_${createId()}`;
}

export function createIdempotencyKey() {
  return `idem_${createId()}`;
}

/**
 * apiFetch
 * - Adds Authorization: Bearer <jwt> if the user is signed in
 * - Adds X-Request-Id always
 * - Adds Idempotency-Key when `idempotent: true`
 */
export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    headers: extraHeaders,
    idempotent = false,
    idempotencyKey,
  } = options;

  const auth = useAuthStore.getState().auth;

  const headers = {
    ...(extraHeaders || {}),
    "X-Request-Id": createRequestId(),
  };

  if (auth?.jwt) {
    headers.Authorization = `Bearer ${auth.jwt}`;
  }

  let finalBody = body;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (idempotent) {
    headers["Idempotency-Key"] = idempotencyKey || createIdempotencyKey();
  }

  const response = await fetch(path, {
    method,
    headers,
    body: finalBody,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // If the backend says UNAUTHORIZED, force the user back into the auth flow.
    if (response.status === 401) {
      const { auth, setAuth } = useAuthStore.getState();
      const { open } = useAuthModal.getState();

      // If we had a token, clear it (expired/invalid) and prompt sign-in.
      if (auth?.jwt) {
        setAuth(null);
      }

      // Open auth modal (safe no-op if already open)
      open({ mode: "signin" });
    }

    const message =
      data?.error?.message ||
      data?.message ||
      `When fetching ${path}, the response was [${response.status}] ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
