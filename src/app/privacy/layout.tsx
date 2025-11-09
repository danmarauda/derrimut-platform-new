import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Privacy Policy - ${DERRIMUT_BRAND.nameFull}`,
  description: `Read the Privacy Policy for ${DERRIMUT_BRAND.nameFull}. Learn how we protect your personal information across our AI consultations, trainer bookings, and marketplace transactions.`,
  openGraph: {
    title: `Privacy Policy - ${DERRIMUT_BRAND.nameFull}`,
    description: `Read the Privacy Policy for ${DERRIMUT_BRAND.nameFull}.`,
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

