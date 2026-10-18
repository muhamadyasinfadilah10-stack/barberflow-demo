export type BotStep = "idle" | "select_service" | "select_date" | "select_time" | "select_barber" | "confirm_cancel";
export interface BotSession { whatsapp_number: string; current_step: BotStep; temp_data: Record<string, unknown>; }
