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

interface BookingConfirmationEmailProps {
  userName: string;
  trainerName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  duration: number;
  bookingId: string;
}

export const BookingConfirmationEmail = ({
  userName,
  trainerName,
  sessionDate,
  sessionTime,
  sessionType,
  duration,
  bookingId,
}: BookingConfirmationEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://derrimut.aliaslabs.ai";
  
  return (
    <Html>
      <Head />
      <Preview>Your training session with {trainerName} is confirmed!</Preview>
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
            <Heading style={h1}>Booking Confirmed! 🎉</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Your training session has been successfully booked. Here are the details:
          </Text>

          <Section style={detailsBox}>
            <Row>
              <Column>
                <Text style={label}>Trainer:</Text>
                <Text style={value}>{trainerName}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Session Type:</Text>
                <Text style={value}>{sessionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Date:</Text>
                <Text style={value}>{new Date(sessionDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Time:</Text>
                <Text style={value}>{sessionTime}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Duration:</Text>
                <Text style={value}>{duration} minutes</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={label}>Booking ID:</Text>
                <Text style={value}>{bookingId}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={text}>
            We look forward to helping you achieve your fitness goals!
          </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/profile/training-sessions`}>
                View My Bookings
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />
          
          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need to reschedule or cancel? Visit your profile or contact us at{" "}
              <Link href="mailto:derrimut-support@aliaslabs.ai" style={link}>
                derrimut-support@aliaslabs.ai
              </Link>
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

export default BookingConfirmationEmail;

