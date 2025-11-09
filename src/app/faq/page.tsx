import { FAQComponent, defaultFAQItems } from "@/components/marketing/FAQComponent";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-neutral-950 py-24">
      <FAQComponent items={defaultFAQItems} />
    </div>
  );
}