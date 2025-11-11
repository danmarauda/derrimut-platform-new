import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WinBackEmailProps {
  userName?: string;
  campaignType: "we_miss_you" | "come_back" | "special_return";
  daysSinceLastActivity: number;
  membershipType?: string;
  campaignId?: string;
}

export const WinBackEmail = ({
  userName = "Member",
  campaignType,
  daysSinceLastActivity,
  membershipType = "Premium",
  campaignId,
}: WinBackEmailProps) => {
  const getCampaignContent = () => {
    switch (campaignType) {
      case "we_miss_you":
        return {
          title: "We Miss You!",
          message: "It's been a while since we've seen you at Derrimut 24:7. We hope you're doing well!",
          cta: "Come Back Today",
          offer: "Your membership is still active - come back anytime!",
        };
      case "come_back":
        return {
          title: "Come Back to Derrimut 24:7",
          message: `It's been ${Math.floor(daysSinceLastActivity / 30)} months since your last visit. We'd love to have you back!`,
          cta: "Return to Your Fitness Journey",
          offer: "50% off your next month when you return!",
        };
      case "special_return":
        return {
          title: "Special Return Offer",
          message: `We've missed you! It's been ${Math.floor(daysSinceLastActivity / 30)} months. Let's get you back on track!`,
          cta: "Claim Your Special Offer",
          offer: "3 months for the price of 1 - Limited time offer!",
        };
    }
  };

  const content = getCampaignContent();

  return (
    <Html>
      <Head />
      <Preview>{content.message}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app"}/logo.png`}
              width="120"
              height="40"
              alt="Derrimut 24:7"
              style={logo}
            />
          </Section>

          {/* Tracking Pixel */}
          {campaignId && (
            <Img
              src={`${process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app"}/api/email/track?campaignId=${campaignId}`}
              width="1"
              height="1"
              alt=""
              style={{ display: "none" }}
            />
          )}

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>{content.title}</Heading>
            <Text style={text}>Hi {userName},</Text>
            <Text style={text}>{content.message}</Text>

            {content.offer && (
              <Section style={offerBox}>
                <Text style={offerText}>🎁 {content.offer}</Text>
              </Section>
            )}

            <Text style={text}>
              Your fitness journey doesn't have to pause. Come back and reconnect with your goals,
              your community, and yourself.
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Link
                href={`${process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app"}/check-in${campaignId ? `?campaignId=${campaignId}` : ""}`}
                style={button}
              >
                {content.cta}
              </Link>
            </Section>

            <Text style={text}>
              We're here to support you every step of the way. See you soon!
            </Text>
            <Text style={text}>The Derrimut 24:7 Team</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Derrimut 24:7 Gym | Your Fitness Journey Starts Here
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app"}/profile/settings`} style={footerLink}>
                Update Preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WinBackEmail;

// Styles
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#0a0a0a",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 24px",
  backgroundColor: "#0a0a0a",
};

const logo = {
  margin: "0 auto",
};

const contentSection = {
  padding: "32px 24px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "12px",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  margin: "0 24px",
};

const heading = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 24px",
};

const text = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const offerBox = {
  backgroundColor: "rgba(255, 77, 77, 0.1)",
  border: "1px solid rgba(255, 77, 77, 0.3)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const offerText = {
  color: "#ff4d4d",
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
};

const buttonSection = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#ff4d4d",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  border: "none",
};

const footer = {
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "4px 0",
};

const footerLink = {
  color: "rgba(255, 255, 255, 0.8)",
  textDecoration: "underline",
};

