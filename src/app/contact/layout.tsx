import type { Metadata } from "next";
import { DERRIMUT_BRAND } from "@/constants/branding";

export const metadata: Metadata = {
  title: `Contact Us - ${DERRIMUT_BRAND.nameFull}`,
  description: `Get in touch with ${DERRIMUT_BRAND.nameFull}. Visit our locations across Victoria and South Australia or connect digitally. Our trainers are available 24/7, with online platform access and AI chatbot support.`,
  openGraph: {
    title: `Contact Us - ${DERRIMUT_BRAND.nameFull}`,
    description: `Get in touch with ${DERRIMUT_BRAND.nameFull}. Visit our locations across Victoria and South Australia or connect digitally.`,
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

