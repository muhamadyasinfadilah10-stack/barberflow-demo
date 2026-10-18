import type { Service } from "@/types/service";
/** Komisi kapster: persen dari harga, atau nominal tetap. Tidak pernah melebihi harga layanan. */
export function calculateCommission(service: Pick<Service, "price" | "commission_type" | "commission_value">): number {
  const raw = service.commission_type === "percent" ? (Number(service.price) * Number(service.commission_value)) / 100 : Number(service.commission_value);
  return Math.min(Math.round(raw), Math.round(Number(service.price)));
}
