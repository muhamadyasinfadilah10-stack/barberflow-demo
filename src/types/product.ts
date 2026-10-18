export interface Product { id: string; name: string; price: number; stock: number; min_stock: number; is_active: boolean }
export type MovementType = "in" | "sale" | "use" | "adjust";
