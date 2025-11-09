import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Book a Trainer - ${DERRIMUT_BRAND.nameFull}`,
  description: `Book a personal trainer session at ${DERRIMUT_BRAND.nameFull}. All trainer sessions are included with your membership. Find certified trainers, check availability, and book your session today.`,
  openGraph: {
    title: `Book a Trainer - ${DERRIMUT_BRAND.nameFull}`,
    description: `Book a personal trainer session. All trainer sessions are included with your membership.`,
    type: "website",
  },
};

export default function TrainerBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

