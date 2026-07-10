import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

interface SignInProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function SignIn({ searchParams }: SignInProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;

  if (user) {
    redirect(params.redirect || "/");
  }

  return <SignInForm />;
}
