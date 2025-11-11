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

interface ReferralEmailProps {
  referrerName: string;
  refereeName?: string;
  referralCode: string;
  referralLink: string;
  reward?: string;
}

export const ReferralEmail = ({
  referrerName,
  refereeName,
  referralCode,
  referralLink,
  reward = "50% off first month",
}: ReferralEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Share Derrimut 24:7 with friends and earn rewards!</Preview>
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

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={heading}>Share Derrimut 24:7!</Heading>
            <Text style={text}>Hi {referrerName},</Text>
            <Text style={text}>
              You've been crushing your fitness goals at Derrimut 24:7! Why not share the experience with friends?
            </Text>

            <Section style={codeBox}>
              <Text style={codeLabel}>Your Referral Code:</Text>
              <Text style={code}>{referralCode}</Text>
            </Section>

            <Text style={text}>
              Share this code with friends and both of you will earn rewards:
            </Text>

            <Section style={rewardBox}>
              <Text style={rewardTitle}>🎁 Your Rewards:</Text>
              <Text style={rewardText}>• You: 500 loyalty points per referral</Text>
              <Text style={rewardText}>• Your Friend: {reward}</Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Link href={referralLink} style={button}>
                Share Your Referral Code
              </Link>
            </Section>

            <Text style={text}>
              The more friends you refer, the more rewards you earn! Check your referral dashboard to track your progress.
            </Text>

            <Text style={text}>Keep up the amazing work!</Text>
            <Text style={text}>The Derrimut 24:7 Team</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Derrimut 24:7 Gym | Your Fitness Journey Starts Here
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXTJS_URL || "https://derrimut-platform.vercel.app"}/profile/referrals`} style={footerLink}>
                View Referral Dashboard
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReferralEmail;

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

const codeBox = {
  backgroundColor: "rgba(255, 77, 77, 0.1)",
  border: "2px solid rgba(255, 77, 77, 0.3)",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const codeLabel = {
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "14px",
  margin: "0 0 8px",
};

const code = {
  color: "#ff4d4d",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "4px",
  margin: "0",
  fontFamily: "monospace",
};

const rewardBox = {
  backgroundColor: "rgba(77, 255, 77, 0.1)",
  border: "1px solid rgba(77, 255, 77, 0.3)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const rewardTitle = {
  color: "#4dff4d",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const rewardText = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "16px",
  lineHeight: "1.8",
  margin: "4px 0",
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

