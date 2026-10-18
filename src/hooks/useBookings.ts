"use client";
import { useCallback, useEffect, useState } from "react";
import { callApi } from "@/lib/utils/api";
export function useBookings(date: string) {
  const [bookings, setBookings] = useState<unknown[]>([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const r = await callApi(`/api/bookings?date=${date}`, "GET"); setBookings((r.raw?.data as unknown[]) ?? []); setLoading(false); }, [date]);
  useEffect(() => { load(); }, [load]);
  return { bookings, loading, reload: load };
}
