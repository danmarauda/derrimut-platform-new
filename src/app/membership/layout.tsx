import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Membership Plans - ${DERRIMUT_BRAND.nameFull}`,
  description: `Choose the perfect membership plan for your fitness journey at ${DERRIMUT_BRAND.nameFull}. All plans include unlimited trainer sessions, 24/7 access, and premium facilities across Australia.`,
  openGraph: {
    title: `Membership Plans - ${DERRIMUT_BRAND.nameFull}`,
    description: `Choose the perfect membership plan for your fitness journey. All plans include unlimited trainer sessions.`,
    type: "website",
  },
};

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

