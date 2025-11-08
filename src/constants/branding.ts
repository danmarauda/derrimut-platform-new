// Derrimut 24:7 Gym Branding Constants
// Used throughout the platform for consistent branding

export const DERRIMUT_BRAND = {
  // Brand Names
  name: "Derrimut 24:7 Gym",
  nameShort: "Derrimut Gym",
  nameFull: "Derrimut 24:7 Gym",
  
  // Tagline
  tagline: "Believe in Yourself",
  
  // Brand Colors (Black, Red, Yellow)
  colors: {
    primary: "#000000",      // Black
    secondary: "#FF0000",    // Red (from logo analysis)
    accent: "#FFD700",       // Gold/Yellow
    background: "#FFFFFF",
    text: "#000000",
    textMuted: "#666666",
  },
  
  // Logo Paths
  logo: {
    primary: "/logos/derrimut-logo-primary.png",
    white: "/logos/derrimut-logo-primary.png", // TODO: Create white variant (invert colors)
    icon: "/logos/derrimut-icon.png",
    favicon: "/favicon.png", // TODO: Convert to .ico format
  },
  
  // Business Details
  currency: "AUD",
  currencySymbol: "$",
  paymentFrequency: "fortnightly",
  
  // Contact (from website scraping)
  contact: {
    email: "derrimut@derrimut247.com.au",
    phone: "+61 3 8358 4356",
    website: "https://www.derrimut247.com.au",
    address: "2 Makland Dr, Derrimut, Victoria 3030",
  },
  
  // Social Media (from website scraping)
  social: {
    facebook: "https://facebook.com/derrimut247",
    instagram: "https://instagram.com/derrimut247",
    tiktok: "https://tiktok.com/@derrimut247",
    youtube: "https://youtube.com/channel/UCqzSzDMvQyovxGW23VmIzLg",
    pinterest: "https://pinterest.com.au/derrimut247",
    linkedin: "https://linkedin.com/company/derrimut247/mycompany",
  },
} as const;

// Membership Plans (Derrimut Pricing)
export const DERRIMUT_MEMBERSHIPS = {
  plans: [
    {
      id: "18-month-minimum",
      name: "18 Month Minimum",
      price: 14.95,
      currency: "AUD",
      frequency: "fortnightly",
      duration: "18 months",
      features: [
        "Access all Derrimut 24:7 gyms Australia wide",
        "24/7 access at selected locations",
        "Group fitness classes",
        "Personal trainers available",
        "Fully stocked supplement superstore",
      ],
    },
    {
      id: "12-month-minimum",
      name: "12 Month Minimum",
      price: 17.95,
      currency: "AUD",
      frequency: "fortnightly",
      duration: "12 months",
      features: [
        "Access all Derrimut 24:7 gyms Australia wide",
        "24/7 access at selected locations",
        "Group fitness classes",
        "Personal trainers available",
        "Fully stocked supplement superstore",
      ],
    },
    {
      id: "no-lock-in",
      name: "No Lock-in Contract",
      price: 19.95,
      currency: "AUD",
      frequency: "fortnightly",
      duration: "30-day cancellation notice",
      features: [
        "Access all Derrimut 24:7 gyms Australia wide",
        "24/7 access at selected locations",
        "Group fitness classes",
        "Personal trainers available",
        "Fully stocked supplement superstore",
        "Cancel anytime with 30-day notice",
      ],
    },
    {
      id: "12-month-upfront",
      name: "12 Month Upfront",
      price: 749,
      currency: "AUD",
      frequency: "one-time",
      duration: "12 months",
      features: [
        "Access all Derrimut 24:7 gyms Australia wide",
        "24/7 access at selected locations",
        "Group fitness classes",
        "Personal trainers available",
        "Fully stocked supplement superstore",
        "Best value - save on fortnightly fees",
      ],
    },
  ],
  establishmentFee: 88, // AUD
  casualPass: 20, // AUD per session
} as const;

// Export helper functions
export function getBrandName(): string {
  return DERRIMUT_BRAND.name;
}

export function getBrandTagline(): string {
  return DERRIMUT_BRAND.tagline;
}

export function formatCurrency(amount: number): string {
  return `${DERRIMUT_BRAND.currencySymbol}${amount.toFixed(2)} ${DERRIMUT_BRAND.currency}`;
}

export function formatFortnightlyPrice(amount: number): string {
  return `${formatCurrency(amount)} per fortnight`;
}

