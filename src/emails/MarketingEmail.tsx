import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
} from "@react-email/components";

interface MarketingEmailProps {
  subject: string;
  content: string;
  campaignId?: string;
  recipientClerkId?: string;
}

export default function MarketingEmail({
  subject,
  content,
  campaignId,
  recipientClerkId,
}: MarketingEmailProps) {
  const trackingUrl = campaignId && recipientClerkId
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/email/track?campaignId=${campaignId}&recipientClerkId=${recipientClerkId}&type=open`
    : "";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Derrimut Gym</Text>
          </Section>
          
          <Section style={content}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Section>

          {trackingUrl && (
            <Img
              src={trackingUrl}
              width="1"
              height="1"
              alt=""
              style={{ display: "none" }}
            />
          )}

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Derrimut Gym. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/profile/settings`} style={footerLink}>
                Manage email preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#1a1a1a",
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
  borderRadius: "8px",
};

const header = {
  padding: "20px 0",
  borderBottom: "1px solid #333",
};

const logo = {
  color: "#ef4444",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "30px 0",
  color: "#ffffff",
};

const footer = {
  padding: "20px 0",
  borderTop: "1px solid #333",
  marginTop: "20px",
};

const footerText = {
  color: "#888",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "5px 0",
};

const footerLink = {
  color: "#ef4444",
  textDecoration: "underline",
};

