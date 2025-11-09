import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Terms of Service - ${DERRIMUT_BRAND.nameFull}`,
  description: `Read the Terms of Service for ${DERRIMUT_BRAND.nameFull}. Understand your rights and responsibilities when using our fitness platform, AI consultations, trainer bookings, and marketplace services.`,
  openGraph: {
    title: `Terms of Service - ${DERRIMUT_BRAND.nameFull}`,
    description: `Read the Terms of Service for ${DERRIMUT_BRAND.nameFull}.`,
    type: "website",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

