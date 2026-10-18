import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { Page } from "@/components/layout/Page";
import { Card, CardHeader } from "@/components/ui/Card";
import { LogoutButton } from "@/components/forms/LogoutButton";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ROLE_LABEL } from "@/lib/utils/format";

export default async function ProfilePage() {
  const { supabase, profile, user } = await requireProfile();
  const rows: [string, string][] = [["Email", user.email ?? "-"], ["Role", ROLE_LABEL[profile.role]]];
  return (
    <Page supabase={supabase} profile={profile} title="Profil">
      <Card className="max-w-lg">
        <CardHeader title="Data diri" />
        <ProfileForm fullName={profile.full_name} phone={profile.phone ?? ""} />
        <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100">{rows.map(([k, v]) => <div key={k} className="flex flex-wrap justify-between gap-1 py-3 text-sm"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link href="/change-password" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">Ganti password</Link>
          <LogoutButton />
        </div>
      </Card>
    </Page>
  );
}
