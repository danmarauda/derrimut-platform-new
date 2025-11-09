import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Recipes - ${DERRIMUT_BRAND.nameFull}`,
  description: `Discover healthy recipes for breakfast, lunch, dinner, snacks, and pre/post-workout meals at ${DERRIMUT_BRAND.nameFull}. High-protein, nutritious meals to fuel your fitness journey.`,
  openGraph: {
    title: `Recipes - ${DERRIMUT_BRAND.nameFull}`,
    description: `Discover healthy recipes for breakfast, lunch, dinner, snacks, and pre/post-workout meals.`,
    type: "website",
  },
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

