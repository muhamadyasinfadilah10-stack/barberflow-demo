export type BookingStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type QueueStatus = "waiting" | "serving" | "done" | "cancelled";
export interface Booking { id: string; customer_id: string | null; barber_id: string; service_id: string; booking_date: string; booking_time: string; end_time: string; status: BookingStatus; source: "whatsapp" | "walk_in" | "manual"; queue_status: QueueStatus | null; }
