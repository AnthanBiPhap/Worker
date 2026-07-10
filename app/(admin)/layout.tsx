import { redirect } from "next/navigation";
import React from "react";
import AdminShell from "@/layout/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/");
  }

  return <AdminShell>{children}</AdminShell>;
}
