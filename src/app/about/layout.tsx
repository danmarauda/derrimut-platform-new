import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `About Us - ${DERRIMUT_BRAND.nameFull}`,
  description: `Learn about ${DERRIMUT_BRAND.nameFull} - Australia's premier fitness platform combining traditional gym services with cutting-edge AI technology. Discover our mission, values, and commitment to your fitness journey.`,
  openGraph: {
    title: `About Us - ${DERRIMUT_BRAND.nameFull}`,
    description: `Learn about ${DERRIMUT_BRAND.nameFull} - Australia's premier fitness platform.`,
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

