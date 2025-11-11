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
  Hr,
  Row,
  Column,
  Img,
} from "@react-email/components";
import * as React from "react";

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactFormEmail = ({
  name,
  email,
  subject,
  message,
}: ContactFormEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://derrimut.aliaslabs.ai";
  
  return (
    <Html>
      <Head />
      <Preview>New contact form submission: {subject}</Preview>
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
            <Heading style={h1}>New Contact Form Submission</Heading>
            
            <Section style={detailsBox}>
              <Row>
                <Column>
                  <Text style={label}>Name:</Text>
                  <Text style={value}>{name}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Email:</Text>
                  <Text style={value}>
                    <Link href={`mailto:${email}`} style={link}>
                      {email}
                    </Link>
                  </Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Subject:</Text>
                  <Text style={value}>{subject}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Message:</Text>
                  <Text style={messageText}>{message}</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={hr} />
          
          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Reply to: <Link href={`mailto:${email}`} style={link}>{email}</Link>
            </Text>
            <Text style={footerText}>
              <Link href={baseUrl} style={link}>Visit Website</Link> • <Link href={`${baseUrl}/contact`} style={link}>Contact Page</Link>
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
  margin: "16px 0 4px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 16px",
  lineHeight: "24px",
};

const messageText = {
  color: "rgba(255, 255, 255, 0.9)", // text-white/90
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
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

export default ContactFormEmail;
