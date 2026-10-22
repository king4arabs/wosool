import { env } from "./env"
import { currentLocale, sessionFetch } from "./session-request"
import { readResponse, requestErrorMessage } from "./response"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const base = typeof window === "undefined" ? env.apiUrl : window.location.origin
  const url = new URL(`/api/v1${path}`, base)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return typeof window === "undefined" ? url.toString() : `${url.pathname}${url.search}`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, ...init } = options

  const url = buildUrl(path, params)
  const resolvedLocale = currentLocale()

  const headers = new Headers(customHeaders)
  if (!headers.has("Accept")) headers.set("Accept", "application/json")
  if (!headers.has("X-Locale")) headers.set("X-Locale", resolvedLocale)

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await sessionFetch(url, {
    credentials: "include",
    ...init,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      (errorData?.errors ? Object.values(errorData.errors).flat().find(value => typeof value === "string") : null) || (response.status < 500 ? errorData?.message : null) || requestErrorMessage(response.status),
      errorData
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return readResponse<T>(response)
}

/** API client for the Wosool backend */
export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "GET" })
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body })
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PUT", body })
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body })
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" })
  },
}
