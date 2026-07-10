import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import type { EditableProfile } from "@/components/user-profile/types";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

function splitName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export default async function Profile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileRow } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const fallbackName = splitName(profileRow?.full_name);
  const firstName = profileRow?.first_name ?? fallbackName.firstName;
  const lastName = profileRow?.last_name ?? fallbackName.lastName;
  const fullName =
    profileRow?.full_name ?? [firstName, lastName].filter(Boolean).join(" ");

  const profile: EditableProfile = {
    fullName,
    firstName,
    lastName,
    email: user?.email ?? "",
    phone: profileRow?.phone ?? "",
    jobTitle: profileRow?.job_title ?? "",
    bio: profileRow?.bio ?? "",
    avatarUrl: profileRow?.avatar_url ?? "/images/user/owner.jpg",
    country: profileRow?.country ?? "",
    cityState: profileRow?.city_state ?? "",
    postalCode: profileRow?.postal_code ?? "",
    taxId: profileRow?.tax_id ?? "",
    facebookUrl: profileRow?.facebook_url ?? "",
    xUrl: profileRow?.x_url ?? "",
    linkedinUrl: profileRow?.linkedin_url ?? "",
    instagramUrl: profileRow?.instagram_url ?? "",
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard profile={profile} />
          <UserInfoCard profile={profile} />
          <UserAddressCard profile={profile} />
        </div>
      </div>
    </div>
  );
}
