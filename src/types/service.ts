export interface Service { id: string; name: string; price: number; duration_minutes: number; commission_type: "percent" | "fixed"; commission_value: number; is_active: boolean; }
