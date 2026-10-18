import { Badge } from "@/components/ui/Badge";
import { BOOKING_LABEL, QUEUE_LABEL } from "@/lib/utils/format";
export function BookingStatusBadge({ status, queue }: { status: string; queue?: string | null }) {
  if (queue) return <Badge tone={queue === "done" ? "success" : queue === "cancelled" ? "danger" : queue === "serving" ? "neutral" : "muted"}>{QUEUE_LABEL[queue]}</Badge>;
  return <Badge tone={status === "completed" ? "success" : status === "cancelled" || status === "no_show" ? "danger" : "muted"}>{BOOKING_LABEL[status] ?? status}</Badge>;
}
