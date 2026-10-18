"use client";
import { Button } from "@/components/ui/Button";
import { downloadCsv } from "@/lib/utils/csv";
export function ExportCsv({ filename, rows }: { filename: string; rows: (string | number)[][] }) {
  return <Button variant="secondary" onClick={() => downloadCsv(filename, rows)}>Export CSV</Button>;
}
