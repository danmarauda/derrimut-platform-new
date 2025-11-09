import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Blog - ${DERRIMUT_BRAND.nameFull}`,
  description: `Read fitness tips, nutrition guides, success stories, and expert insights from ${DERRIMUT_BRAND.nameFull}. Stay updated with the latest in fitness, wellness, and training.`,
  openGraph: {
    title: `Blog - ${DERRIMUT_BRAND.nameFull}`,
    description: `Read fitness tips, nutrition guides, success stories, and expert insights.`,
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

