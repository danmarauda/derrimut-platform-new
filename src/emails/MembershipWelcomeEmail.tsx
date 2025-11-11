import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Row,
  Column,
  Img,
} from "@react-email/components";
import * as React from "react";

interface MembershipWelcomeEmailProps {
  userName: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  price: number;
}

export const MembershipWelcomeEmail = ({
  userName,
  membershipType,
  startDate,
  endDate,
  price,
}: MembershipWelcomeEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://derrimut.aliaslabs.ai";
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Html>
      <Head />
      <Preview>Welcome to Derrimut 24:7 Gym! Your membership is now active.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src={`${baseUrl}/logos/derrimut-logo-primary.png`}
                  width="48"
                  height="48"
                  alt="Derrimut 24:7 Gym"
                  style={logo}
                />
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={brandName}>DERRIMUT GYM</Text>
                <Text style={brandTagline}>24/7 FITNESS</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to Derrimut 24:7! 🎉</Heading>
            
            <Text style={text}>Hi {userName},</Text>
            
            <Text style={text}>
              Your membership has been successfully activated! We're excited to have you join our fitness community.
            </Text>

            <Section style={detailsBox}>
              <Row>
                <Column>
                  <Text style={label}>Membership Type:</Text>
                  <Text style={value}>{membershipType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>Start Date:</Text>
                  <Text style={value}>{formatDate(startDate)}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>End Date:</Text>
                  <Text style={value}>{formatDate(endDate)}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>Monthly Fee:</Text>
                  <Text style={value}>{formatPrice(price)}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={benefitsBox}>
              <Text style={sectionTitle}>Your Membership Includes:</Text>
              <Text style={benefitItem}>✅ 24/7 access to all Derrimut locations</Text>
              <Text style={benefitItem}>✅ State-of-the-art equipment</Text>
              <Text style={benefitItem}>✅ Free fitness assessments</Text>
              <Text style={benefitItem}>✅ Access to group classes</Text>
              <Text style={benefitItem}>✅ Personal trainer booking</Text>
              <Text style={benefitItem}>✅ AI-powered fitness plans</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/profile`}>
                View My Profile
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />
          
          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your membership? Contact us at{" "}
              <Link href="mailto:derrimut-support@aliaslabs.ai" style={link}>
                derrimut-support@aliaslabs.ai
              </Link>
              {" "}or visit any of our locations.
            </Text>
            <Text style={footerText}>
              <Link href={baseUrl} style={link}>Visit Website</Link> • <Link href={`${baseUrl}/contact`} style={link}>Contact Us</Link>
            </Text>
            <Text style={footerCopyright}>
              © 2025 Derrimut 24:7 Gym - All rights reserved
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Premium Dark Theme Styles - Matching Website Design
const main = {
  backgroundColor: "#0a0a0a", // neutral-950
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#0a0a0a", // neutral-950
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "0",
};

const header = {
  backgroundColor: "rgba(255, 255, 255, 0.05)", // bg-white/5 glassmorphic
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)", // border-white/10
  padding: "24px 32px",
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  margin: "0 auto 12px",
  display: "block",
};

const brandName = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const brandTagline = {
  color: "rgba(255, 255, 255, 0.6)", // text-white/60
  fontSize: "11px",
  fontWeight: "400",
  letterSpacing: "2px",
  margin: "0",
  textTransform: "uppercase" as const,
};

const content = {
  padding: "0 32px 32px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "600",
  letterSpacing: "-0.5px",
  margin: "0 0 24px",
  lineHeight: "1.2",
};

const text = {
  color: "rgba(255, 255, 255, 0.9)", // text-white/90
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const detailsBox = {
  backgroundColor: "rgba(255, 255, 255, 0.05)", // bg-white/5 glassmorphic
  border: "1px solid rgba(255, 255, 255, 0.1)", // border-white/10
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const label = {
  color: "rgba(255, 255, 255, 0.6)", // text-white/60
  fontSize: "13px",
  fontWeight: "500",
  letterSpacing: "0.3px",
  margin: "12px 0 4px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 16px",
  lineHeight: "24px",
};

const benefitsBox = {
  backgroundColor: "rgba(255, 255, 255, 0.05)", // bg-white/5 glassmorphic
  border: "1px solid rgba(255, 255, 255, 0.1)", // border-white/10
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  letterSpacing: "-0.3px",
  margin: "0 0 20px",
};

const benefitItem = {
  color: "rgba(255, 255, 255, 0.9)", // text-white/90
  fontSize: "16px",
  lineHeight: "28px",
  margin: "4px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626", // gym-red
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  letterSpacing: "0.3px",
  border: "none",
};

const hr = {
  borderColor: "rgba(255, 255, 255, 0.1)", // border-white/10
  borderWidth: "1px",
  borderStyle: "solid",
  margin: "32px 0",
};

const footer = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "rgba(255, 255, 255, 0.7)", // text-white/70
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const footerCopyright = {
  color: "rgba(255, 255, 255, 0.5)", // text-white/50
  fontSize: "12px",
  lineHeight: "18px",
  margin: "16px 0 0",
};

const link = {
  color: "#dc2626", // gym-red
  textDecoration: "underline",
  fontWeight: "500",
};

export default MembershipWelcomeEmail;
