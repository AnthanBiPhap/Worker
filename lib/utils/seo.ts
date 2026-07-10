import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants/config";

interface BuildMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description = SITE_CONFIG.description,
  path = "",
  image = "/images/og-default.jpg",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, SITE_CONFIG.url).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
