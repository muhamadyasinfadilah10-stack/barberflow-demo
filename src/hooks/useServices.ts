"use client";
import { useEffect, useState } from "react";
import { callApi } from "@/lib/utils/api";
import type { Service } from "@/types/service";
export function useServices() {
  const [services, setServices] = useState<Service[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { callApi<Service[]>("/api/services", "GET").then((r) => { setServices(r.raw?.data as Service[] ?? []); setLoading(false); }); }, []);
  return { services, loading };
}
