import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Help & Support - ${DERRIMUT_BRAND.nameFull}`,
  description: `Get help and support for ${DERRIMUT_BRAND.nameFull}. Find answers to frequently asked questions about memberships, AI program generator, trainer bookings, marketplace, and more.`,
  openGraph: {
    title: `Help & Support - ${DERRIMUT_BRAND.nameFull}`,
    description: `Get help and support for ${DERRIMUT_BRAND.nameFull}. Find answers to frequently asked questions.`,
    type: "website",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

