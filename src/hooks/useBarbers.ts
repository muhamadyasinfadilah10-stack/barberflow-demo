"use client";
import { useEffect, useState } from "react";
import { callApi } from "@/lib/utils/api";
import type { Barber } from "@/types/barber";
export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { callApi<Barber[]>("/api/barbers", "GET").then((r) => { setBarbers(r.raw?.data as Barber[] ?? []); setLoading(false); }); }, []);
  return { barbers, loading };
}
