export interface ApiResult<T = unknown> { ok: boolean; error?: string; fields?: Record<string, string[]>; data?: T; raw?: Record<string, unknown> }
/** Helper fetch JSON untuk komponen client */
export async function callApi<T = unknown>(url: string, method = "GET", body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, data: json.data as T, raw: json } : { ok: false, error: json.error ?? "Terjadi kesalahan", fields: json.fields };
  } catch { return { ok: false, error: "Tidak dapat terhubung ke server. Periksa koneksi internet." }; }
}
