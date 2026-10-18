import type { Role } from "@/types/database";
export interface NavItem { href: string; label: string; roles: Role[]; }
export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["owner", "admin", "barber"] },
  { href: "/bookings", label: "Booking", roles: ["owner", "admin", "barber"] },
  { href: "/walk-in", label: "Antrean", roles: ["owner", "admin"] },
  { href: "/transactions", label: "Transaksi", roles: ["owner", "admin"] },
  { href: "/stock", label: "Stok", roles: ["owner", "admin"] },
  { href: "/commissions", label: "Komisi", roles: ["owner", "barber"] },
  { href: "/reports", label: "Laporan", roles: ["owner", "admin"] },
  { href: "/open-close", label: "Buka/Tutup", roles: ["owner", "admin"] },
  { href: "/employees", label: "Karyawan", roles: ["owner"] },
  { href: "/barbers", label: "Kapster", roles: ["owner"] },
  { href: "/services", label: "Layanan", roles: ["owner"] },
  { href: "/settings", label: "Pengaturan", roles: ["owner"] },
  { href: "/profile", label: "Profil", roles: ["owner", "admin", "barber"] },
];
