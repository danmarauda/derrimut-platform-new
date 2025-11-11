import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Join 1000+ active members supporting each other. Share progress, get motivation, and celebrate success together.",
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

