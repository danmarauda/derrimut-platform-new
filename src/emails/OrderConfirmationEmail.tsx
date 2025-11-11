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

interface OrderConfirmationEmailProps {
  userName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export const OrderConfirmationEmail = ({
  userName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://derrimut.aliaslabs.ai";
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);
  };

  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has been confirmed!</Preview>
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
            <Heading style={h1}>Order Confirmed! 🎉</Heading>
            
            <Text style={text}>Hi {userName},</Text>
            
            <Text style={text}>
              Thank you for your order! We've received your order and will begin processing it shortly.
            </Text>

            <Section style={detailsBox}>
              <Row>
                <Column>
                  <Text style={label}>Order Number:</Text>
                  <Text style={value}>{orderNumber}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={label}>Order Date:</Text>
                  <Text style={value}>{new Date(orderDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={itemsBox}>
              <Text style={sectionTitle}>Order Items:</Text>
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={itemColumn}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemQuantity}>Quantity: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPriceColumn}>
                    <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Section style={summaryBox}>
              <Row>
                <Column>
                  <Text style={summaryLabel}>Subtotal:</Text>
                </Column>
                <Column style={summaryValueColumn}>
                  <Text style={summaryValue}>{formatPrice(subtotal)}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={summaryLabel}>Shipping:</Text>
                </Column>
                <Column style={summaryValueColumn}>
                  <Text style={summaryValue}>{formatPrice(shipping)}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={summaryLabel}>Tax (GST):</Text>
                </Column>
                <Column style={summaryValueColumn}>
                  <Text style={summaryValue}>{formatPrice(tax)}</Text>
                </Column>
              </Row>
              <Hr style={summaryHr} />
              <Row>
                <Column>
                  <Text style={totalLabel}>Total:</Text>
                </Column>
                <Column style={summaryValueColumn}>
                  <Text style={totalValue}>{formatPrice(total)}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={shippingBox}>
              <Text style={sectionTitle}>Shipping Address:</Text>
              <Text style={shippingText}>{shippingAddress.name}</Text>
              <Text style={shippingText}>{shippingAddress.addressLine1}</Text>
              {shippingAddress.addressLine2 && (
                <Text style={shippingText}>{shippingAddress.addressLine2}</Text>
              )}
              <Text style={shippingText}>
                {shippingAddress.city} {shippingAddress.postalCode}
              </Text>
              <Text style={shippingText}>{shippingAddress.country}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/profile/orders`}>
                View Order Details
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />
          
          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order? Contact us at{" "}
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

const itemsBox = {
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

const itemRow = {
  marginBottom: "16px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
};

const itemColumn = {
  width: "70%",
};

const itemPriceColumn = {
  width: "30%",
  textAlign: "right" as const,
};

const itemName = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 4px",
};

const itemQuantity = {
  color: "rgba(255, 255, 255, 0.6)", // text-white/60
  fontSize: "14px",
  margin: "0",
};

const itemPrice = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const summaryBox = {
  backgroundColor: "rgba(255, 255, 255, 0.05)", // bg-white/5 glassmorphic
  border: "1px solid rgba(255, 255, 255, 0.1)", // border-white/10
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const summaryLabel = {
  color: "rgba(255, 255, 255, 0.7)", // text-white/70
  fontSize: "14px",
  margin: "8px 0",
};

const summaryValueColumn = {
  textAlign: "right" as const,
};

const summaryValue = {
  color: "rgba(255, 255, 255, 0.9)", // text-white/90
  fontSize: "14px",
  margin: "8px 0",
};

const summaryHr = {
  borderColor: "rgba(255, 255, 255, 0.1)", // border-white/10
  borderWidth: "1px",
  borderStyle: "solid",
  margin: "16px 0",
};

const totalLabel = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "8px 0",
};

const totalValue = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "8px 0",
};

const shippingBox = {
  backgroundColor: "rgba(255, 255, 255, 0.05)", // bg-white/5 glassmorphic
  border: "1px solid rgba(255, 255, 255, 0.1)", // border-white/10
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const shippingText = {
  color: "rgba(255, 255, 255, 0.9)", // text-white/90
  fontSize: "16px",
  lineHeight: "24px",
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

export default OrderConfirmationEmail;
