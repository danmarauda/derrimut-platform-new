import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Marketplace - ${DERRIMUT_BRAND.nameFull}`,
  description: `Shop fitness supplements, equipment, apparel, and nutrition products at ${DERRIMUT_BRAND.nameFull} marketplace. Premium quality products for your fitness journey.`,
  openGraph: {
    title: `Marketplace - ${DERRIMUT_BRAND.nameFull}`,
    description: `Shop fitness supplements, equipment, apparel, and nutrition products.`,
    type: "website",
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

