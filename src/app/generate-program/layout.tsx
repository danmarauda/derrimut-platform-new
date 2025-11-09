import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `AI Program Generator - ${DERRIMUT_BRAND.nameFull}`,
  description: `Generate personalized fitness and diet plans with AI at ${DERRIMUT_BRAND.nameFull}. Use our voice AI consultation to create custom workout and nutrition programs tailored to your goals.`,
  openGraph: {
    title: `AI Program Generator - ${DERRIMUT_BRAND.nameFull}`,
    description: `Generate personalized fitness and diet plans with AI. Use voice AI consultation for custom programs.`,
    type: "website",
  },
};

export default function GenerateProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

