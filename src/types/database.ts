export type Role = "owner" | "admin" | "barber";
export type EmployeeStatus = "active" | "off" | "inactive";
export interface Profile { id: string; full_name: string; email: string | null; role: Role; phone: string | null; status: EmployeeStatus; work_start_time: string; work_end_time: string; joined_at: string; }
export interface ShopSettings { id: string; shop_name: string; app_display_name: string; address: string | null; open_time: string; close_time: string; owner_whatsapp_number: string | null; }
export interface ShopSession { id: string; opened_by: string; opened_at: string; closed_by: string | null; closed_at: string | null; status: "open" | "closed"; total_bookings: number; total_walk_ins: number; total_revenue: number; total_commission: number; note: string | null; }
