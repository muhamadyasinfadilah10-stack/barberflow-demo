"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
export function LogoutButton() {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <Button variant="secondary" loading={busy} onClick={async () => { setBusy(true); await createClient().auth.signOut(); router.replace("/login"); router.refresh(); }}>Keluar</Button>;
}
